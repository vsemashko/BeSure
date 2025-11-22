# Sentry Error Tracking Setup Guide

Complete guide to configure Sentry for error tracking and performance monitoring in BeSure.

## 🎯 Overview

Sentry integration provides:
- **Real-time error tracking** - Catch and debug errors before users report them
- **Performance monitoring** - Track API response times and slow operations
- **User context** - See which users are affected by errors
- **Breadcrumb logging** - Understand the sequence of events leading to errors
- **Release tracking** - Monitor error rates across deployments

## 📋 Prerequisites

1. **Sentry Account** - Sign up at https://sentry.io/ (free tier available)
2. **Project DSN** - Get your Data Source Name from Sentry dashboard

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Sentry Project

1. Go to https://sentry.io/ and sign up (free)
2. Create a new project:
   - **Platform**: Node.js (for backend)
   - **Platform**: React Native (for mobile)
   - **Name**: BeSure Backend / BeSure Mobile
3. Copy the **DSN** (Data Source Name) from project settings

### Step 2: Configure Environment Variables

#### Backend

Add to `.env` (development) or set in Railway/Render:

```bash
SENTRY_DSN=https://your-sentry-dsn@o123456.ingest.sentry.io/7890123
```

#### Mobile

Add to `.env.example` and `app.json`:

```json
{
  "expo": {
    "extra": {
      "sentryDsn": "https://your-mobile-dsn@o123456.ingest.sentry.io/7890123"
    }
  }
}
```

### Step 3: Verify Integration

#### Backend

```bash
cd backend
npm run dev
```

Check logs for:
```
✓ Sentry initialized for development environment
```

If you see:
```
ℹ️  Sentry DSN not configured - error tracking disabled
```

Sentry is not configured (which is fine for local development).

#### Mobile

```bash
cd mobile
npm start
```

Sentry will initialize automatically if `sentryDsn` is configured.

---

## 📦 What's Already Integrated

### Backend Integration ✅

**Files Modified:**
- `backend/src/config/sentry.ts` - Sentry configuration and helper functions
- `backend/src/index.ts` - Initialize Sentry on startup
- `backend/src/api/middleware/errorHandler.ts` - Automatic error capture
- `backend/package.json` - Sentry dependencies installed

**Features:**
- ✅ Automatic error capture for 5xx errors
- ✅ Performance monitoring with sampling
- ✅ Sensitive data filtering (JWT tokens, passwords)
- ✅ User context tracking
- ✅ Breadcrumb logging
- ✅ Ignores expected errors (validation, authentication)

**Dependencies Added:**
```json
{
  "@sentry/node": "^8.x",
  "@sentry/profiling-node": "^8.x"
}
```

### Mobile Integration ✅

**Files Already Configured:**
- `mobile/src/utils/logger.ts` - Sentry integration with custom logger
- `mobile/App.tsx` - Sentry initialization
- `mobile/src/components/ErrorBoundary.tsx` - React error boundary

**Features:**
- ✅ Automatic crash reporting
- ✅ React Error Boundary integration
- ✅ User action logging with breadcrumbs
- ✅ Navigation tracking
- ✅ Performance logging
- ✅ API call tracking

**Dependencies Already Installed:**
```json
{
  "@sentry/react-native": "^6.22.0"
}
```

---

## 🔧 Configuration Details

### Backend Configuration

The backend Sentry integration (`backend/src/config/sentry.ts`) includes:

#### 1. Performance Monitoring

```typescript
tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0
```

- **Development**: 100% of transactions tracked
- **Production**: 10% sampling to reduce costs

#### 2. Sensitive Data Filtering

Automatically removes:
- Authorization headers
- Cookie headers
- Environment variables
- Request bodies with passwords

#### 3. Ignored Errors

