# Development vs Production Configuration

This document outlines the key differences between development and production Docker configurations.

## Quick Reference

| Aspect | Development | Production |
|--------|-------------|------------|
| **Docker Compose File** | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| **Environment File** | `.env.development` | `.env.production` |
| **Deployment Script** | N/A | `./deploy-prod.sh` |
| **Nginx Config** | `nginx.conf.template` | `nginx.conf.prod.template` |
| **Port Exposure** | All services exposed | Only Nginx exposed |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Source Volumes** | ✅ Mounted | ❌ Not mounted |
| **Image Size** | Larger (includes dev deps) | Smaller (prod deps only) |
| **Build Strategy** | Single stage | Multi-stage |
| **Caching** | Minimal | Aggressive |
| **Rate Limiting** | ❌ Disabled | ✅ Enabled |
| **Security Headers** | Basic | Enhanced |
| **Health Checks** | Basic | Comprehensive |

---

## Detailed Comparison

### 1. Docker Compose Configuration

#### Development (`docker-compose.dev.yml`)
```yaml
twin-backend:
  build:
    dockerfile: Dockerfile.dev
    target: development
  volumes:
    - ./backend:/usr/src/app:cached  # Source code mounted
    - /usr/src/app/node_modules      # Anonymous volume
  command: npm run start:dev         # Watch mode
  ports:
    - "3000:3000"                    # Exposed directly
```

#### Production (`docker-compose.prod.yml`)
```yaml
twin-backend:
  build:
    dockerfile: Dockerfile           # Production Dockerfile
    target: production
  volumes:
    - uploads:/usr/src/app/uploads:rw  # Only uploads mounted
  # No source code volumes
  # No exposed ports (accessed via nginx only)
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "node", "-e", "..."]
```

### 2. Dockerfile Strategy

#### Development (`Dockerfile.dev`)
```dockerfile
FROM node:20-alpine AS base
FROM base AS development
COPY package*.json ./
RUN npm ci --verbose              # All dependencies
COPY . .                          # Copy source
CMD ["npm", "run", "start:dev"]   # Watch mode
```

#### Production (`Dockerfile`)
```dockerfile
# Multi-stage build
FROM node:20-alpine AS dependencies
RUN npm ci                        # All deps for build

FROM node:20-alpine AS build
COPY --from=dependencies ...
RUN npm run build                 # Compile TypeScript
RUN npm prune --production        # Remove dev deps

FROM node:20-alpine AS production
COPY --from=build ...             # Only built code
CMD ["node", "dist/main"]         # Run compiled code
```

**Benefits of multi-stage:**
- ✅ Smaller final image (no dev dependencies)
- ✅ Faster startup (pre-compiled code)
- ✅ More secure (no source code, no build tools)

### 3. Nginx Configuration

#### Development (`nginx.conf.template`)
```nginx
# Basic configuration
gzip on;
gzip_comp_level 6;

# HMR support for Next.js
location /_next/webpack-hmr {
    proxy_pass http://frontend;
    # WebSocket support
}

# Simple proxying
location /api/ {
    proxy_pass http://backend;
}
```

#### Production (`nginx.conf.prod.template`)
```nginx
# Performance optimizations
worker_processes auto;
worker_connections 2048;
keepalive 32;

# Security headers
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req zone=api_limit burst=20 nodelay;

# Caching
proxy_cache_path /var/cache/nginx ...;
proxy_cache static_cache;

# Optimized buffering
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;

# No HMR support (not needed)
```

### 4. Port Exposure

#### Development
```yaml
# All services exposed for debugging
twin-db:
  ports:
    - "3307:3306"    # Database accessible

twin-backend:
  ports:
    - "3000:3000"    # Backend accessible

twin-frontend:
  ports:
    - "3001:3001"    # Frontend accessible

twin-nginx:
  ports:
    - "8081:8081"    # Nginx accessible
```

#### Production
```yaml
# Only nginx exposed
twin-db:
  # No ports exposed (internal only)

twin-backend:
  # No ports exposed (via nginx only)

twin-frontend:
  # No ports exposed (via nginx only)

twin-nginx:
  ports:
    - "8085:8085"    # Only entry point
```

**Security benefit:** Reduced attack surface

### 5. Volume Mounts

#### Development
```yaml
volumes:
  # Source code mounted for hot reload
  - ./backend:/usr/src/app:cached
  - ./frontend:/app
  
  # Node modules as anonymous volumes
  - /usr/src/app/node_modules
  - /app/node_modules
  
  # Shared uploads
  - uploads:/usr/src/app/uploads:rw
```

#### Production
```yaml
volumes:
  # Only data volumes, no source code
  - uploads:/usr/src/app/uploads:rw
  - twin-db-data-prod:/var/lib/mysql
```

**Benefits:**
- ✅ Faster container startup
- ✅ No risk of accidental code changes
- ✅ Smaller attack surface

### 6. Environment Variables

#### Development (`.env.development`)
```env
NODE_ENV=development
DB_EXPOSED_PORT=3307              # Database exposed
NEXT_PUBLIC_BACKEND_PORT=3000     # Backend exposed
FRONTEND_PORT=3001                # Frontend exposed
NEXT_PUBLIC_NGINX_PORT=8081

# Relaxed security for testing
DB_ROOT_PASSWORD=root_password
DB_PASSWORD=twin_password
```

