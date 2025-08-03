# Opsless - Complete DevOps Automation Platform

A comprehensive DevOps platform that simplifies deployment, monitoring, and scaling of modern applications with AI-powered automation and full AWS integration.

## 🚀 Features

### Core Platform
- **Lightning Fast Deployments** - Deploy applications in seconds with optimized CI/CD pipelines
- **AI-Powered Assistant** - Generate Dockerfiles, Jenkins pipelines, and Kubernetes configurations
- **Real-time Monitoring** - Comprehensive logging and monitoring with Prometheus/Grafana integration
- **Enterprise Security** - Role-based access control and security scanning
- **Global Scale** - Multi-region deployments with automatic scaling

### AWS Integration
- **Full AWS Services Support** - EC2, ECS, Elastic Beanstalk, S3, ECR, CloudWatch
- **Secure Credentials Management** - Encrypted storage and validation of AWS credentials
- **Multi-Region Deployments** - Deploy across multiple AWS regions
- **Auto-Scaling** - Automatic scaling based on load and metrics
- **Cost Optimization** - Monitor and optimize AWS costs

### CI/CD Pipeline
- **Jenkins Integration** - Automated build and deployment pipelines
- **Docker Support** - Containerized deployments with Docker
- **Kubernetes Orchestration** - K8s deployment and management
- **Git Integration** - Support for GitHub, GitLab, and Bitbucket
- **Multi-Environment** - Development, staging, and production environments

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Stripe Integration** for payments

### Backend
- **Node.js 18+** with Express.js
- **PostgreSQL 15** for primary database
- **Redis 7** for caching and sessions
- **Elasticsearch 8.11** for log aggregation
- **JWT Authentication** with Firebase integration
- **AWS SDK** for cloud services
- **Stripe API** for subscription management

### Infrastructure
- **Docker & Docker Compose** for containerization
- **Prometheus & Grafana** for monitoring
- **Kibana** for log visualization
- **MinIO** for S3-compatible storage
- **Jenkins** for CI/CD pipelines

### AWS Services
- **EC2** - Virtual servers
- **ECS** - Container orchestration
- **Elastic Beanstalk** - Platform as a Service
- **S3** - Object storage
- **ECR** - Container registry
- **CloudWatch** - Monitoring and logging

## 📋 Prerequisites

