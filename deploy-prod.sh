#!/bin/bash

# Production Deployment Script for Twin Commerce
# This script helps deploy the application in production mode

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_info "Creating from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env.production
        print_warning "Please edit .env.production and configure your production settings!"
        print_warning "Especially: DB_ROOT_PASSWORD, DB_PASSWORD, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
        exit 1
    else
        print_error ".env.example not found. Cannot create .env.production"
        exit 1
    fi
fi

# Parse command line arguments
COMMAND=${1:-help}

case $COMMAND in
    build)
        print_info "Building production Docker images..."
        docker compose -f docker-compose.prod.yml build --no-cache
        print_info "Build completed successfully!"
        ;;
    
    start)
        print_info "Starting production services..."
        docker compose -f docker-compose.prod.yml up -d
        print_info "Services started!"
        print_info "Waiting for services to be healthy..."
        sleep 10
        docker compose -f docker-compose.prod.yml ps
        ;;
    
    stop)
        print_info "Stopping production services..."
        docker compose -f docker-compose.prod.yml down
        print_info "Services stopped!"
        ;;
    
    restart)
        print_info "Restarting production services..."
        docker compose -f docker-compose.prod.yml restart
        print_info "Services restarted!"
        ;;
    
    logs)
        SERVICE=${2:-}
        if [ -z "$SERVICE" ]; then
            docker compose -f docker-compose.prod.yml logs -f
        else
            docker compose -f docker-compose.prod.yml logs -f "$SERVICE"
        fi
        ;;
    
    status)
        print_info "Service status:"
        docker compose -f docker-compose.prod.yml ps
        ;;
    
    health)
        print_info "Checking service health..."
        docker compose -f docker-compose.prod.yml ps
        echo ""
        print_info "Database health:"
        docker exec twin-db-prod mysqladmin ping -h localhost || print_error "Database unhealthy"
        echo ""
        print_info "Backend health:"
        docker exec twin-backend-prod wget -q -O- http://localhost:3000/api/health || print_error "Backend unhealthy"
        ;;
    
    deploy)
        print_info "Deploying application..."
        print_info "Step 1/4: Building images..."
        docker compose -f docker-compose.prod.yml build
        
        print_info "Step 2/4: Stopping old containers..."
        docker compose -f docker-compose.prod.yml down
        
        print_info "Step 3/4: Starting new containers..."
        docker compose -f docker-compose.prod.yml up -d
        
        print_info "Step 4/4: Waiting for services to be healthy..."
        sleep 15
        
        docker compose -f docker-compose.prod.yml ps
        print_info "Deployment completed!"
        ;;
    
    update)
        print_info "Updating application (zero-downtime)..."
        print_info "Rebuilding images..."
        docker compose -f docker-compose.prod.yml build
        
        print_info "Updating backend..."
        docker compose -f docker-compose.prod.yml up -d --no-deps --build twin-backend
        sleep 5
        
        print_info "Updating frontend..."
        docker compose -f docker-compose.prod.yml up -d --no-deps --build twin-frontend
        sleep 5
        
        print_info "Updating nginx..."
        docker compose -f docker-compose.prod.yml up -d --no-deps --build twin-nginx
        
        print_info "Update completed!"
        docker compose -f docker-compose.prod.yml ps
        ;;
    
    backup)
        BACKUP_DIR="./backups"
        mkdir -p "$BACKUP_DIR"
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        
        print_info "Creating backup..."
        
        # Backup database
        print_info "Backing up database..."
        docker exec twin-db-prod mysqldump -u root -p"${DB_ROOT_PASSWORD}" twin_commerce > "$BACKUP_DIR/db_$TIMESTAMP.sql"
        
        # Backup uploads
        print_info "Backing up uploads..."
        docker run --rm -v twin-commerce_uploads:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf "/backup/uploads_$TIMESTAMP.tar.gz" -C /data .
        
        print_info "Backup completed!"
        print_info "Database backup: $BACKUP_DIR/db_$TIMESTAMP.sql"
        print_info "Uploads backup: $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
        ;;
    
    restore)
        if [ -z "$2" ]; then
            print_error "Please specify backup timestamp (e.g., 20260209_123000)"
            exit 1
        fi
        
        TIMESTAMP=$2
        BACKUP_DIR="./backups"
        
        print_warning "This will restore database and uploads from backup $TIMESTAMP"
        read -p "Are you sure? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_info "Restore cancelled"
            exit 0
        fi
        
        # Restore database
        if [ -f "$BACKUP_DIR/db_$TIMESTAMP.sql" ]; then
            print_info "Restoring database..."
            docker exec -i twin-db-prod mysql -u root -p"${DB_ROOT_PASSWORD}" twin_commerce < "$BACKUP_DIR/db_$TIMESTAMP.sql"
        else
            print_error "Database backup not found: $BACKUP_DIR/db_$TIMESTAMP.sql"
        fi
        
        # Restore uploads
        if [ -f "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" ]; then
            print_info "Restoring uploads..."
            docker run --rm -v twin-commerce_uploads:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar xzf "/backup/uploads_$TIMESTAMP.tar.gz" -C /data
        else
            print_error "Uploads backup not found: $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
        fi
        
        print_info "Restore completed!"
        ;;
    
    clean)
        print_warning "This will remove all containers, networks, and volumes (including data)!"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_info "Cleaning up..."
            docker compose -f docker-compose.prod.yml down -v
            print_info "Cleanup completed!"
        else
            print_info "Cleanup cancelled"
        fi
        ;;
    
    shell)
        SERVICE=${2:-twin-backend}
        print_info "Opening shell in $SERVICE..."
        docker exec -it "${SERVICE}-prod" sh
        ;;
    
    db-shell)
        print_info "Opening database shell..."
        docker exec -it twin-db-prod mysql -u twin_user -p twin_commerce
        ;;
    
    help|*)
        echo "Twin Commerce Production Deployment Script"
        echo ""
        echo "Usage: ./deploy-prod.sh [command] [options]"
        echo ""
        echo "Commands:"
        echo "  build          Build production Docker images"
        echo "  start          Start all production services"
        echo "  stop           Stop all production services"
        echo "  restart        Restart all production services"
        echo "  logs [service] View logs (optionally for specific service)"
        echo "  status         Show service status"
        echo "  health         Check health of all services"
        echo "  deploy         Full deployment (build + restart)"
        echo "  update         Zero-downtime update"
        echo "  backup         Backup database and uploads"
        echo "  restore <time> Restore from backup (e.g., 20260209_123000)"
        echo "  clean          Remove all containers and volumes (WARNING: deletes data)"
        echo "  shell [service] Open shell in service (default: backend)"
        echo "  db-shell       Open database shell"
        echo "  help           Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./deploy-prod.sh deploy"
        echo "  ./deploy-prod.sh logs twin-backend"
        echo "  ./deploy-prod.sh backup"
        echo "  ./deploy-prod.sh restore 20260209_123000"
        ;;
esac
