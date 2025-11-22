# BeSure Staging Deployment Guide

Complete step-by-step guide to deploy BeSure to staging environment.

## 🎯 Deployment Options

### Option 1: Railway (Recommended for Quick Start)
- **Pros**: Fastest setup, automatic SSL, built-in PostgreSQL, generous free tier
- **Cons**: Limited to $5/month free tier
- **Best for**: Quick staging, MVP testing, small teams

### Option 2: Render
- **Pros**: More predictable pricing, better for production scale, easy rollbacks
- **Cons**: Slightly slower cold starts on free tier
- **Best for**: Production-ready staging, scaling preparation

---

## 🚀 Option 1: Deploy to Railway

### Prerequisites
- GitHub account (already have)
- Credit card (for Railway account verification - not charged on free tier)

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Sign in with GitHub
4. Verify your account with a credit card (free $5/month credit)

### Step 2: Create New Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init

# Link to your repository
railway link
```

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create DATABASE_URL environment variable
3. Wait for database to provision (~30 seconds)

### Step 4: Configure Environment Variables

```bash
# Use the interactive setup script
cd backend
npm run setup:env

# Or manually set in Railway dashboard:
railway variables set NODE_ENV=staging
railway variables set PORT=3000
railway variables set JWT_SECRET=$(openssl rand -hex 64)
railway variables set JWT_EXPIRES_IN=1h
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set CORS_ORIGIN=http://localhost:19006
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=1000
railway variables set LOG_LEVEL=debug
```

### Step 5: Deploy

```bash
# Run the automated deployment script
cd backend
npm run deploy:railway

# Or manually:
railway up
```

### Step 6: Verify Deployment

The deployment script will automatically run health checks. You can also manually verify:

```bash
# Get your deployment URL
railway status

# Run health check
npm run deploy:health https://your-app.railway.app

# Run smoke tests
npm run deploy:smoke https://your-app.railway.app
```

### Step 7: View Logs

```bash
# View real-time logs
railway logs

# Or in the Railway dashboard
```

---

## 🚀 Option 2: Deploy to Render

### Prerequisites
- GitHub account (already have)
- Credit card (for Render account verification - not charged on free tier)

### Step 1: Create Render Account

1. Go to https://render.com/
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: besure-staging-db
   - **Database**: besure
   - **User**: besure
   - **Region**: Oregon (US West) or closest to you
   - **Plan**: Free
3. Click "Create Database"
4. Wait for database to provision (~2 minutes)
5. Copy the "Internal Database URL" for next step

### Step 3: Create Web Service

1. Click "New +" → "Blueprint"
2. Connect your BeSure repository
3. Render will detect `render.yaml` automatically
4. Or manually create Web Service:
   - **Name**: besure-backend-staging
   - **Environment**: Node
   - **Region**: Oregon (same as database)
   - **Branch**: claude/review-roadmap-plan-01V2ACQe6ezD9oC2LmqowRyE
   - **Build Command**: `cd backend && npm ci && npm run build && npx prisma generate`
   - **Start Command**: `cd backend && npx prisma migrate deploy && npm start`
   - **Plan**: Free

### Step 4: Configure Environment Variables

In Render dashboard, add environment variables:

```bash
NODE_ENV=staging
PORT=3000
DATABASE_URL=<paste-internal-database-url>
JWT_SECRET=<generate-with-openssl-rand-hex-64>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:19006
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=debug
```

To generate JWT_SECRET locally:
```bash
openssl rand -hex 64
```

### Step 5: Deploy

```bash
# Deploy via git push (triggers automatic deployment)
cd /home/user/BeSure
git push origin claude/review-roadmap-plan-01V2ACQe6ezD9oC2LmqowRyE

# Or use the deployment script
cd backend
npm run deploy:render
```

### Step 6: Monitor Deployment

1. Watch deployment progress in Render dashboard
2. Check logs for any errors
3. Wait for "Live" status (~3-5 minutes)

### Step 7: Verify Deployment

```bash
# Get your deployment URL from Render dashboard
# It will be something like: https://besure-backend-staging.onrender.com

# Run health check
npm run deploy:health https://besure-backend-staging.onrender.com

