# BeSure Staging Deployment Checklist

Use this checklist to ensure a smooth staging deployment.

## 📋 Pre-Deployment Checklist

### Code Quality
- [x] All tests passing (33/33 ✅)
- [x] No TypeScript errors
- [x] No linting errors (warnings acceptable)
- [x] Code coverage at acceptable level (13.09%)
- [x] Security audit passed
- [x] Build succeeds locally

### Documentation
- [x] README.md updated
- [x] API documentation current
- [x] Environment variables documented
- [x] Deployment scripts created
- [x] Staging deployment guide created

### Infrastructure
- [ ] Hosting platform account created (Railway or Render)
- [ ] Database provisioned
- [ ] Environment variables configured
- [ ] SSL/TLS certificate configured (automatic)
- [ ] Custom domain configured (optional)

## 🚀 Deployment Steps

### Step 1: Choose Platform
- [ ] Railway (recommended for quick start)
- [ ] Render (recommended for production-ready staging)
- [ ] Other (custom setup)

### Step 2: Platform Setup

#### If using Railway:
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Create project: `railway init`
- [ ] Add PostgreSQL database
- [ ] Configure environment variables
- [ ] Deploy: `railway up`

#### If using Render:
- [ ] Sign up at render.com with GitHub
- [ ] Create PostgreSQL database
- [ ] Copy Internal Database URL
- [ ] Create Web Service from repository
- [ ] Configure environment variables
- [ ] Deploy (automatic on git push)

### Step 3: Environment Variables

Required variables configured:
- [ ] `NODE_ENV=staging`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL=<from-platform>`
- [ ] `JWT_SECRET=<generated-64-char-hex>`
- [ ] `JWT_EXPIRES_IN=1h`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `CORS_ORIGIN=<mobile-app-url>`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=1000`
- [ ] `LOG_LEVEL=debug`

Optional variables (configure if needed):
- [ ] `REDIS_URL` (for caching)
- [ ] `SENTRY_DSN` (for error tracking)
- [ ] `AWS_ACCESS_KEY_ID` (for S3 uploads)
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_S3_BUCKET`

### Step 4: Database Setup
- [ ] Database provisioned
- [ ] DATABASE_URL environment variable set
- [ ] Database accessible from application
- [ ] Migrations applied automatically (via start command)
- [ ] Database connection verified in logs

### Step 5: Deploy Application
- [ ] Code pushed to git repository
- [ ] Deployment triggered (automatic or manual)
- [ ] Build completed successfully
- [ ] Application started successfully
- [ ] No errors in deployment logs

## ✅ Post-Deployment Verification

### Automated Checks
Run these commands after deployment:

```bash
# Get your staging URL (from Railway/Render dashboard)
STAGING_URL="https://your-app.railway.app"  # or .onrender.com

