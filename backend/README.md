# Opsless Backend API

A comprehensive backend API for the Opsless DevOps platform, providing CI/CD automation, AWS integration, and deployment management.

## 🚀 Features

- **AWS Integration**: Full AWS services integration (EC2, ECS, Elastic Beanstalk, S3, ECR)
- **Database Management**: PostgreSQL with connection pooling and migrations
- **Caching**: Redis for session management and caching
- **Logging**: Elasticsearch for log aggregation and search
- **Monitoring**: Prometheus and Grafana integration
- **Authentication**: JWT-based authentication with Firebase integration
- **Real-time**: Socket.IO for real-time updates
- **Job Queue**: Bull queue for background job processing
- **Security**: Rate limiting, CORS, input validation
- **Docker**: Complete Docker setup with docker-compose

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Search**: Elasticsearch 8.11
- **Monitoring**: Prometheus + Grafana
- **Container**: Docker + Docker Compose
- **Authentication**: JWT + Firebase
- **Validation**: Joi
- **Logging**: Winston
- **Queue**: Bull + Redis

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env
```

### 2. Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 3. Manual Setup

```bash
# Start PostgreSQL and Redis manually
# Then run the backend
npm run dev
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── database/        # Database connection and models
│   ├── utils/           # Utility functions
│   └── index.js         # Main application file
├── docker-compose.yml   # Docker services
├── Dockerfile          # Backend container
├── package.json        # Dependencies
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=opsless
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## 📚 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### AWS Management

- `GET /api/aws/credentials` - Get user's AWS credentials
- `POST /api/aws/credentials` - Save AWS credentials
- `GET /api/aws/resources/:projectId` - Get AWS resources for project
- `POST /api/aws/deploy/ec2/:projectId` - Deploy to EC2
- `POST /api/aws/deploy/ecs/:projectId` - Deploy to ECS
- `POST /api/aws/deploy/elasticbeanstalk/:projectId` - Deploy to Elastic Beanstalk

#### Projects

- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Deployments

- `GET /api/deployments` - Get deployments
- `POST /api/deployments` - Create deployment
- `GET /api/deployments/:id` - Get deployment details
- `GET /api/deployments/:id/logs` - Get deployment logs

### Example Requests

#### Save AWS Credentials

```bash
curl -X POST http://localhost:3001/api/aws/credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "accessKeyId": "AKIA...",
    "secretAccessKey": "...",
    "region": "us-east-1",
    "accountId": "123456789012"
  }'
```

#### Deploy to EC2

```bash
curl -X POST http://localhost:3001/api/aws/deploy/ec2/<project-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "instanceType": "t2.micro",
    "keyName": "my-key-pair",
    "securityGroupIds": ["sg-12345678"]
  }'
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
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
```

### AWS Credentials Table
```sql
CREATE TABLE aws_credentials (
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
```

### Projects Table
```sql
CREATE TABLE projects (
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
```

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- Firebase integration for user management
- Role-based access control (RBAC)

### Input Validation
- Joi schema validation for all inputs
- SQL injection prevention with parameterized queries
- XSS protection with helmet middleware

### Rate Limiting
- Configurable rate limiting per IP
- Separate limits for authentication endpoints

### CORS
- Configurable CORS origins
- Credentials support for authenticated requests

## 📊 Monitoring

### Health Checks
- Database connectivity
- Redis connectivity
- Elasticsearch health
- Application status

### Metrics
- Request/response times
- Error rates
- Database query performance
- AWS API call metrics

### Logging
- Structured logging with Winston
- Log rotation and archiving
- Elasticsearch integration for log search

## 🐳 Docker

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild backend
docker-compose build backend

# Access services
# Backend API: http://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# Elasticsearch: http://localhost:9200
# Kibana: http://localhost:5601
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000
# MinIO: http://localhost:9000
# Jenkins: http://localhost:8080
```

### Production
```bash
# Build production image
docker build -t opsless-backend:latest .

# Run with production environment
docker run -d \
  --name opsless-backend \
  -p 3001:3001 \
  --env-file .env.production \
  opsless-backend:latest
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Database
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 🔄 Updates

To update the backend:

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations if needed
npm run migrate

# Restart the service
docker-compose restart backend
``` 