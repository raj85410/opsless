// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Credentials Management
export interface Credentials {
  id: string;
  userId: string;
  githubToken?: string;
  dockerUsername?: string;
  dockerToken?: string;
  jenkinsUrl?: string;
  jenkinsUser?: string;
  jenkinsToken?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  repositoryUrl: string;
  repositoryType: 'github' | 'gitlab' | 'bitbucket';
  branch: string;
  framework: 'react' | 'vue' | 'angular' | 'node' | 'python' | 'java' | 'dotnet' | 'php' | 'go' | 'rust' | 'custom';
  buildCommand?: string;
  outputDirectory?: string;
  environmentVariables: EnvironmentVariable[];
  deploymentConfig: DeploymentConfig;
  createdAt: Date;
  updatedAt: Date;
  lastDeploymentAt?: Date;
  status: 'active' | 'inactive' | 'archived';
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
  environment: 'development' | 'staging' | 'production';
}

export interface DeploymentConfig {
  platform: 'aws' | 'gcp' | 'azure' | 'vercel' | 'netlify' | 'heroku' | 'docker' | 'kubernetes';
  region?: string;
  domain?: string;
  sslEnabled: boolean;
  autoScaling: boolean;
  minInstances?: number;
  maxInstances?: number;
  environment: 'development' | 'staging' | 'production';
}

// Deployment Types
export interface Deployment {
  id: string;
  projectId: string;
  userId: string;
  version: string;
  status: 'pending' | 'building' | 'testing' | 'deploying' | 'success' | 'failed' | 'cancelled';
  environment: 'development' | 'staging' | 'production';
  buildLogs: BuildLog[];
  deploymentUrl?: string;
  commitHash?: string;
  commitMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  errorMessage?: string;
}

export interface BuildLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  step: string;
}

// CI/CD Pipeline Types
export interface Pipeline {
  id: string;
  projectId: string;
  name: string;
  description: string;
  triggers: PipelineTrigger[];
  stages: PipelineStage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineTrigger {
  type: 'push' | 'pull_request' | 'tag' | 'manual' | 'schedule';
  branch?: string;
  schedule?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'security_scan' | 'deploy' | 'notify';
  order: number;
  isRequired: boolean;
  config: StageConfig;
}

export interface StageConfig {
  buildCommand?: string;
  testCommand?: string;
  deployCommand?: string;
  timeout?: number;
  retries?: number;
  notifications?: NotificationConfig;
}

export interface NotificationConfig {
  email?: string[];
  slack?: string;
  webhook?: string;
  onSuccess: boolean;
  onFailure: boolean;
}

// Monitoring and Analytics
export interface ProjectMetrics {
  projectId: string;
  deploymentCount: number;
  successRate: number;
  averageDeploymentTime: number;
  lastDeploymentAt?: Date;
  uptime: number;
  responseTime: number;
  errorRate: number;
  period: 'day' | 'week' | 'month';
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface CredentialsFormData {
  githubToken: string;
  dockerUsername: string;
  dockerToken: string;
  jenkinsUrl: string;
  jenkinsUser: string;
  jenkinsToken: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  repositoryUrl: string;
  repositoryType: 'github' | 'gitlab' | 'bitbucket';
  branch: string;
  framework: 'react' | 'vue' | 'angular' | 'node' | 'python' | 'java' | 'dotnet' | 'php' | 'go' | 'rust' | 'custom';
  buildCommand?: string;
  outputDirectory?: string;
  environmentVariables?: EnvironmentVariable[];
  platform: 'aws' | 'gcp' | 'azure' | 'vercel' | 'netlify' | 'heroku' | 'docker' | 'kubernetes';
  region?: string;
  domain?: string;
  sslEnabled: boolean;
  autoScaling: boolean;
  minInstances?: number;
  maxInstances?: number;
  environment: 'development' | 'staging' | 'production';
}

// Dashboard Types
export interface DashboardStats {
  totalProjects: number;
  activeDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDeploymentTime: number;
  uptimePercentage: number;
}

// Chat and Support
export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
  type?: string;
  response?: string;
  context?: {
    projectId?: string;
    deploymentId?: string;
    errorType?: string;
  };
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}