# BeSure Deployment Scripts

Automated deployment scripts for BeSure backend infrastructure.

## 📋 Available Scripts

### Deployment Scripts

#### 1. `deploy-railway.sh`
Deploy to Railway with comprehensive pre-flight checks.

```bash
cd /home/user/BeSure/backend
../scripts/deploy-railway.sh
```

**Features:**
- ✅ Pre-deployment validation (tests, type-check, lint, security)
- ✅ Production/staging environment selection
- ✅ Automatic health checks post-deployment
- ✅ Smoke test execution
- ✅ Safety confirmations for production

**Prerequisites:**
- Railway CLI installed: `npm i -g @railway/cli`
- Railway account and project set up
- Logged in: `railway login`

---

#### 2. `deploy-render.sh`
Deploy to Render via git push.

```bash
cd /home/user/BeSure/backend
../scripts/deploy-render.sh
```

**Features:**
- ✅ Pre-deployment validation
- ✅ Git branch verification
- ✅ Automatic push to correct branch (main/develop)
- ✅ Production safety confirmations
- ✅ Links to Render dashboard for monitoring

**Prerequisites:**
- Render account with project configured
- Git repository connected to Render
- `render.yaml` configured (already provided)

---

### Database Scripts

#### 3. `migrate-production.sh`
Safely apply Prisma migrations to production database.

```bash
cd /home/user/BeSure/backend
export DATABASE_URL='postgresql://user:pass@host:port/db'
../scripts/migrate-production.sh
```

**Features:**
- ✅ Automatic backup before migration
- ✅ Safety confirmations
- ✅ Migration status verification
- ✅ Rollback instructions
- ✅ Auto-cleanup of old backups

**Prerequisites:**
- PostgreSQL client tools installed: `apt-get install postgresql-client`
- DATABASE_URL environment variable set
- Database access credentials

---

#### 4. `backup-db.sh`
Create timestamped database backups.

```bash
cd /home/user/BeSure/backend
export DATABASE_URL='postgresql://user:pass@host:port/db'
../scripts/backup-db.sh
```

**Features:**
- ✅ Timestamped backup files
- ✅ Optional gzip compression
- ✅ Automatic old backup cleanup (keeps last 10)
- ✅ Restore instructions
- ✅ Cloud storage upload suggestions

**Prerequisites:**
- PostgreSQL client tools: `apt-get install postgresql-client`
- DATABASE_URL environment variable

---

### Testing Scripts

#### 5. `health-check.sh`
Verify deployed service health.

```bash
cd /home/user/BeSure
./scripts/health-check.sh https://api.besure.com
```

**Checks:**
- ✅ Health endpoint (`/api/v1/health`)
- ✅ API root accessibility
- ✅ Authentication endpoints
- ✅ CORS configuration
- ✅ Response time (<1s)
- ✅ SSL/TLS certificate (for HTTPS)

---

#### 6. `smoke-test.sh`
Test critical user flows post-deployment.

```bash
cd /home/user/BeSure
./scripts/smoke-test.sh https://api.besure.com
```

**Tests:**
- ✅ User registration flow
- ✅ User login flow
- ✅ Authenticated routes
- ✅ Question creation
- ✅ Questions feed
- ✅ Points system
- ✅ Performance (response time, concurrency)

---

### Utility Scripts

#### 7. `setup-env.sh`
Interactive environment configuration helper.

```bash
cd /home/user/BeSure/backend
../scripts/setup-env.sh
```

**Features:**
- ✅ Interactive configuration wizard
- ✅ Secure secret generation
- ✅ Development/staging/production presets
- ✅ Configuration validation
- ✅ Security warnings

**Generates:**
- `.env.development` for local development
- `.env.staging` for staging environment
- `.env.production` for production (with secure secrets)

---

## 🚀 Quick Start Deployment

### First-Time Setup

1. **Choose hosting platform** (Railway or Render)
2. **Set up environment variables:**
   ```bash
   cd backend
   ../scripts/setup-env.sh
   ```
3. **Review configuration files:**
   - Railway: `railway.json`
   - Render: `render.yaml`

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project (first time only)
railway link

# Deploy
cd backend
../scripts/deploy-railway.sh
```

### Deploy to Render

```bash
# Connect git repository to Render (via dashboard)
# Then deploy:
cd backend
../scripts/deploy-render.sh
```

---

## 🛡️ Safety Features

All deployment scripts include:

- ✅ **Pre-flight checks**: Tests, type-check, lint must pass
- ✅ **Security audit**: npm audit before deployment
- ✅ **Build verification**: Ensures code compiles
- ✅ **Production confirmations**: Extra safety for production deploys
- ✅ **Health checks**: Automatic verification post-deployment
- ✅ **Smoke tests**: Critical user flow validation

---

## 📝 Environment Variables Checklist

### Required Variables

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=<secure-random-string>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

### Recommended Variables

```bash
REDIS_URL=redis://...
SENTRY_DSN=https://...
CORS_ORIGIN=https://app.besure.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Optional Variables

```bash
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=besure-uploads
```

---

## 🔧 Troubleshooting

### Script Permission Issues

```bash
chmod +x scripts/*.sh
```

### Railway CLI Not Found

```bash
npm i -g @railway/cli
```

### PostgreSQL Client Tools Not Found

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql
```

### Health Check Fails

1. Check service logs in hosting dashboard
2. Verify DATABASE_URL is correct
3. Ensure migrations ran successfully
4. Check environment variables are set

### Migration Fails

1. Restore from backup (instructions in migration script output)
2. Check database connection
3. Verify Prisma schema is valid
4. Review migration files in `prisma/migrations/`

---

## 📚 Related Documentation

- [Production Deployment Guide](../PRODUCTION_DEPLOYMENT.md)
- [Week 1 Progress Report](../WEEK1_PROGRESS.md)
- [Backend README](../backend/README.md)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use secure secrets** for production (generated, not guessed)
3. **Rotate secrets regularly** (every 90 days minimum)
4. **Limit database access** to specific IPs when possible
5. **Enable 2FA** on hosting platforms
6. **Monitor logs** for suspicious activity
7. **Keep backups** in separate location from production

---

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review error logs from hosting platform
3. Verify environment variables are set correctly
4. Ensure database migrations are up to date

---

**Last Updated:** 2025-11-22