The following errors are NOT sent to Sentry (they're expected):
- Network errors (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
- JWT errors (TokenExpiredError, JsonWebTokenError)
- Client errors (ValidationError, AuthenticationError, NotFoundError)

These are user errors, not system errors.

#### 4. Error Context

Automatically captures:
- Request method, URL, query params
- User agent, content type
- Error stack traces
- Breadcrumbs (last 100 events)

### Mobile Configuration

The mobile Sentry integration (`mobile/src/utils/logger.ts`) includes:

#### 1. Automatic Breadcrumbs

- User actions (button clicks, form submissions)
- Navigation (screen changes)
- API calls (requests and responses)
- State changes
- Performance metrics (slow operations > 1s)

#### 2. Error Capturing

Only in **production** (not development):
- Warnings → Sentry messages
- Errors → Sentry exceptions
- Crashes → Automatic reports

---

## 🎨 Usage Examples

### Backend

#### Capture Custom Errors

```typescript
import { captureException, addBreadcrumb } from '../config/sentry';

try {
  // Some operation
  await riskyOperation();
} catch (error) {
  // Add context
  addBreadcrumb('Risky operation attempted', 'operation', 'info', {
    userId: req.user.id,
    operationType: 'risky',
  });

  // Capture with context
  captureException(error as Error, {
    userId: req.user.id,
    operation: 'riskyOperation',
  });

  // Still throw or handle the error
  throw error;
}
```

#### Set User Context

```typescript
import { setUser } from '../config/sentry';

// After successful authentication
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

#### Clear User Context

```typescript
import { clearUser } from '../config/sentry';

// On logout
clearUser();
```

### Mobile

The mobile logger automatically integrates with Sentry:

#### Log User Actions

```typescript
import logger from '../utils/logger';

// Automatically creates Sentry breadcrumb
logger.logUserAction('Create Question', {
  questionType: 'public',
  optionsCount: 4,
});
```

#### Log Navigation

```typescript
// Automatically creates Sentry breadcrumb
logger.logNavigation('HomeScreen', 'CreateQuestionScreen', {
  source: 'fab',
});
```

#### Log Errors

```typescript
try {
  await apiCall();
} catch (error) {
  // Automatically sends to Sentry in production
  logger.error('API call failed', error, { endpoint: '/questions' });
}
```

---

## 🔍 Monitoring & Debugging

### Sentry Dashboard

After deployment, monitor:

1. **Issues** - Real-time error tracking
   - Filter by environment (staging/production)
   - See error frequency and affected users
   - View stack traces and context

2. **Performance** - Transaction monitoring
   - API endpoint response times
   - Slow database queries
   - Bottleneck identification

3. **Releases** - Deployment tracking
   - Compare error rates across releases
   - Identify regressions
   - Track resolution status

### Setting Up Alerts

1. Go to **Project Settings** → **Alerts**
2. Create alert rules:
   - **High error rate**: > 10 errors/minute
   - **New issue**: First occurrence of an error
   - **Regression**: Error returns after being resolved

3. Configure notifications:
   - Email
   - Slack integration
   - PagerDuty (for production)

---

## 💰 Cost Optimization

### Free Tier Limits

**Sentry Free Plan:**
- 5,000 errors/month
- 10,000 transactions/month
- 30-day data retention

### Optimization Tips

1. **Sampling in Production**
   - Already configured to 10% for backend
   - Reduces transaction quota usage
   - Still captures all errors

2. **Ignore Expected Errors**
   - Validation errors (user mistakes)
   - Auth errors (invalid tokens)
   - Network timeouts (temporary issues)
   - Already configured in `ignoreErrors`

3. **Release Tracking**
   - Group errors by release
   - Identify which deployment caused issues
   - Automatically configured

4. **Monitor Quota Usage**
   - Check Sentry dashboard regularly
   - Adjust sampling rates if needed
   - Upgrade only when necessary

---

## 🐛 Troubleshooting

### Backend: "Sentry DSN not configured"

**Problem**: See this log message:
```
ℹ️  Sentry DSN not configured - error tracking disabled
```

**Solution**:
1. Check `SENTRY_DSN` is set in environment
   ```bash
   echo $SENTRY_DSN
   ```
2. Verify DSN format is correct:
   ```
   https://abc123@o123456.ingest.sentry.io/7890123
   ```
3. For local development, this is expected (Sentry disabled)

### Mobile: Sentry Not Capturing Errors

**Problem**: Errors not showing in Sentry dashboard

**Solutions**:
1. **Check Development Mode**
   - Sentry only works in production builds
   - Test with: `eas build --profile preview`

2. **Verify DSN Configuration**
   ```typescript
   // In mobile/App.tsx
   console.log('Sentry DSN:', SENTRY_DSN);
   ```

3. **Check Error Boundary**
   - Ensure `ErrorBoundary` wraps your app
   - Test with intentional error

### Errors Not Showing in Dashboard

**Common Causes**:

1. **Error is Ignored**
   - Check `ignoreErrors` in `sentry.ts`
   - Validation/auth errors are intentionally ignored

2. **4xx Errors Not Sent**
   - Only 5xx (server errors) sent to Sentry
   - 4xx are client errors (expected)

3. **Development Environment**
   - Sentry disabled in dev mode for mobile
   - Backend sends errors in all environments

---

## 📊 Best Practices

### DO ✅

- ✅ Add breadcrumbs before risky operations
- ✅ Include relevant context with errors
- ✅ Set user context after authentication
- ✅ Clear user context on logout
- ✅ Use sampling in production (already configured)
- ✅ Monitor Sentry dashboard regularly
- ✅ Set up alerts for critical errors

### DON'T ❌

- ❌ Send passwords or tokens to Sentry (automatically filtered)
- ❌ Capture expected errors (validation, auth failures)
- ❌ Use 100% sampling in production (too expensive)
- ❌ Ignore errors without investigating first
- ❌ Log sensitive user data in context

---

## 🔗 Additional Resources

- **Sentry Docs**: https://docs.sentry.io/
- **Node.js Setup**: https://docs.sentry.io/platforms/node/
- **React Native Setup**: https://docs.sentry.io/platforms/react-native/
- **Performance Monitoring**: https://docs.sentry.io/product/performance/
- **Best Practices**: https://docs.sentry.io/product/best-practices/

---

## 📝 Summary

### Backend
- ✅ **Installed**: @sentry/node + @sentry/profiling-node
- ✅ **Configured**: Automatic error capture, performance monitoring
- ✅ **Integrated**: Error handler middleware, startup initialization
- ✅ **Optimized**: Sensitive data filtering, error ignoring, sampling

### Mobile
- ✅ **Already Installed**: @sentry/react-native
- ✅ **Already Configured**: Error boundary, logger integration
- ✅ **Already Integrated**: Breadcrumbs, navigation tracking
- ✅ **Already Optimized**: Production-only, automatic context

### Next Steps

1. **Create Sentry Projects** (backend + mobile)
2. **Get DSN** from each project
3. **Add to Environment Variables**:
   - Backend: `SENTRY_DSN` in Railway/Render
   - Mobile: `sentryDsn` in `app.json`
4. **Deploy to Staging** and verify errors appear
5. **Set Up Alerts** for critical errors
6. **Monitor Dashboard** regularly

---

**Last Updated**: 2025-11-22
**Status**: ✅ Ready for deployment
