# Production Deployment Guide

This guide explains how to deploy the Twin Commerce application in production using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- Ports 8085 (or your configured NGINX_PORT) available

## Quick Start

### 1. Configure Environment Variables

Copy the production environment template and configure it:

```bash
cp .env.example .env.production
```

Edit `.env.production` and update the following critical values:

```env
# Security - CHANGE THESE!
DB_ROOT_PASSWORD=<strong-random-password>
DB_PASSWORD=<strong-random-password>
AUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth (if using)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Database
DB_USERNAME=twin_user
DB_NAME=twin_commerce

# Ports (adjust if needed)
NGINX_PORT=8085
BACKEND_PORT=3007
```

### 2. Build and Start Services

```bash
# Build all images
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Verify Deployment

Check that all services are healthy:

```bash
docker-compose -f docker-compose.prod.yml ps
```

All services should show `healthy` status.

Access the application:
- **Application**: http://localhost:8085
- **API**: http://localhost:8085/api

## Production Architecture

### Service Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Nginx     │ (Port 8085)
│  (Reverse   │
│   Proxy)    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ Frontend │   │ Backend  │   │ Uploads  │
│ (Next.js)│   │ (NestJS) │   │ (Static) │
└──────────┘   └────┬─────┘   └──────────┘
                    │
                    ▼
              ┌──────────┐
              │ MariaDB  │
              └──────────┘
```

### Key Production Features

1. **Multi-stage Docker Builds**: Minimal production images
2. **Health Checks**: All services have health monitoring
3. **Security**:
   - No exposed database port
   - Backend/Frontend only accessible via Nginx
   - Security headers enabled
   - Rate limiting configured
4. **Performance**:
   - Gzip compression
   - Static file caching
   - Connection pooling
   - Optimized buffer sizes
5. **Reliability**:
   - Automatic restarts (`unless-stopped`)
   - Proper service dependencies
   - Persistent volumes for data

## Service Details

### Database (MariaDB)
- **Container**: `twin-db-prod`
- **Internal Port**: 3306 (not exposed)
- **Volume**: `twin-db-data-prod`
- **Network**: `twin-db-net`

### Backend (NestJS)
- **Container**: `twin-backend-prod`
- **Internal Port**: 3007 (not exposed)
- **Networks**: `twin-db-net`, `twin-backend-net`
- **Health Check**: `/api/health`

### Frontend (Next.js)
- **Container**: `twin-frontend-prod`
- **Internal Port**: 3000 (not exposed)
- **Network**: `twin-frontend-net`
- **Build**: Production optimized with static generation

### Nginx (Reverse Proxy)
- **Container**: `twin-nginx-prod`
- **Exposed Port**: 8085 (configurable)
- **Networks**: All networks
- **Features**:
  - Rate limiting (10 req/s for API, 30 req/s general)
  - Static file caching
  - Security headers
  - Gzip compression

## Management Commands

### Start/Stop Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.prod.yml down -v
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f twin-backend-prod

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Rebuild Services

```bash
# Rebuild all
docker-compose -f docker-compose.prod.yml build --no-cache

# Rebuild specific service
docker-compose -f docker-compose.prod.yml build --no-cache twin-backend

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Management

```bash
# Access database shell
docker exec -it twin-db-prod mysql -u twin_user -p twin_commerce

# Backup database
docker exec twin-db-prod mysqldump -u twin_user -p twin_commerce > backup.sql

# Restore database
docker exec -i twin-db-prod mysql -u twin_user -p twin_commerce < backup.sql
```

### Scale Services (if needed)

```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale twin-backend=3
```

Note: You'll need to remove `container_name` and adjust nginx upstream for load balancing.

## Monitoring

### Health Checks

All services have built-in health checks. Check status:

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Resource Usage

```bash
# View resource usage
docker stats

# Specific containers
docker stats twin-backend-prod twin-frontend-prod twin-nginx-prod
```

### Nginx Access Logs

```bash
# View access logs
docker exec twin-nginx-prod tail -f /var/log/nginx/access.log

# View error logs
docker exec twin-nginx-prod tail -f /var/log/nginx/error.log
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env.production` to version control
- Use strong, random passwords
- Rotate secrets regularly

### 2. Network Security
- Database is not exposed externally
- Backend/Frontend only accessible via Nginx
- Use HTTPS in production (add SSL certificates to Nginx)

### 3. Rate Limiting
Configured in Nginx:
- API: 10 requests/second (burst: 20)
- General: 30 requests/second (burst: 50)
- Connection limit: 10 per IP

### 4. Updates
```bash
# Pull latest base images
docker-compose -f docker-compose.prod.yml pull

# Rebuild with latest dependencies
docker-compose -f docker-compose.prod.yml build --pull
```

## SSL/HTTPS Configuration (Recommended)

For production, you should add SSL certificates. Update `nginx/Dockerfile` and `nginx/nginx.conf.prod.template`:

1. Add certificate files to nginx container
2. Update server block to listen on 443
3. Add SSL configuration
4. Redirect HTTP to HTTPS

Example:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}

server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs twin-backend-prod

# Verify environment variables
docker-compose -f docker-compose.prod.yml config
```

### Database Connection Issues

```bash
# Check database is healthy
docker-compose -f docker-compose.prod.yml ps twin-db

# Test connection
docker exec twin-backend-prod node -e "console.log(process.env.DATABASE_URL)"
```

### Port Conflicts

If port 8085 is in use, update `NGINX_PORT` in `.env.production`:

```env
NGINX_PORT=8086
```

Then restart:
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Out of Memory

Increase Docker memory limit or add resource limits to docker-compose.prod.yml:

```yaml
services:
  twin-backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

## Performance Tuning

### Nginx Caching

Static files are cached for 1 year. Clear cache:

```bash
docker exec twin-nginx-prod rm -rf /var/cache/nginx/*
docker-compose -f docker-compose.prod.yml restart twin-nginx
```

### Database Optimization

For production workloads, consider tuning MariaDB:

```yaml
twin-db:
  environment:
    MARIADB_INNODB_BUFFER_POOL_SIZE: 1G
    MARIADB_MAX_CONNECTIONS: 200
```

## Backup Strategy

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec twin-db-prod mysqldump -u twin_user -p$DB_PASSWORD twin_commerce > backup_$DATE.sql
docker run --rm -v uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .
```

### Restore from Backup

```bash
# Restore database
docker exec -i twin-db-prod mysql -u twin_user -p twin_commerce < backup_20260209.sql

# Restore uploads
docker run --rm -v uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_20260209.tar.gz -C /data
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild images
docker-compose -f docker-compose.prod.yml build

# Restart with zero-downtime (if using multiple instances)
docker-compose -f docker-compose.prod.yml up -d --no-deps --build twin-backend
docker-compose -f docker-compose.prod.yml up -d --no-deps --build twin-frontend

# Or restart all
docker-compose -f docker-compose.prod.yml up -d
```

## Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify health: `docker-compose -f docker-compose.prod.yml ps`
3. Review this guide's troubleshooting section
