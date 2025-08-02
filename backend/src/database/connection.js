import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'opsless',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
}

// Execute query with error handling
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get client from pool
async function getClient() {
  return await pool.connect();
}

// Close pool
async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

// Initialize database tables
async function initializeTables() {
  const createTablesQuery = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      firebase_uid VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      photo_url TEXT,
      role VARCHAR(50) DEFAULT 'developer',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      last_login_at TIMESTAMP DEFAULT NOW()
    );

    -- AWS credentials table
    CREATE TABLE IF NOT EXISTS aws_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      access_key_id VARCHAR(255) NOT NULL,
      secret_access_key VARCHAR(255) NOT NULL,
      region VARCHAR(50) DEFAULT 'us-east-1',
      account_id VARCHAR(255),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      repository_url VARCHAR(500),
      repository_type VARCHAR(50) DEFAULT 'github',
      branch VARCHAR(100) DEFAULT 'main',
      framework VARCHAR(50),
      build_command TEXT,
      output_directory VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Environment variables table
    CREATE TABLE IF NOT EXISTS environment_variables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      key VARCHAR(255) NOT NULL,
      value TEXT NOT NULL,
      is_secret BOOLEAN DEFAULT false,
      environment VARCHAR(50) DEFAULT 'production',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Deployment configurations table
    CREATE TABLE IF NOT EXISTS deployment_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      region VARCHAR(50),
      domain VARCHAR(255),
      ssl_enabled BOOLEAN DEFAULT true,
      auto_scaling BOOLEAN DEFAULT false,
      min_instances INTEGER DEFAULT 1,
      max_instances INTEGER DEFAULT 3,
      environment VARCHAR(50) DEFAULT 'production',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Deployments table
    CREATE TABLE IF NOT EXISTS deployments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      version VARCHAR(100),
      status VARCHAR(50) DEFAULT 'pending',
      environment VARCHAR(50) DEFAULT 'production',
      deployment_url TEXT,
      commit_hash VARCHAR(255),
      commit_message TEXT,
      started_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP,
      duration_ms INTEGER,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Build logs table
    CREATE TABLE IF NOT EXISTS build_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
      timestamp TIMESTAMP DEFAULT NOW(),
      level VARCHAR(20) DEFAULT 'info',
      message TEXT NOT NULL,
      step VARCHAR(100)
    );

    -- AWS resources table
    CREATE TABLE IF NOT EXISTS aws_resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      resource_type VARCHAR(50) NOT NULL,
      resource_id VARCHAR(255) NOT NULL,
      resource_name VARCHAR(255),
      region VARCHAR(50),
      status VARCHAR(50),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_project_id ON deployments(project_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
    CREATE INDEX IF NOT EXISTS idx_build_logs_deployment_id ON build_logs(deployment_id);
    CREATE INDEX IF NOT EXISTS idx_build_logs_timestamp ON build_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_aws_credentials_user_id ON aws_credentials(user_id);
    CREATE INDEX IF NOT EXISTS idx_aws_resources_user_id ON aws_resources(user_id);
    CREATE INDEX IF NOT EXISTS idx_aws_resources_project_id ON aws_resources(project_id);
  `;

  try {
    await query(createTablesQuery);
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    throw error;
  }
}

// Connect to database
async function connectDatabase() {
  try {
    await testConnection();
    await initializeTables();
    console.log('✅ Database connection established and tables ready');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export {
  pool,
  query,
  getClient,
  closePool,
  connectDatabase,
  testConnection
}; 