- **Node.js 18+**
- **Docker & Docker Compose**
- **Git**
- **PostgreSQL** (optional, can use Docker)
- **Redis** (optional, can use Docker)
- **AWS Account** (for cloud deployments)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd opsless
```

### 2. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- ✅ Check system prerequisites
- ✅ Install all dependencies
- ✅ Create environment files
- ✅ Set up database (optional)
- ✅ Create startup scripts
- ✅ Build the frontend

### 3. Configure Environment

Edit the environment files with your actual configuration:

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

#### Backend (backend/.env)
```bash
# Copy from backend/env.example and update with your values
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=opsless
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS (optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 4. Start the Platform

#### Option 1: Start Both Frontend and Backend
```bash
./start-all.sh
```

#### Option 2: Start Services Separately
```bash
# Start backend only
./start-backend.sh

# Start frontend only
./start-frontend.sh
```

#### Option 3: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Platform

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/api

## 📚 Usage Guide

### 1. AWS Credentials Setup

1. Navigate to **AWS Credentials** in the sidebar
2. Click **Add New AWS Credentials**
3. Enter your AWS Access Key ID and Secret Access Key
4. Select your preferred AWS region
5. Click **Test Credentials** to verify
6. Click **Save Credentials**

### 2. Create a Project

1. Go to **Dashboard**
2. Click **Create New Project**
3. Fill in project details:
   - Name and description
   - Repository URL (GitHub/GitLab/Bitbucket)
   - Framework (React, Vue, Node.js, etc.)
   - Build configuration
4. Click **Create Project**

### 3. Deploy to AWS

1. Select your project
2. Choose deployment platform:
   - **EC2** - Virtual servers
   - **ECS** - Container orchestration
   - **Elastic Beanstalk** - Platform as a Service
3. Configure deployment settings
4. Click **Deploy**

### 4. Monitor Your Deployment

1. Go to **Monitoring** dashboard
2. View real-time metrics and logs
3. Set up alerts for critical issues
4. Monitor costs and performance

### 5. AI Assistant

1. Navigate to **AI Assistant** in the sidebar
2. Ask questions about:
   - Dockerfile generation
   - Jenkins pipeline configuration
   - Kubernetes manifests
   - Troubleshooting deployment issues
3. Get instant AI-powered responses

### 6. Subscription Management

1. Go to **Pricing** page
2. Choose a subscription plan
3. Complete payment via Stripe
4. Manage your subscription from the dashboard

## 🗄️ Database Architecture

### Primary Database (PostgreSQL)
- **Users** - User accounts and authentication
- **Projects** - Project configurations and metadata
- **Deployments** - Deployment history and status
- **AWS Credentials** - Encrypted AWS access keys
- **AWS Resources** - AWS resource tracking
- **Build Logs** - Deployment and build logs
- **Subscriptions** - User subscription data
- **Payments** - Payment history

### Cache Layer (Redis)
- **Sessions** - User session management
- **Deployment Status** - Real-time deployment status
- **Project Cache** - Frequently accessed project data
- **Rate Limiting** - API rate limiting
- **Pub/Sub** - Real-time notifications

### Log Storage (Elasticsearch)
- **Application Logs** - Structured application logging
- **Deployment Logs** - Build and deployment logs
- **Error Logs** - Error tracking and analysis
- **Performance Logs** - Performance metrics and traces

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** with configurable expiration
- **Firebase Integration** for user management
- **Role-Based Access Control** (Admin, Developer, Viewer)
- **Secure Password Policies**

### Data Protection
- **Encrypted AWS Credentials** storage
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with helmet middleware
- **CORS Configuration** for cross-origin requests

### API Security
- **Rate Limiting** per IP address
- **Input Validation** with Joi schemas
- **Request Logging** for audit trails
- **Error Handling** without sensitive data exposure

## 📊 Monitoring & Observability

### Metrics Collection
- **Prometheus** for metrics collection
- **Custom Metrics** for business KPIs
- **AWS CloudWatch** integration
- **Performance Monitoring** for all services

### Logging
- **Structured Logging** with Winston
- **Log Aggregation** with Elasticsearch
- **Log Visualization** with Kibana
- **Log Rotation** and archiving

### Alerting
- **Grafana Alerts** for critical metrics
- **Email Notifications** for important events
- **Slack Integration** for team notifications
- **Custom Webhooks** for external systems

## 🐳 Docker Support

### Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild services
docker-compose build
```

### Production Deployment
```bash
# Build production images
docker build -t opsless-frontend:latest frontend/
docker build -t opsless-backend:latest backend/

# Deploy with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

#### Backend (.env)
```bash
# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=opsless
DB_USER=postgres
DB_PASSWORD=secure-password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Integration Tests
```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📈 Performance Optimization

### Frontend
- **Code Splitting** and lazy loading
- **Service Workers** for offline support
- **CDN Integration** for static assets
- **Image Optimization** and compression

### Backend
- **Database Indexing** strategies
- **Connection Pooling** for PostgreSQL
- **Redis Caching** for frequently accessed data
- **Load Balancing** with nginx

### Infrastructure
- **Auto-scaling** based on metrics
- **Resource Optimization** recommendations
- **Cost Monitoring** and alerts
- **Performance Tuning** guides

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow **TypeScript** best practices
- Write **comprehensive tests**
- Update **documentation** for new features
- Follow **conventional commits** format
- Ensure **code quality** with linting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **User Guide**: [docs.opsless.com](https://docs.opsless.com)
- **API Documentation**: [api.opsless.com](https://api.opsless.com)
- **Tutorials**: [tutorials.opsless.com](https://tutorials.opsless.com)

### Community
- **Discord**: [discord.gg/opsless](https://discord.gg/opsless)
- **GitHub Discussions**: [github.com/opsless/discussions](https://github.com/opsless/discussions)
- **Stack Overflow**: [stackoverflow.com/questions/tagged/opsless](https://stackoverflow.com/questions/tagged/opsless)

### Support Channels
- **Email**: support@opsless.com
- **Status Page**: [status.opsless.com](https://status.opsless.com)
- **Bug Reports**: [github.com/opsless/issues](https://github.com/opsless/issues)

## 🗺️ Roadmap

### Q1 2024
- [x] Multi-cloud support (GCP, Azure)
- [x] Advanced monitoring dashboards
- [x] GitOps integration
- [ ] Mobile application

### Q2 2024
- [ ] Enterprise SSO integration
- [ ] Advanced security scanning
- [ ] Cost optimization recommendations
- [x] AI-powered troubleshooting

### Q3 2024
- [ ] Kubernetes-native deployments
- [ ] Serverless function support
- [ ] Advanced analytics
- [ ] Team collaboration features

### Q4 2024
- [ ] Edge computing support
- [ ] Advanced automation workflows
- [ ] Marketplace for integrations
- [ ] Enterprise features

## ✅ Completion Status

### Frontend Components
- [x] Authentication (Login/Signup)
- [x] Dashboard with real-time stats
- [x] Project management
- [x] AWS credentials setup
- [x] Deployment monitoring
- [x] Log viewer with filtering
- [x] AI assistant interface
- [x] Subscription management
- [x] Pricing page with Stripe integration
- [x] Profile management
- [x] Support and help pages

### Backend Services
- [x] Express.js server setup
- [x] Database connection and models
- [x] AWS SDK integration
- [x] Stripe payment processing
- [x] Email service
- [x] Cron jobs for automation
- [x] JWT authentication
- [x] Rate limiting and security
- [x] Logging with Winston
- [x] Socket.IO for real-time updates

### Infrastructure
- [x] Docker Compose configuration
- [x] Database initialization scripts
- [x] Environment configuration
- [x] Setup automation scripts
- [x] Monitoring stack (Prometheus/Grafana)
- [x] Log aggregation (Elasticsearch/Kibana)
- [x] Redis caching layer
- [x] Nginx reverse proxy

### Documentation
- [x] Comprehensive README
- [x] API reference documentation
- [x] Subscription setup guide
- [x] Getting started video script
- [x] Environment configuration guide
- [x] Database schema documentation

## 🙏 Acknowledgments

- **AWS** for cloud infrastructure services
- **Docker** for containerization technology
- **Kubernetes** for container orchestration
- **Prometheus** for monitoring and alerting
- **Grafana** for visualization
- **Elastic** for search and analytics
- **Stripe** for payment processing
- **Open Source Community** for contributions

---

**Built with ❤️ by the Opsless Team**

*Empowering developers to deploy with confidence*
