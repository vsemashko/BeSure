# 🚀 Quick Start: Deploy BeSure to Staging

**Ready to deploy?** Follow these steps to get BeSure running on staging in 15-30 minutes.

---

## ⚡ Fastest Path: Railway (15-20 minutes)

### 1. Prerequisites
```bash
# You need:
✓ GitHub account (you have)
✓ Credit card for Railway verification (not charged on free tier)
✓ 15-20 minutes
```

### 2. Run Interactive Wizard
```bash
cd /home/user/BeSure/backend
npm run deploy:staging
```

The wizard will:
- Check all prerequisites
- Help you choose a platform (Railway/Render)
- Install Railway CLI if needed
- Guide you through Railway signup
- Configure environment variables
- Deploy your app
- Provide verification commands

### 3. Verify Deployment
After deployment completes:
```bash
# Get your Railway URL from dashboard
STAGING_URL="https://your-app.railway.app"

# Run health check (7 automated tests)
npm run deploy:health $STAGING_URL

# Run smoke tests (15+ automated tests)
npm run deploy:smoke $STAGING_URL
```

**That's it!** If all checks pass, your staging environment is live! 🎉

---

## 📚 Alternative: Manual Deployment

### Option A: Railway (Manual)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   cd /home/user/BeSure/backend
   railway init
   ```

3. **Add PostgreSQL Database**
   - Open Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Wait 30 seconds for provisioning

4. **Configure Environment**
   ```bash
   # Generate secure JWT secret
   JWT_SECRET=$(openssl rand -hex 64)

   # Set variables
   railway variables set NODE_ENV=staging
   railway variables set PORT=3000
   railway variables set JWT_SECRET="$JWT_SECRET"
   railway variables set JWT_EXPIRES_IN=1h
   railway variables set JWT_REFRESH_EXPIRES_IN=7d
   railway variables set CORS_ORIGIN="http://localhost:19006"
   railway variables set RATE_LIMIT_WINDOW_MS=900000
   railway variables set RATE_LIMIT_MAX_REQUESTS=1000
   railway variables set LOG_LEVEL=debug
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Verify**
   ```bash
   railway status  # Get your URL
   npm run deploy:health <your-url>
   npm run deploy:smoke <your-url>
   ```

### Option B: Render (Manual)

1. **Create Account**
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Dashboard → "New +" → "PostgreSQL"
   - Name: besure-staging-db
   - Plan: Free
   - Click "Create Database"
   - Copy "Internal Database URL"

3. **Create Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect your BeSure repository
   - Configure:
     - Name: `besure-backend-staging`
     - Environment: `Node`
     - Branch: `claude/review-roadmap-plan-01V2ACQe6ezD9oC2LmqowRyE`
     - Build: `cd backend && npm ci && npm run build && npx prisma generate`
     - Start: `cd backend && npx prisma migrate deploy && npm start`

4. **Configure Environment Variables**
   In Render dashboard, add:
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

5. **Deploy**
   - Click "Create Web Service"
   - Deployment starts automatically
   - Wait 3-5 minutes

6. **Verify**
   ```bash
   # Get URL from Render dashboard
   npm run deploy:health <your-url>
   npm run deploy:smoke <your-url>
   ```

---

## ✅ Deployment Checklist

After deployment, verify these items:

**Core Functionality**
- [ ] Health endpoint responds: `GET /api/v1/health`
- [ ] User registration works
- [ ] User login works
- [ ] Create question works
- [ ] Vote on question works
- [ ] Points system works

**Infrastructure**
- [ ] Database connected (check logs)
- [ ] Migrations applied
- [ ] SSL/TLS working (HTTPS)
- [ ] CORS configured correctly
- [ ] Response times < 500ms

**Mobile App**
- [ ] Update `mobile/.env.staging` with staging URL
- [ ] Test registration flow
- [ ] Test question creation
- [ ] Test voting flow

Use the automated checklist: `DEPLOYMENT_CHECKLIST.md`

---

## 🔧 Useful Commands

```bash
# Quick deployment wizard
npm run deploy:staging

# Deploy to Railway
npm run deploy:railway

# Deploy to Render
npm run deploy:render

# Health check
npm run deploy:health <url>

# Smoke tests
npm run deploy:smoke <url>

# Database backup
npm run db:backup

# Production migration
npm run db:migrate:prod

# Setup environment
npm run setup:env
```

---

## 📖 Additional Resources

- **Full Staging Guide**: [STAGING_DEPLOYMENT_GUIDE.md](./STAGING_DEPLOYMENT_GUIDE.md)
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Scripts Documentation**: [scripts/README.md](./scripts/README.md)
- **Production Guide**: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Problem: Railway CLI not found
```bash
npm install -g @railway/cli
```

### Problem: Database connection fails
- Verify DATABASE_URL is set correctly
- Check database status in platform dashboard
- Ensure database is in same region as app

### Problem: Build fails
- Check logs: `railway logs` or Render dashboard
- Verify all dependencies installed
- Run `npm run build` locally first

### Problem: Health check fails
- Wait 1-2 minutes for service to start
- Check application logs for errors
- Verify environment variables are set
- Ensure migrations ran successfully

### Problem: CORS errors
- Update CORS_ORIGIN to include your mobile app URL
- Restart service after changing environment variables

**Full troubleshooting guide**: See [STAGING_DEPLOYMENT_GUIDE.md](./STAGING_DEPLOYMENT_GUIDE.md#troubleshooting)

---

## 💰 Cost

**Railway Free Tier**:
- $5/month credit
- Includes PostgreSQL
- **Cost for staging**: $0 (under free tier)

**Render Free Tier**:
- Free web service (with limitations)
- Free PostgreSQL for 90 days, then $7/month
- **Cost for staging**: $0 for 90 days, then $7/month

Both platforms require credit card for verification but won't charge you on free tier.

---

## 🎯 Next Steps After Staging Deployment

1. **Configure Mobile App**
   ```bash
   # Update mobile/.env.staging with your staging URL
   API_URL=https://your-staging-url.com/api/v1
   ```

2. **Set up Monitoring** (Optional but recommended)
   - Sentry for error tracking
   - PostHog or Mixpanel for analytics

3. **Start Beta Testing**
   - Recruit 30-50 beta testers
   - Share staging URL with testers
   - Collect feedback

4. **Prepare for Production**
   - Review PRODUCTION_DEPLOYMENT.md
   - Plan production infrastructure
   - Set up CI/CD pipeline

---

## 🆘 Need Help?

- Check [STAGING_DEPLOYMENT_GUIDE.md](./STAGING_DEPLOYMENT_GUIDE.md) for detailed instructions
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for step-by-step verification
- See [scripts/README.md](./scripts/README.md) for script documentation
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs/

---

**Ready to deploy?** Run:
```bash
cd /home/user/BeSure/backend
npm run deploy:staging
```

Good luck! 🚀