# Health check (7 automated checks)
npm run deploy:health $STAGING_URL
```

Expected health checks to pass:
- [ ] Health endpoint responds (200 OK)
- [ ] API root accessible
- [ ] Auth protected route returns 401
- [ ] Questions feed accessible
- [ ] CORS configured
- [ ] Response time < 1000ms
- [ ] SSL/TLS working (if HTTPS)

```bash
# Smoke tests (15+ automated tests)
npm run deploy:smoke $STAGING_URL
```

Expected smoke tests to pass:
- [ ] User registration works
- [ ] User login works
- [ ] Authenticated routes work
- [ ] Create question works
- [ ] Get question by ID works
- [ ] Questions feed works
- [ ] User points system works
- [ ] Leaderboard accessible
- [ ] Response time acceptable
- [ ] Concurrent requests handled

### Manual Verification

#### API Testing
Test these endpoints manually:

- [ ] `GET /api/v1/health` → 200 OK
- [ ] `GET /api/v1` → 200 OK
- [ ] `POST /api/v1/auth/register` → 201 Created
- [ ] `POST /api/v1/auth/login` → 200 OK
- [ ] `GET /api/v1/auth/me` (with token) → 200 OK
- [ ] `GET /api/v1/questions/feed` → 200 OK
- [ ] `POST /api/v1/questions` (with token) → 201 Created
- [ ] `POST /api/v1/votes` (with token) → 201 Created

#### Database Verification
- [ ] Database contains tables (check via Prisma Studio or SQL client)
- [ ] Migrations applied successfully
- [ ] Can create records
- [ ] Can query records
- [ ] Foreign keys working
- [ ] Indexes created

#### Logs Review
- [ ] No error messages in logs
- [ ] Database connection successful
- [ ] Migrations applied successfully
- [ ] Server started on correct port
- [ ] Environment variables loaded
- [ ] CORS configured correctly

## 📱 Mobile App Configuration

### Update Mobile App to Use Staging

Edit `mobile/.env.development`:

```bash
API_URL=https://your-staging-url.com/api/v1
NODE_ENV=development
```

Or create `mobile/.env.staging`:

```bash
API_URL=https://your-staging-url.com/api/v1
NODE_ENV=staging
```

### Test Mobile App
- [ ] Mobile app starts successfully
- [ ] Can register new user
- [ ] Can login
- [ ] Can create question
- [ ] Can vote on question
- [ ] Push notifications work (if configured)
- [ ] Image uploads work (if S3 configured)

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique (64+ characters)
- [ ] DATABASE_URL not exposed in logs
- [ ] HTTPS enabled (automatic on Railway/Render)
- [ ] CORS restricted to known origins
- [ ] Rate limiting enabled
- [ ] No secrets committed to git
- [ ] Environment variables stored securely
- [ ] Database backups configured

## 📊 Monitoring Setup

### Error Tracking (Optional)
- [ ] Sentry account created
- [ ] SENTRY_DSN configured
- [ ] Test error sent and received
- [ ] Error notifications configured

### Analytics (Optional)
- [ ] PostHog or Mixpanel account created
- [ ] API key configured
- [ ] Test event sent and received
- [ ] Dashboards configured

### Logging
- [ ] Can access logs via platform dashboard
- [ ] Log level set appropriately (debug for staging)
- [ ] Logs contain useful information
- [ ] No sensitive data in logs

## 🔄 Ongoing Maintenance

### Daily
- [ ] Check for errors in logs
- [ ] Monitor response times
- [ ] Review error tracking (if Sentry configured)

### Weekly
- [ ] Run database backup: `npm run db:backup`
- [ ] Review and update dependencies
- [ ] Check security vulnerabilities: `npm audit`
- [ ] Review analytics (if configured)

### Monthly
- [ ] Review and optimize database queries
- [ ] Clean up old test data
- [ ] Review and update documentation
- [ ] Rotate JWT secret if needed

## 🐛 Troubleshooting

If any checks fail, refer to:
- [STAGING_DEPLOYMENT_GUIDE.md](./STAGING_DEPLOYMENT_GUIDE.md) - Troubleshooting section
- [scripts/README.md](./scripts/README.md) - Script documentation
- Platform documentation (Railway/Render)

Common issues:
1. **Database connection fails** → Check DATABASE_URL
2. **Migrations don't apply** → Run manually: `npx prisma migrate deploy`
3. **CORS errors** → Update CORS_ORIGIN to include mobile app URL
4. **500 errors** → Check logs for stack traces
5. **Slow response** → Check database query performance

## 📈 Success Metrics

Staging environment is successfully deployed when:
- [x] All automated health checks pass
- [x] All automated smoke tests pass
- [x] Manual API testing succeeds
- [x] Mobile app can connect and function
- [x] No errors in logs
- [x] Response times < 500ms
- [x] Database queries working
- [x] Authentication flow working end-to-end

## 🎉 Completion

Once all checklist items are complete:

1. Document staging URL and credentials
2. Share with team members for testing
3. Begin beta testing program
4. Monitor for issues
5. Iterate based on feedback
6. Prepare for production deployment

---

**Staging URL**: _______________________________

**Database**: _______________________________

**Deployment Date**: _______________________________

**Deployed By**: _______________________________

**Status**:
- [ ] In Progress
- [ ] Deployed - Testing
- [ ] Deployed - Stable
- [ ] Issues Found
- [ ] Ready for Beta

---

**Next Steps**: [Link to Week 2 Plan or Beta Testing Plan]