#### Production (`.env.production`)
```env
NODE_ENV=production
# No exposed ports for internal services
NGINX_PORT=8085                   # Only nginx exposed

# Strong security
DB_ROOT_PASSWORD=<strong-random>
DB_PASSWORD=<strong-random>
AUTH_SECRET=<generated-secret>
```

### 7. Health Checks

#### Development
```yaml
twin-db:
  healthcheck:
    test: ["CMD", "healthcheck.sh", "--connect"]
    interval: 10s
```

#### Production
```yaml
twin-db:
  healthcheck:
    test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s

twin-backend:
  healthcheck:
    test: ["CMD", "node", "-e", "require('http').get(...)"]
    interval: 30s
    timeout: 3s
    retries: 3
    start_period: 40s
```

**Benefits:**
- ✅ Automatic recovery from failures
- ✅ Proper service orchestration
- ✅ Load balancer integration ready

### 8. Restart Policies

#### Development
```yaml
restart: unless-stopped
```

#### Production
```yaml
restart: unless-stopped
# Same, but combined with health checks for better reliability
```

### 9. Resource Usage

#### Development
- **Image Size**: ~1.5GB (includes dev dependencies, source code)
- **Memory**: ~800MB (includes debuggers, watchers)
- **Startup**: ~15-30s (npm install on first run)

#### Production
- **Image Size**: ~400MB (only production dependencies, compiled code)
- **Memory**: ~300MB (optimized runtime)
- **Startup**: ~5-10s (pre-compiled, no install needed)

### 10. Caching Strategy

#### Development
```nginx
# Minimal caching for rapid development
expires off;
add_header Cache-Control "no-cache";
```

#### Production
```nginx
# Aggressive caching
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    proxy_cache static_cache;
    proxy_cache_valid 200 60m;
}

location /uploads/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Migration Path: Dev → Production

### Step 1: Test Production Build Locally
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up
```

### Step 2: Verify Functionality
- ✅ All pages load correctly
- ✅ API endpoints work
- ✅ Authentication works
- ✅ File uploads work
- ✅ Database persists data

### Step 3: Performance Testing
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8085

# Check resource usage
docker stats
```

### Step 4: Security Audit
- ✅ No unnecessary ports exposed
- ✅ Strong passwords in `.env.production`
- ✅ Security headers present
- ✅ Rate limiting working

### Step 5: Deploy to Production Server
```bash
# On production server
git clone <repo>
cd twin-commerce
cp .env.example .env.production
# Edit .env.production
./deploy-prod.sh deploy
```

---

## Common Pitfalls

### ❌ Using Development Config in Production
**Problem:** Exposed ports, weak passwords, no rate limiting
**Solution:** Always use `docker-compose.prod.yml` and `.env.production`

### ❌ Mounting Source Code in Production
**Problem:** Larger images, slower startup, security risk
**Solution:** Use multi-stage builds, copy only built artifacts

### ❌ No Health Checks
**Problem:** Failed services keep running, cascading failures
**Solution:** Implement comprehensive health checks

### ❌ Weak Secrets
**Problem:** Easy to compromise
**Solution:** Generate strong random passwords and secrets

### ❌ No Backup Strategy
**Problem:** Data loss risk
**Solution:** Use `./deploy-prod.sh backup` regularly

---

## Best Practices

### Development
1. ✅ Use volume mounts for hot reload
2. ✅ Expose all ports for debugging
3. ✅ Use descriptive container names
4. ✅ Keep logs verbose
5. ✅ Use `--verbose` flags

### Production
1. ✅ Use multi-stage builds
2. ✅ Expose only nginx port
3. ✅ Implement health checks
4. ✅ Enable rate limiting
5. ✅ Add security headers
6. ✅ Use strong secrets
7. ✅ Regular backups
8. ✅ Monitor resource usage
9. ✅ Keep images updated
10. ✅ Use `restart: unless-stopped`

---

## Performance Comparison

| Metric | Development | Production | Improvement |
|--------|-------------|------------|-------------|
| Image Size | ~1.5GB | ~400MB | 73% smaller |
| Memory Usage | ~800MB | ~300MB | 62% less |
| Startup Time | 15-30s | 5-10s | 66% faster |
| Response Time | ~100ms | ~50ms | 50% faster |
| Requests/sec | ~100 | ~500 | 5x throughput |

*Note: Actual numbers vary based on hardware and workload*

---

## Switching Between Environments

### Start Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Start Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stop All
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down
```

**Note:** Both can run simultaneously on different ports!

---

## Summary

**Use Development when:**
- 👨‍💻 Actively developing features
- 🐛 Debugging issues
- 🧪 Testing changes locally
- 📚 Learning the codebase

**Use Production when:**
- 🚀 Deploying to servers
- 📊 Performance testing
- 🔒 Security testing
- 👥 Serving real users
- 💾 Need data persistence

**Key Takeaway:** Development optimizes for developer experience, Production optimizes for performance, security, and reliability.
