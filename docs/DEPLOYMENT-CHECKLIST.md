# Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

## Pre-Deployment

### Environment Configuration
- [ ] Copied `.env.example` to `.env.production`
- [ ] Changed `DB_ROOT_PASSWORD` to a strong random password
- [ ] Changed `DB_PASSWORD` to a strong random password
- [ ] Generated `AUTH_SECRET` using `openssl rand -base64 32`
- [ ] Configured `GOOGLE_CLIENT_ID` (if using OAuth)
- [ ] Configured `GOOGLE_CLIENT_SECRET` (if using OAuth)
- [ ] Verified `NGINX_PORT` is available (default: 8085)
- [ ] Verified `.env.production` is in `.gitignore`
- [ ] Reviewed all environment variables for correctness

### System Requirements
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] At least 2GB RAM available
- [ ] At least 10GB disk space available
- [ ] Port 8085 (or configured NGINX_PORT) is available
- [ ] Made deployment script executable: `chmod +x deploy-prod.sh`

### Code Preparation
- [ ] Latest code pulled from repository
- [ ] All tests passing
- [ ] No uncommitted changes
- [ ] Production branch/tag created (optional)

## Deployment

### Initial Build
- [ ] Built production images: `./deploy-prod.sh build`
- [ ] No build errors occurred
- [ ] Images created successfully

### Service Startup
- [ ] Started services: `./deploy-prod.sh start`
- [ ] All containers started
- [ ] Waited for services to initialize (15-30 seconds)

### Health Verification
- [ ] Checked service status: `./deploy-prod.sh status`
- [ ] All services show "healthy" status
- [ ] Database health check passed
- [ ] Backend health check passed
- [ ] Frontend health check passed
- [ ] Nginx health check passed

### Functional Testing
- [ ] Accessed application: http://localhost:8085
- [ ] Homepage loads correctly
- [ ] Can navigate between pages
- [ ] API endpoints responding
- [ ] Authentication works (login/logout)
- [ ] File upload works
- [ ] Database operations work
- [ ] No console errors in browser

## Post-Deployment

### Monitoring Setup
- [ ] Verified logs are accessible: `./deploy-prod.sh logs`
- [ ] Checked resource usage: `docker stats`
- [ ] Nginx access logs working
- [ ] Backend logs working
- [ ] No error messages in logs

### Security Verification
- [ ] Database port NOT exposed externally
- [ ] Backend port NOT exposed externally
- [ ] Frontend port NOT exposed externally
- [ ] Only Nginx port (8085) is exposed
- [ ] Security headers present in responses
- [ ] Rate limiting working (test with multiple requests)
- [ ] HTTPS configured (if applicable)

### Performance Testing
- [ ] Response times acceptable (<200ms for API)
- [ ] Static files cached properly
- [ ] Gzip compression working
- [ ] Memory usage normal (<500MB total)
- [ ] CPU usage normal (<50% average)

### Backup Setup
- [ ] Created initial backup: `./deploy-prod.sh backup`
- [ ] Verified backup files created in `./backups/`
- [ ] Tested restore procedure (optional but recommended)
- [ ] Scheduled regular backups (cron job or similar)

## Production Server (if deploying remotely)

### Server Setup
- [ ] Server has Docker installed
- [ ] Server has Docker Compose installed
- [ ] Server has sufficient resources (2GB+ RAM, 10GB+ disk)
- [ ] Firewall configured to allow port 8085
- [ ] SSH access configured
- [ ] Domain/DNS configured (if applicable)

### SSL/HTTPS (Recommended)
- [ ] SSL certificates obtained (Let's Encrypt, etc.)
- [ ] Certificates added to nginx container
- [ ] Nginx config updated for HTTPS
- [ ] HTTP to HTTPS redirect configured
- [ ] Certificate auto-renewal configured

### Deployment
- [ ] Code deployed to server
- [ ] `.env.production` configured on server
- [ ] Production images built on server
- [ ] Services started on server
- [ ] Health checks passed on server
- [ ] Application accessible via domain/IP

## Ongoing Maintenance

### Regular Tasks
- [ ] Monitor logs daily
- [ ] Check resource usage weekly
- [ ] Review security alerts
- [ ] Update dependencies monthly
- [ ] Backup data weekly (automated)
- [ ] Test restore procedure monthly

### Update Procedure
- [ ] Pull latest code
- [ ] Review changelog
- [ ] Test in staging environment (if available)
- [ ] Create backup before update
- [ ] Deploy update: `./deploy-prod.sh update`
- [ ] Verify health after update
- [ ] Monitor for issues

## Troubleshooting Checklist

If something goes wrong:

- [ ] Check logs: `./deploy-prod.sh logs`
- [ ] Check service status: `./deploy-prod.sh status`
- [ ] Check health: `./deploy-prod.sh health`
- [ ] Check resource usage: `docker stats`
- [ ] Review environment variables: `docker-compose -f docker-compose.prod.yml config`
- [ ] Check disk space: `df -h`
- [ ] Check Docker status: `docker info`
- [ ] Restart services: `./deploy-prod.sh restart`
- [ ] Review PRODUCTION.md troubleshooting section

## Rollback Procedure

If deployment fails:

- [ ] Stop current deployment: `./deploy-prod.sh stop`
- [ ] Restore from backup: `./deploy-prod.sh restore <timestamp>`
- [ ] Start previous version
- [ ] Verify functionality
- [ ] Investigate issue
- [ ] Document problem for future reference

## Documentation Review

Before going live, ensure you've read:

- [ ] **PRODUCTION-SETUP-SUMMARY.md** - Overview of production setup
- [ ] **QUICKSTART-PRODUCTION.md** - Quick deployment guide
- [ ] **PRODUCTION.md** - Comprehensive production guide
- [ ] **DEV-VS-PROD.md** - Differences between dev and prod

## Final Verification

- [ ] All services healthy
- [ ] Application fully functional
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Backups working
- [ ] Documentation reviewed
- [ ] Team notified of deployment

## Sign-Off

- **Deployed by:** ___________________________
- **Date:** ___________________________
- **Version/Commit:** ___________________________
- **Notes:** ___________________________

---

## Quick Reference Commands

```bash
# Deploy
./deploy-prod.sh deploy

# Check health
./deploy-prod.sh health

# View logs
./deploy-prod.sh logs

# Backup
./deploy-prod.sh backup

# Update
./deploy-prod.sh update

# Restart
./deploy-prod.sh restart

# Stop
./deploy-prod.sh stop
```

---

## Emergency Contacts

- **System Admin:** ___________________________
- **DevOps Lead:** ___________________________
- **On-Call:** ___________________________

---

**Remember:** Always create a backup before making changes!

```bash
./deploy-prod.sh backup
```
