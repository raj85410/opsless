import Joi from 'joi';
import { logger } from '../utils/logger.js';

// AWS credentials validation schema
export const awsCredentialsSchema = Joi.object({
  accessKeyId: Joi.string().required().min(20).max(20).pattern(/^AKIA[0-9A-Z]{16}$/),
  secretAccessKey: Joi.string().required().min(40).max(40),
  region: Joi.string().optional().default('us-east-1').valid(
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2',
    'ap-northeast-1', 'sa-east-1'
  ),
  accountId: Joi.string().optional().pattern(/^[0-9]{12}$/)
});

// Project validation schema
export const projectSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(1000),
  repositoryUrl: Joi.string().uri().required(),
  repositoryType: Joi.string().valid('github', 'gitlab', 'bitbucket').default('github'),
  branch: Joi.string().default('main'),
  framework: Joi.string().valid(
    'react', 'vue', 'angular', 'node', 'python', 'java', 
    'dotnet', 'php', 'go', 'rust', 'custom'
  ).required(),
  buildCommand: Joi.string().optional(),
  outputDirectory: Joi.string().optional()
});

// Deployment configuration schema
export const deploymentConfigSchema = Joi.object({
  platform: Joi.string().valid(
    'aws', 'gcp', 'azure', 'vercel', 'netlify', 'heroku', 'docker', 'kubernetes'
  ).required(),
  region: Joi.string().optional(),
  domain: Joi.string().optional(),
  sslEnabled: Joi.boolean().default(true),
  autoScaling: Joi.boolean().default(false),
  minInstances: Joi.number().integer().min(1).max(10).optional(),
  maxInstances: Joi.number().integer().min(1).max(20).optional(),
  environment: Joi.string().valid('development', 'staging', 'production').default('production')
});

// Environment variable schema
export const environmentVariableSchema = Joi.object({
  key: Joi.string().required().pattern(/^[A-Z_][A-Z0-9_]*$/),
  value: Joi.string().required(),
  isSecret: Joi.boolean().default(false),
  environment: Joi.string().valid('development', 'staging', 'production').default('production')
});

// EC2 deployment schema
export const ec2DeploymentSchema = Joi.object({
  instanceType: Joi.string().valid(
    't2.micro', 't2.small', 't2.medium', 't2.large',
    't3.micro', 't3.small', 't3.medium', 't3.large',
    'm5.large', 'm5.xlarge', 'c5.large', 'c5.xlarge'
  ).default('t2.micro'),
  keyName: Joi.string().optional(),
  securityGroupIds: Joi.array().items(Joi.string()).optional(),
  userData: Joi.string().optional()
});

// ECS deployment schema
export const ecsDeploymentSchema = Joi.object({
  clusterName: Joi.string().optional(),
  taskDefinition: Joi.object({
    image: Joi.string().required(),
    port: Joi.number().integer().min(1).max(65535).default(80),
    environment: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required()
    })).optional()
  }).required(),
  serviceName: Joi.string().optional(),
  desiredCount: Joi.number().integer().min(1).max(10).default(1)
});

// Elastic Beanstalk deployment schema
export const elasticBeanstalkDeploymentSchema = Joi.object({
  applicationName: Joi.string().optional(),
  environmentName: Joi.string().optional(),
  solutionStackName: Joi.string().optional(),
  sourceBundle: Joi.object({
    S3Bucket: Joi.string().required(),
    S3Key: Joi.string().required()
  }).optional()
});

// Validation middleware factory
export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn(`Validation failed for ${req.method} ${req.path}:`, errorMessage);
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

// Specific validation middlewares
export const validateAWSConfig = validateRequest(awsCredentialsSchema);
export const validateProject = validateRequest(projectSchema);
export const validateDeploymentConfig = validateRequest(deploymentConfigSchema);
export const validateEnvironmentVariable = validateRequest(environmentVariableSchema);
export const validateEC2Deployment = validateRequest(ec2DeploymentSchema);
export const validateECSDeployment = validateRequest(ecsDeploymentSchema);
export const validateElasticBeanstalkDeployment = validateRequest(elasticBeanstalkDeploymentSchema);

// Custom validation for query parameters
export const validatePagination = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameters',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.query = value;
  next();
};

// Validate file upload
export const validateFileUpload = (allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size: 5MB'
      });
    }

    next();
  };
};

// Validate UUID parameters
export const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuidSchema = Joi.string().guid({ version: 'uuidv4' }).required();
    const { error } = uuidSchema.validate(req.params[paramName]);

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

// Validate email format
export const validateEmail = (email) => {
  const emailSchema = Joi.string().email().required();
  const { error } = emailSchema.validate(email);
  return !error;
};

// Validate password strength
export const validatePassword = (password) => {
  const passwordSchema = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required();
  
  const { error } = passwordSchema.validate(password);
  return !error;
};

// Subscription validation schema
export const subscriptionDataSchema = Joi.object({
  planId: Joi.number().integer().min(1).required(),
  successUrl: Joi.string().uri().optional(),
  cancelUrl: Joi.string().uri().optional(),
  cancelAtPeriodEnd: Joi.boolean().optional(),
  newPlanId: Joi.number().integer().min(1).optional()
});

// Subscription validation middleware
export const validateSubscriptionData = validateRequest(subscriptionDataSchema); 