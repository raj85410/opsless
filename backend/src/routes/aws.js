import express from 'express';
import { 
  EC2Client, 
  DescribeInstancesCommand,
  RunInstancesCommand,
  TerminateInstancesCommand,
  DescribeSecurityGroupsCommand,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand
} from '@aws-sdk/client-ec2';
import { 
  ECSClient, 
  CreateClusterCommand,
  RegisterTaskDefinitionCommand,
  CreateServiceCommand,
  DescribeServicesCommand,
  UpdateServiceCommand
} from '@aws-sdk/client-ecs';
import { 
  S3Client, 
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { 
  ECRClient, 
  CreateRepositoryCommand,
  GetAuthorizationTokenCommand,
  DescribeRepositoriesCommand
} from '@aws-sdk/client-ecr';
import { 
  ElasticBeanstalkClient, 
  CreateApplicationCommand,
  CreateEnvironmentCommand,
  DescribeEnvironmentsCommand
} from '@aws-sdk/client-elasticbeanstalk';
import { query, getClient } from '../database/connection.js';
import { validateAWSConfig } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get AWS credentials for user
router.get('/credentials', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT id, region, account_id, is_active, created_at FROM aws_credentials WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching AWS credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AWS credentials'
    });
  }
});

// Save AWS credentials
router.post('/credentials', validateAWSConfig, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accessKeyId, secretAccessKey, region, accountId } = req.body;

    // Test AWS credentials
    const ec2Client = new EC2Client({
      region: region || 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Verify credentials by making a simple API call
    await ec2Client.send(new DescribeSecurityGroupsCommand({}));

    // Save credentials to database
    const result = await query(
      `INSERT INTO aws_credentials (user_id, access_key_id, secret_access_key, region, account_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, region, account_id, created_at`,
      [userId, accessKeyId, secretAccessKey, region || 'us-east-1', accountId]
    );

    res.status(201).json({
      success: true,
      message: 'AWS credentials saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error saving AWS credentials:', error);
    
    if (error.name === 'UnauthorizedOperation' || error.name === 'InvalidClientTokenId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid AWS credentials. Please check your Access Key ID and Secret Access Key.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save AWS credentials'
    });
  }
});

// Get AWS resources for a project
router.get('/resources/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT * FROM aws_resources 
       WHERE user_id = $1 AND project_id = $2 
       ORDER BY created_at DESC`,
      [userId, projectId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching AWS resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AWS resources'
    });
  }
});

// Deploy to EC2
router.post('/deploy/ec2/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { instanceType, keyName, securityGroupIds, userData } = req.body;

    // Get project details
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    // Get AWS credentials
    const credsResult = await query(
      'SELECT * FROM aws_credentials WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (credsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active AWS credentials found'
      });
    }

    const credentials = credsResult.rows[0];

    // Create EC2 client
    const ec2Client = new EC2Client({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key
      }
    });

    // Launch EC2 instance
    const runInstanceCommand = new RunInstancesCommand({
      ImageId: 'ami-0c02fb55956c7d316', // Amazon Linux 2 AMI
      MinCount: 1,
      MaxCount: 1,
      InstanceType: instanceType || 't2.micro',
      KeyName: keyName,
      SecurityGroupIds: securityGroupIds || [],
      UserData: userData,
      TagSpecifications: [{
        ResourceType: 'instance',
        Tags: [
          { Key: 'Name', Value: `${project.name}-deployment` },
          { Key: 'Project', Value: project.name },
          { Key: 'Environment', Value: 'production' }
        ]
      }]
    });

    const instanceResult = await ec2Client.send(runInstanceCommand);
    const instanceId = instanceResult.Instances[0].InstanceId;

    // Save resource to database
    await query(
      `INSERT INTO aws_resources (user_id, project_id, resource_type, resource_id, resource_name, region, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        projectId,
        'ec2-instance',
        instanceId,
        `${project.name}-deployment`,
        credentials.region,
        'pending',
        JSON.stringify({
          instanceType,
          keyName,
          securityGroupIds,
          launchTime: new Date().toISOString()
        })
      ]
    );

    res.json({
      success: true,
      message: 'EC2 instance deployment initiated',
      data: {
        instanceId,
        status: 'pending'
      }
    });
  } catch (error) {
    logger.error('Error deploying to EC2:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy to EC2'
    });
  }
});

