#!/bin/bash

# Opsless Platform Setup Script
# This script sets up the complete Opsless platform including frontend, backend, and database

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_VERSION="18.0.0"
        
        if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
            print_success "Node.js version $NODE_VERSION is compatible"
        else
            print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
}

# Function to check Docker
check_docker() {
    if command_exists docker; then
        print_success "Docker is installed"
        if docker info >/dev/null 2>&1; then
            print_success "Docker daemon is running"
        else
            print_warning "Docker daemon is not running. Please start Docker"
        fi
    else
        print_warning "Docker is not installed. Some features may not work"
    fi
}

# Function to check PostgreSQL
check_postgresql() {
    if command_exists psql; then
        print_success "PostgreSQL client is installed"
    else
        print_warning "PostgreSQL client is not installed. Please install PostgreSQL"
    fi
}

# Function to check Redis
check_redis() {
    if command_exists redis-cli; then
        print_success "Redis client is installed"
    else
        print_warning "Redis client is not installed. Please install Redis"
    fi
}

# Function to create logs directory
create_logs_directory() {
    print_status "Creating logs directory..."
    mkdir -p logs
    print_success "Logs directory created"
}

# Function to install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend 2>/dev/null || cd .
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Frontend dependencies installed"
    else
        print_error "package.json not found in frontend directory"
        exit 1
    fi
}

# Function to install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Backend dependencies installed"
    else
        print_error "package.json not found in backend directory"
        exit 1
    fi
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Frontend environment
    if [ ! -f ".env" ]; then
        cat > .env << EOF
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
EOF
        print_success "Frontend .env file created"
    else
        print_warning "Frontend .env file already exists"
    fi
    
    # Backend environment
    cd backend
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_success "Backend .env file created from template"
        print_warning "Please update backend/.env with your actual configuration"
    else
        print_warning "Backend .env file already exists"
    fi
    cd ..
}

# Function to setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command_exists psql; then
        read -p "Do you want to set up the database now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter PostgreSQL username (default: postgres): " DB_USER
            DB_USER=${DB_USER:-postgres}
            
            read -p "Enter PostgreSQL password: " -s DB_PASSWORD
            echo
            
            read -p "Enter database name (default: opsless): " DB_NAME
            DB_NAME=${DB_NAME:-opsless}
            
            # Create database
            PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_warning "Database may already exist"
            
            # Run initialization script
            if [ -f "backend/src/database/init.sql" ]; then
                PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $DB_NAME -f backend/src/database/init.sql
                print_success "Database initialized successfully"
            else
                print_error "Database initialization script not found"
            fi
        fi
    else
        print_warning "PostgreSQL client not found. Please set up the database manually"
    fi
}

# Function to setup Docker services
setup_docker_services() {
    print_status "Setting up Docker services..."
    
    if command_exists docker; then
        cd backend
        if [ -f "docker-compose.yml" ]; then
            read -p "Do you want to start Docker services? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose up -d
                print_success "Docker services started"
            fi
        else
            print_warning "docker-compose.yml not found"
        fi
        cd ..
    else
        print_warning "Docker not installed. Skipping Docker services setup"
    fi
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    cd frontend 2>/dev/null || cd .
    
    if [ -f "package.json" ]; then
        npm run build
        print_success "Frontend built successfully"
    else
        print_error "package.json not found in frontend directory"
    fi
}

# Function to create startup scripts
create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Frontend dev script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Starting Opsless Frontend..."
cd frontend 2>/dev/null || cd .
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Backend dev script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Starting Opsless Backend..."
cd backend
npm run dev
EOF
    chmod +x start-backend.sh
    
    # Full stack script
    cat > start-all.sh << 'EOF'
#!/bin/bash
echo "Starting Opsless Platform..."
echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../frontend 2>/dev/null || cd ..
npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
    chmod +x start-all.sh
    
    print_success "Startup scripts created"
}

# Function to display next steps
display_next_steps() {
    echo
    print_success "Setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Update environment files with your actual configuration:"
    echo "   - Frontend: .env"
    echo "   - Backend: backend/.env"
    echo
    echo "2. Start the platform:"
    echo "   - Frontend only: ./start-frontend.sh"
    echo "   - Backend only: ./start-backend.sh"
    echo "   - Both: ./start-all.sh"
    echo
    echo "3. Access the platform:"
    echo "   - Frontend: http://localhost:5173"
    echo "   - Backend API: http://localhost:3001"
    echo "   - Health check: http://localhost:3001/health"
    echo
    echo "4. Set up your AWS credentials and Stripe keys for full functionality"
    echo
}

# Main setup function
main() {
    echo "🚀 Opsless Platform Setup"
    echo "=========================="
    echo
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node_version
    check_docker
    check_postgresql
    check_redis
    echo
    
    # Create necessary directories
    create_logs_directory
    echo
    
    # Install dependencies
    print_status "Installing dependencies..."
    install_frontend_deps
    install_backend_deps
    echo
    
    # Setup environment
    setup_environment
    echo
    
    # Setup database
    setup_database
    echo
    
    # Setup Docker services
    setup_docker_services
    echo
    
    # Build frontend
    build_frontend
    echo
    
    # Create startup scripts
    create_startup_scripts
    echo
    
    # Display next steps
    display_next_steps
}

# Run main function
main "$@" 