# Run smoke tests
npm run deploy:smoke https://besure-backend-staging.onrender.com
```

---

## 🔐 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment name | `staging` |
| PORT | Server port | `3000` |
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| JWT_SECRET | Secret for JWT signing | `<64-char-hex-string>` |
| JWT_EXPIRES_IN | Access token expiry | `1h` |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | `7d` |

### Recommended Variables

| Variable | Description | Example |
|----------|-------------|---------|
| CORS_ORIGIN | Allowed origins (comma-separated) | `http://localhost:19006` |
| RATE_LIMIT_WINDOW_MS | Rate limit window | `900000` (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | `1000` |
| LOG_LEVEL | Logging level | `debug` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| REDIS_URL | Redis connection string | `redis://host:6379` |
| SENTRY_DSN | Sentry error tracking | `https://...` |
| AWS_ACCESS_KEY_ID | AWS S3 access key | `AKIA...` |
| AWS_SECRET_ACCESS_KEY | AWS S3 secret | `...` |
| AWS_REGION | AWS region | `us-east-1` |
| AWS_S3_BUCKET | S3 bucket name | `besure-staging` |

---

## ✅ Post-Deployment Checklist

After deployment completes, verify:

- [ ] Health endpoint responds: `GET /api/v1/health`
- [ ] Database connection works (check logs)
- [ ] Migrations applied successfully
- [ ] User registration works
- [ ] User login works
- [ ] Create question works
- [ ] Vote on question works
- [ ] Points system works
- [ ] CORS configured correctly
- [ ] SSL/TLS working (HTTPS)
- [ ] Response times acceptable (<500ms)
- [ ] No errors in logs

### Automated Verification

```bash
# Run all checks automatically
STAGING_URL="https://your-staging-url.com"

npm run deploy:health $STAGING_URL
npm run deploy:smoke $STAGING_URL
```

---

## 🔧 Troubleshooting

### Database Connection Issues

**Problem**: `Error: P1001: Can't reach database server`

**Solution**:
```bash
# Check DATABASE_URL is set correctly
railway variables | grep DATABASE_URL
# or in Render dashboard

# Verify database is running
# In Railway: Check database service status
# In Render: Check database logs
```

### Migration Failures

**Problem**: `Error: Migration failed to apply`

**Solution**:
```bash
# Connect to database and check status
railway run npx prisma migrate status

# Force reset (WARNING: destroys data)
railway run npx prisma migrate reset

# Or manually apply migrations
railway run npx prisma migrate deploy
```

### Build Failures

**Problem**: `Error: Build failed`

**Solution**:
```bash
# Check build logs
railway logs
# or Render dashboard

# Common issues:
# 1. Missing dependencies - run npm install
# 2. TypeScript errors - run npm run type-check
# 3. Out of memory - upgrade plan or reduce concurrency
```

### Health Check Fails

**Problem**: `GET /api/v1/health returns 503`

**Solution**:
```bash
# Check application logs
railway logs --tail 100

# Common issues:
# 1. Database not connected - check DATABASE_URL
# 2. Migrations not applied - run npx prisma migrate deploy
# 3. Environment variables missing - verify all required vars set
```

### CORS Errors in Mobile App

**Problem**: `Access-Control-Allow-Origin error`

**Solution**:
```bash
# Update CORS_ORIGIN to include your mobile app URL
railway variables set CORS_ORIGIN="http://localhost:19006,https://your-staging-url.com"

# Restart service
railway restart
```

---

## 📊 Monitoring Staging Environment

### Check Application Health

```bash
# Health check
curl https://your-staging-url.com/api/v1/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-22T15:45:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Monitor Logs

```bash
# Railway
railway logs --tail 50

# Render
# Use dashboard → Service → Logs tab
```

### Check Database

```bash
# Railway
railway run npx prisma studio

# Render
# Use psql connection string from dashboard
psql <DATABASE_URL>
```

### Performance Monitoring

```bash
# Check response times
time curl https://your-staging-url.com/api/v1/health

# Load testing (simple)
for i in {1..10}; do
  curl -s -o /dev/null -w "%{time_total}\n" https://your-staging-url.com/api/v1/health
done
```

---

## 🔄 Updating Staging Environment

### Deploy New Changes

```bash
# Railway (automatic on git push)
git push origin claude/review-roadmap-plan-01V2ACQe6ezD9oC2LmqowRyE
railway up

# Render (automatic on git push)
git push origin claude/review-roadmap-plan-01V2ACQe6ezD9oC2LmqowRyE
```

### Apply Database Migrations

```bash
# Railway
railway run npx prisma migrate deploy

# Render (automatic on deployment via start command)
# Or manually:
# SSH into service and run: npx prisma migrate deploy
```

### Rollback Deployment

```bash
# Railway
railway rollback

# Render
# Dashboard → Service → Settings → Rollback to previous version
```

---

## 💰 Cost Estimates

### Railway Free Tier
- **Monthly Credit**: $5
- **Database**: PostgreSQL included
- **Bandwidth**: 100GB
- **Estimated monthly cost**: $0 (under free tier for staging)
- **When you'll need to upgrade**: 500+ users, high traffic

### Render Free Tier
- **Web Services**: Free (with limitations)
- **Database**: 90 days free, then $7/month
- **Bandwidth**: Unlimited (with rate limits)
- **Estimated monthly cost**: $0 for 90 days, then $7/month
- **When you'll need to upgrade**: 100+ concurrent connections

---

## 🚨 Important Notes

1. **Free Tier Limitations**:
   - Railway: Services sleep after inactivity (wake on request)
   - Render: Free tier has slower cold starts (~30s)
   - Both: Limited to 512MB RAM on free tier

2. **Database Backups**:
   - Railway: No automatic backups on free tier
   - Render: 7-day retention on free tier
   - **Recommendation**: Use `npm run db:backup` daily

3. **SSL/TLS**:
   - Both platforms provide free SSL certificates
   - Automatic renewal
   - No configuration needed

4. **Custom Domains**:
   - Railway: Free custom domain support
   - Render: Free custom domain support
   - Both: Need to update DNS records

---

## 📚 Next Steps After Staging Deployment

1. **Configure Mobile App** to use staging URL
2. **Set up Sentry** for error tracking
3. **Add Analytics** (PostHog or Mixpanel)
4. **Recruit Beta Testers** (30-50 users)
5. **Monitor Performance** and fix issues
6. **Collect Feedback** and iterate
7. **Prepare for Production** deployment

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs/
- **Prisma Docs**: https://www.prisma.io/docs/
- **BeSure Scripts README**: `/scripts/README.md`
- **Production Deployment Guide**: `/PRODUCTION_DEPLOYMENT.md`

---

**Last Updated**: 2025-11-22
**Status**: Ready for deployment
**Estimated Setup Time**: 15-30 minutes
