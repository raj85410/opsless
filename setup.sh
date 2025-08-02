#!/bin/bash

# Opsless Platform Setup Script
# This script sets up the complete Opsless DevOps platform

set -e

echo "🚀 Welcome to Opsless Platform Setup!"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    print_status "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_status "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

print_success "Docker version: $(docker --version)"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker Compose version: $(docker-compose --version)"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git version: $(git --version)"

print_success "All system requirements met!"

# Create necessary directories
print_status "Creating project directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/monitoring/grafana/provisioning
mkdir -p backend/nginx/ssl

# Setup Frontend
print_status "Setting up frontend..."
cd frontend || cd .

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found. Make sure you're in the correct directory."
    exit 1
fi

print_status "Installing frontend dependencies..."
npm install

print_success "Frontend setup completed!"

# Setup Backend
print_status "Setting up backend..."
cd ../backend

if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found. Make sure you're in the correct directory."
    exit 1
fi

print_status "Installing backend dependencies..."
npm install

# Create environment file
if [ ! -f ".env" ]; then
    print_status "Creating backend environment file..."
    cp env.example .env
    print_warning "Please edit backend/.env with your configuration values"
else
    print_success "Backend environment file already exists"
fi

print_success "Backend setup completed!"

# Create Docker Compose override for development
print_status "Creating Docker Compose development configuration..."
cat > docker-compose.override.yml << EOF
version: '3.8'

services:
  backend:
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  postgres:
    environment:
      POSTGRES_PASSWORD: opsless_dev_password
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"

  elasticsearch:
    environment:
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  kibana:
    ports:
      - "5601:5601"

  prometheus:
    ports:
      - "9090:9090"

  grafana:
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3000:3000"

  minio:
    ports:
      - "9000:9000"
      - "9001:9001"

  jenkins:
    ports:
      - "8080:8080"
      - "50000:50000"
EOF

print_success "Docker Compose configuration created!"

# Create monitoring configuration
print_status "Setting up monitoring configuration..."

# Prometheus configuration
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'opsless-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Grafana datasources
mkdir -p monitoring/grafana/provisioning/datasources
cat > monitoring/grafana/provisioning/datasources/datasource.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Grafana dashboards
mkdir -p monitoring/grafana/provisioning/dashboards
cat > monitoring/grafana/provisioning/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

print_success "Monitoring configuration created!"

# Create nginx configuration
print_status "Setting up nginx configuration..."
cat > nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:5173;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
        }
    }
}
EOF

print_success "Nginx configuration created!"

# Create startup script
print_status "Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Opsless Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start all services
echo "📦 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not responding"
fi

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is not responding"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not responding"
fi

echo ""
echo "🎉 Opsless Platform is ready!"
echo ""
echo "📱 Access your applications:"
echo "   Frontend:     http://localhost:5173"
echo "   Backend API:  http://localhost:3001"
echo "   Grafana:      http://localhost:3000 (admin/admin)"
echo "   Prometheus:   http://localhost:9090"
echo "   Kibana:       http://localhost:5601"
echo "   MinIO:        http://localhost:9000 (minioadmin/minioadmin)"
echo "   Jenkins:      http://localhost:8080"
echo ""
echo "🔧 To stop all services: docker-compose down"
echo "📊 To view logs: docker-compose logs -f"
EOF

chmod +x start.sh

print_success "Startup script created!"

# Create development script
print_status "Creating development script..."
cat > dev.sh << 'EOF'
#!/bin/bash

echo "🔧 Starting Opsless Platform in development mode..."

# Start only required services
echo "📦 Starting infrastructure services..."
docker-compose up -d postgres redis elasticsearch kibana prometheus grafana minio

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 20

# Start frontend in development mode
echo "🎨 Starting frontend development server..."
cd ../frontend
npm run dev &

# Start backend in development mode
echo "⚙️  Starting backend development server..."
cd ../backend
npm run dev &

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Access your applications:"
echo "   Frontend:     http://localhost:5173"
echo "   Backend API:  http://localhost:3001"
echo "   Grafana:      http://localhost:3000 (admin/admin)"
echo "   Prometheus:   http://localhost:9090"
echo "   Kibana:       http://localhost:5601"
echo "   MinIO:        http://localhost:9000 (minioadmin/minioadmin)"
echo ""
echo "🛑 Press Ctrl+C to stop development servers"
echo "🔧 To stop infrastructure: docker-compose down"

# Wait for user to stop
wait
EOF

chmod +x dev.sh

print_success "Development script created!"

# Create database migration script
print_status "Creating database migration script..."
cat > migrate.sh << 'EOF'
#!/bin/bash

echo "🗄️  Running database migrations..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres; do
    sleep 2
done

# Run migrations
echo "📊 Running migrations..."
docker-compose exec -T backend npm run migrate

echo "✅ Database migrations completed!"
EOF

chmod +x migrate.sh

print_success "Migration script created!"

# Create cleanup script
print_status "Creating cleanup script..."
cat > cleanup.sh << 'EOF'
#!/bin/bash

echo "🧹 Cleaning up Opsless Platform..."

# Stop all services
echo "🛑 Stopping services..."
docker-compose down

# Remove volumes (optional - uncomment to remove all data)
# echo "🗑️  Removing volumes..."
# docker-compose down -v

# Remove images (optional - uncomment to remove all images)
# echo "🗑️  Removing images..."
# docker-compose down --rmi all

echo "✅ Cleanup completed!"
EOF

chmod +x cleanup.sh

print_success "Cleanup script created!"

# Final instructions
echo ""
echo "🎉 Opsless Platform Setup Completed!"
echo "====================================="
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your configuration"
echo "2. Run './start.sh' to start all services"
echo "3. Run './dev.sh' for development mode"
echo "4. Run './migrate.sh' to set up the database"
echo ""
echo "🔧 Available Scripts:"
echo "   ./start.sh     - Start all services"
echo "   ./dev.sh       - Start development environment"
echo "   ./migrate.sh   - Run database migrations"
echo "   ./cleanup.sh   - Stop and clean up services"
echo ""
echo "📚 Documentation:"
echo "   Backend:       backend/README.md"
echo "   Frontend:      README.md"
echo ""
echo "🆘 Need help? Check the documentation or create an issue."
echo ""
print_success "Setup completed successfully!" 