// Deploy to ECS
router.post('/deploy/ecs/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { clusterName, taskDefinition, serviceName, desiredCount } = req.body;

    // Get project and credentials
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    const credsResult = await query(
      'SELECT * FROM aws_credentials WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (projectResult.rows.length === 0 || credsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project or credentials not found'
      });
    }

    const project = projectResult.rows[0];
    const credentials = credsResult.rows[0];

    // Create ECS client
    const ecsClient = new ECSClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key
      }
    });

    // Create cluster if it doesn't exist
    try {
      await ecsClient.send(new CreateClusterCommand({
        clusterName: clusterName || `${project.name}-cluster`
      }));
    } catch (error) {
      // Cluster might already exist
      logger.info('Cluster might already exist:', error.message);
    }

    // Register task definition
    const taskDefResult = await ecsClient.send(new RegisterTaskDefinitionCommand({
      family: `${project.name}-task`,
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      cpu: '256',
      memory: '512',
      executionRoleArn: 'ecsTaskExecutionRole',
      containerDefinitions: [{
        name: project.name,
        image: taskDefinition.image,
        portMappings: [{
          containerPort: taskDefinition.port || 80,
          protocol: 'tcp'
        }],
        environment: taskDefinition.environment || []
      }]
    }));

    // Create service
    const serviceResult = await ecsClient.send(new CreateServiceCommand({
      cluster: clusterName || `${project.name}-cluster`,
      serviceName: serviceName || `${project.name}-service`,
      taskDefinition: taskDefResult.taskDefinition.taskDefinitionArn,
      desiredCount: desiredCount || 1,
      launchType: 'FARGATE',
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: taskDefinition.subnets || [],
          securityGroups: taskDefinition.securityGroups || [],
          assignPublicIp: 'ENABLED'
        }
      }
    }));

    // Save resource to database
    await query(
      `INSERT INTO aws_resources (user_id, project_id, resource_type, resource_id, resource_name, region, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        projectId,
        'ecs-service',
        serviceResult.service.serviceArn,
        serviceName || `${project.name}-service`,
        credentials.region,
        'active',
        JSON.stringify({
          clusterName,
          taskDefinitionArn: taskDefResult.taskDefinition.taskDefinitionArn,
          desiredCount
        })
      ]
    );

    res.json({
      success: true,
      message: 'ECS service deployment initiated',
      data: {
        serviceArn: serviceResult.service.serviceArn,
        status: 'active'
      }
    });
  } catch (error) {
    logger.error('Error deploying to ECS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy to ECS'
    });
  }
});

// Deploy to Elastic Beanstalk
router.post('/deploy/elasticbeanstalk/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { applicationName, environmentName, solutionStackName, sourceBundle } = req.body;

    // Get project and credentials
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );

    const credsResult = await query(
      'SELECT * FROM aws_credentials WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (projectResult.rows.length === 0 || credsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project or credentials not found'
      });
    }

    const project = projectResult.rows[0];
    const credentials = credsResult.rows[0];

    // Create Elastic Beanstalk client
    const ebClient = new ElasticBeanstalkClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.access_key_id,
        secretAccessKey: credentials.secret_access_key
      }
    });

    // Create application
    const appResult = await ebClient.send(new CreateApplicationCommand({
      ApplicationName: applicationName || project.name
    }));

    // Create environment
    const envResult = await ebClient.send(new CreateEnvironmentCommand({
      ApplicationName: applicationName || project.name,
      EnvironmentName: environmentName || `${project.name}-env`,
      SolutionStackName: solutionStackName || '64bit Amazon Linux 2 v3.5.1 running Node.js 18',
      SourceBundle: sourceBundle
    }));

    // Save resource to database
    await query(
      `INSERT INTO aws_resources (user_id, project_id, resource_type, resource_id, resource_name, region, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        projectId,
        'elasticbeanstalk-environment',
        envResult.EnvironmentArn,
        environmentName || `${project.name}-env`,
        credentials.region,
        'pending',
        JSON.stringify({
          applicationName,
          solutionStackName,
          sourceBundle
        })
      ]
    );

    res.json({
      success: true,
      message: 'Elastic Beanstalk deployment initiated',
      data: {
        environmentArn: envResult.EnvironmentArn,
        status: 'pending'
      }
    });
  } catch (error) {
    logger.error('Error deploying to Elastic Beanstalk:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy to Elastic Beanstalk'
    });
  }
});

// Get deployment status
router.get('/deployment-status/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM aws_resources WHERE resource_id = $1 AND user_id = $2',
      [resourceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resource = result.rows[0];

    // Get AWS credentials
    const credsResult = await query(
      'SELECT * FROM aws_credentials WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (credsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active AWS credentials found'
      });
    }

    const credentials = credsResult.rows[0];

    let status = resource.status;

    // Check actual AWS status based on resource type
    if (resource.resource_type === 'ecs-service') {
      const ecsClient = new ECSClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.access_key_id,
          secretAccessKey: credentials.secret_access_key
        }
      });

      const serviceResult = await ecsClient.send(new DescribeServicesCommand({
        cluster: resource.metadata.clusterName,
        services: [resource.resource_name]
      }));

      if (serviceResult.services.length > 0) {
        status = serviceResult.services[0].status;
      }
    }

    res.json({
      success: true,
      data: {
        ...resource,
        status
      }
    });
  } catch (error) {
    logger.error('Error getting deployment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment status'
    });
  }
});

// Delete AWS resource
router.delete('/resources/:resourceId', async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM aws_resources WHERE resource_id = $1 AND user_id = $2',
      [resourceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resource = result.rows[0];

    // Get AWS credentials
    const credsResult = await query(
      'SELECT * FROM aws_credentials WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    );

    if (credsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active AWS credentials found'
      });
    }

    const credentials = credsResult.rows[0];

    // Delete resource based on type
    if (resource.resource_type === 'ec2-instance') {
      const ec2Client = new EC2Client({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.access_key_id,
          secretAccessKey: credentials.secret_access_key
        }
      });

      await ec2Client.send(new TerminateInstancesCommand({
        InstanceIds: [resource.resource_id]
      }));
    }

    // Remove from database
    await query(
      'DELETE FROM aws_resources WHERE resource_id = $1 AND user_id = $2',
      [resourceId, userId]
    );

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting AWS resource:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource'
    });
  }
});

export default router; 