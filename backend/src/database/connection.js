import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database schema
const schema = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Subscription plans table
  CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    duration_days INTEGER NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    features JSONB,
    stripe_price_id VARCHAR(255),
    stripe_product_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- User subscriptions table
  CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Payment history table
  CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- AWS credentials table
  CREATE TABLE IF NOT EXISTS aws_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    access_key_id VARCHAR(255) NOT NULL,
    secret_access_key VARCHAR(255) NOT NULL,
    region VARCHAR(50) DEFAULT 'us-east-1',
    account_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Projects table
  CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repository_url VARCHAR(500),
    repository_type VARCHAR(50),
    branch VARCHAR(100) DEFAULT 'main',
    framework VARCHAR(50),
    build_command TEXT,
    output_directory VARCHAR(255),
    platform VARCHAR(50),
    region VARCHAR(50),
    domain VARCHAR(255),
    ssl_enabled BOOLEAN DEFAULT true,
    auto_scaling BOOLEAN DEFAULT false,
    min_instances INTEGER DEFAULT 1,
    max_instances INTEGER DEFAULT 3,
    environment VARCHAR(50) DEFAULT 'production',
    status VARCHAR(50) DEFAULT 'inactive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Environment variables table
  CREATE TABLE IF NOT EXISTS environment_variables (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT false,
    environment VARCHAR(50) DEFAULT 'production',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Deployment configurations table
  CREATE TABLE IF NOT EXISTS deployment_configs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    region VARCHAR(50),
    domain VARCHAR(255),
    ssl_enabled BOOLEAN DEFAULT true,
    auto_scaling BOOLEAN DEFAULT false,
    min_instances INTEGER DEFAULT 1,
    max_instances INTEGER DEFAULT 3,
    environment VARCHAR(50) DEFAULT 'production',
    config_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Deployments table
  CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    config_id INTEGER REFERENCES deployment_configs(id),
    status VARCHAR(50) DEFAULT 'pending',
    deployment_url VARCHAR(500),
    build_logs TEXT,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Build logs table
  CREATE TABLE IF NOT EXISTS build_logs (
    id SERIAL PRIMARY KEY,
    deployment_id INTEGER REFERENCES deployments(id) ON DELETE CASCADE,
    log_level VARCHAR(20) DEFAULT 'info',
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- AWS resources table
  CREATE TABLE IF NOT EXISTS aws_resources (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    status VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
  CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payment_history(user_id);
  CREATE INDEX IF NOT EXISTS idx_aws_credentials_user_id ON aws_credentials(user_id);
  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
  CREATE INDEX IF NOT EXISTS idx_build_logs_deployment_id ON build_logs(deployment_id);
  CREATE INDEX IF NOT EXISTS idx_aws_resources_user_id ON aws_resources(user_id);
`;

// Initialize database
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    await client.query(schema);
    client.release();
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export default pool; 