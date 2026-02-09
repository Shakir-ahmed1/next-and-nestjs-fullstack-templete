# Production Quick Start Guide

## 🚀 Quick Deployment

### 1. Prerequisites Check
```bash
# Verify Docker is installed
docker --version  # Should be 20.10+
docker-compose --version  # Should be 2.0+

# Verify ports are available
sudo netstat -tlnp | grep 8085  # Should return nothing
```

### 2. Configure Environment
```bash
# Copy and edit production environment
cp .env.example .env.production
nano .env.production  # or use your preferred editor
```

**Critical settings to change:**
- `DB_ROOT_PASSWORD` - Strong random password
- `DB_PASSWORD` - Strong random password  
- `AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - Your OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your OAuth secret

### 3. Deploy
```bash
# Make deployment script executable
chmod +x deploy-prod.sh

# Deploy the application
./deploy-prod.sh deploy
```

### 4. Verify
```bash
# Check service health
./deploy-prod.sh health

# View logs
./deploy-prod.sh logs
```

### 5. Access
Open your browser to: **http://localhost:8085**

---

## 📋 Common Commands

```bash
# View status
./deploy-prod.sh status

# View logs
./deploy-prod.sh logs

# Restart services
./deploy-prod.sh restart

# Backup data
./deploy-prod.sh backup

# Update application
./deploy-prod.sh update
```

---

## 🔧 Manual Deployment (without script)

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🛡️ Security Checklist

- [ ] Changed `DB_ROOT_PASSWORD` to strong password
- [ ] Changed `DB_PASSWORD` to strong password
- [ ] Generated new `AUTH_SECRET`
- [ ] Configured Google OAuth credentials
- [ ] `.env.production` is in `.gitignore`
- [ ] Database port is not exposed (only internal)
- [ ] Consider adding SSL/HTTPS (see PRODUCTION.md)

---

## 📊 Monitoring

```bash
# Service health
./deploy-prod.sh health

# Resource usage
docker stats

# Nginx access logs
docker exec twin-nginx-prod tail -f /var/log/nginx/access.log

# Backend logs
docker logs -f twin-backend-prod
```

---

## 🔄 Updates

```bash
# Pull latest code
git pull

# Zero-downtime update
./deploy-prod.sh update

# Or full redeploy
./deploy-prod.sh deploy
```

---

## 💾 Backup & Restore

```bash
# Create backup
./deploy-prod.sh backup

# Restore from backup (replace timestamp)
./deploy-prod.sh restore 20260209_123000
```

---

## 🆘 Troubleshooting

### Services won't start
```bash
# Check logs
./deploy-prod.sh logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs twin-backend-prod
```

### Port already in use
Edit `.env.production` and change `NGINX_PORT` to different port:
```env
NGINX_PORT=8086
```

### Database connection failed
```bash
# Verify database is healthy
docker-compose -f docker-compose.prod.yml ps twin-db

# Check database logs
docker logs twin-db-prod
```

### Out of disk space
```bash
# Clean old images
docker system prune -a

# Check volume sizes
docker system df -v
```

---

## 📚 Full Documentation

For complete documentation, see **[PRODUCTION.md](./PRODUCTION.md)**

---

## 🎯 Architecture Overview

```
Internet → Nginx (8085) → Frontend (3000) + Backend (3007) → Database (3306)
                       ↓
                   Uploads Volume
```

**Key Features:**
- ✅ Multi-stage Docker builds (minimal images)
- ✅ Health checks on all services
- ✅ No exposed database port
- ✅ Rate limiting & security headers
- ✅ Gzip compression & caching
- ✅ Automatic restarts
- ✅ Persistent data volumes

---

## 🔗 Useful Links

- **Application**: http://localhost:8085
- **API**: http://localhost:8085/api
- **Health Check**: http://localhost:8085/api/health

---

**Need help?** Check [PRODUCTION.md](./PRODUCTION.md) for detailed documentation.
