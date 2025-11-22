# PostHog Analytics Setup Guide

Complete guide to configure PostHog analytics for product insights and user behavior tracking in BeSure.

## 🎯 Overview

PostHog integration provides:
- **Product Analytics** - Track user behavior, funnels, and retention
- **Feature Flags** - Gradual feature rollouts and A/B testing
- **Session Replay** - Watch user sessions to identify UX issues
- **User Insights** - Understand how users interact with your app
- **Custom Events** - Track any action or behavior
- **Cohort Analysis** - Group and analyze users

## 📋 Prerequisites

1. **PostHog Account** - Sign up at https://posthog.com/ (free tier available)
2. **Project API Key** - Get from PostHog project settings

## 🚀 Quick Setup (5 minutes)

### Step 1: Create PostHog Project

1. Go to https://posthog.com/ and sign up (free)
2. Create a new project:
   - **Name**: BeSure
   - **Type**: Mobile App (for mobile) / Backend (for backend)
3. Copy the **Project API Key** from project settings
4. Copy the **Host URL** (default: `https://app.posthog.com` or your self-hosted URL)

### Step 2: Configure Environment Variables

#### Backend

Add to `.env` (development) or set in Railway/Render:

```bash
POSTHOG_API_KEY=phc_yourprojectapikey
POSTHOG_HOST=https://app.posthog.com
```

#### Mobile

Add to `app.json`:

```json
{
  "expo": {
    "extra": {
      "posthogApiKey": "phc_yourprojectapikey",
      "posthogHost": "https://app.posthog.com"
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
✓ PostHog analytics initialized (https://app.posthog.com)
```

If you see:
```
ℹ️  PostHog API key not configured - analytics disabled
```

PostHog is not configured (which is fine for local development).

#### Mobile

```bash
cd mobile
npm start
```

PostHog will initialize automatically on app start.

---

## 📦 What's Already Integrated

### Backend Integration ✅

**Files Created:**
- `backend/src/services/analytics-tracking.service.ts` - PostHog service and helper functions
- Integrated into:
  - `backend/src/services/auth.service.ts` - Track signup and login
  - `backend/src/services/question.service.ts` - Track question creation
  - `backend/src/services/vote.service.ts` - Track voting

**Features:**
- ✅ Automatic event tracking for key actions
- ✅ User identification and properties
- ✅ Custom event tracking with properties
- ✅ User segmentation support
- ✅ Graceful degradation (disabled if not configured)

**Dependencies Added:**
```json
{
  "posthog-node": "^3.x"
}
```

### Mobile Integration ✅

**Files Created:**
- `mobile/src/utils/analytics.ts` - PostHog provider for React Native
- Integrated into:
  - `mobile/App.tsx` - Initialize on app start

**Features:**
- ✅ Screen view tracking
- ✅ User identification
- ✅ Custom event tracking
- ✅ Feature flags support
- ✅ Device and platform information
- ✅ Session tracking

**Dependencies Added:**
```json
{
  "posthog-react-native": "^3.x",
  "expo-file-system": "latest",
  "expo-application": "latest",
  "expo-localization": "latest"
}
```

---

## 🎨 Tracked Events

### Backend Events

#### Authentication Events
```typescript
✅ user_signed_up
   - username
   - has_referral_code
   - signup_method
   - signup_date
   - starting_points

✅ user_logged_in
   - timestamp
```

#### Question Events
```typescript
✅ question_created
   - question_id
   - optionCount
   - privacyLevel
   - isAnonymous
   - isUrgent
   - hasImages
   - expiresIn
```

#### Vote Events
```typescript
✅ vote_cast
   - question_id
   - option_id
   - pointsEarned
```

#### Points Events
```typescript
✅ points_earned
   - amount
   - balance
   - timestamp

✅ points_spent
   - amount
   - balance
   - timestamp
```

### Mobile Events

```typescript
✅ $screen (automatic screen views)
   - $screen_name

✅ user_signed_up
   - method

✅ user_logged_in
   - method

✅ user_logged_out

✅ question_created
   - question_id
   - optionCount
   - privacyLevel
   - isAnonymous
   - isUrgent
   - hasImages

✅ vote_cast
   - question_id
   - option_id

✅ question_viewed
   - question_id

✅ profile_viewed
   - viewed_user_id

✅ content_shared
   - type
   - item_id

✅ search_performed
   - query
   - results_count

✅ error_occurred
   - error_message
   - context
```

---

## 🔧 Usage Examples

### Backend Usage

#### Track Custom Events

```typescript
import analytics from '../services/analytics-tracking.service';

// Track a custom event
analytics.track(userId, 'custom_event', {
  property1: 'value1',
  property2: 123,
});
```

#### Identify Users

```typescript
// Set user properties
analytics.identify(userId, {
  email: user.email,
  username: user.username,
  plan: 'premium',
  signup_date: user.createdAt,
});
```

#### Set User Properties

```typescript
// Set properties (overwrites existing)
analytics.set(userId, {
  premium: true,
  last_login: new Date().toISOString(),
});

// Set once (won't overwrite if already set)
analytics.setOnce(userId, {
  first_question_date: new Date().toISOString(),
});
```

#### Track Page Views (for web)

```typescript
analytics.page(userId, '/questions/123', {
  question_title: 'Should I...',
});
```

### Mobile Usage

The analytics provider is automatically initialized. Use it throughout your app:

```typescript
import { analytics } from '../utils/analytics';

// Track screen view
analytics.screen('HomeScreen', {
  tab: 'for_you',
});

// Track user action
analytics.trackQuestionCreated(questionId, {
  optionCount: 4,
  privacyLevel: 'public',
  isAnonymous: false,
  isUrgent: true,
  hasImages: true,
});

// Track vote
analytics.trackVote(questionId, optionId);

// Identify user on login
analytics.identify(userId, {
  username: 'john_doe',
  email: 'john@example.com',
  signup_date: '2025-01-15',
});

// Reset on logout
analytics.reset();
```

#### Feature Flags

```typescript
// Check if feature is enabled
const isEnabled = await analytics.isFeatureEnabled('new_question_ui');

if (isEnabled) {
  // Show new UI
} else {
  // Show old UI
}

// Get feature flag value (can be boolean, string, or number)
const flagValue = await analytics.getFeatureFlag('max_options');
const maxOptions = flagValue || 6;
```

---

## 📊 PostHog Dashboard

### Setup Insights

After events start flowing, create insights in PostHog:

1. **User Signups** - Track new user registrations over time
   ```
   Event: user_signed_up
   Chart: Line graph
   Breakdown: signup_method
   ```

2. **Question Creation Rate** - Track question creation
   ```
   Event: question_created
   Chart: Line graph
   Breakdown: privacyLevel, isAnonymous
   ```

3. **Voting Activity** - Track vote engagement
   ```
   Event: vote_cast
   Chart: Line graph
   Breakdown: None
   ```

4. **User Retention** - Track user retention over time
   ```
   Type: Retention
   First Event: user_signed_up
   Return Event: vote_cast
   ```

5. **Conversion Funnel** - Track user journey
   ```
   Type: Funnel
   Steps:
     1. user_signed_up
     2. question_created
     3. vote_cast
   ```

### Common Dashboards

**Growth Dashboard:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- New Signups
- Retention Rate
- Churn Rate

**Engagement Dashboard:**
- Questions Created per Day
- Votes Cast per Day
- Average Questions per User
- Average Votes per User
- Session Duration

**Product Dashboard:**
- Most Popular Question Topics
- Anonymous vs Public Question Ratio
- Urgent Question Usage
- Image Upload Rate
- Point Economy (earned vs spent)

---

## 🎯 Feature Flags Usage

### Creating Feature Flags in PostHog

1. Go to **Feature Flags** in PostHog dashboard
2. Click **New Feature Flag**
3. Configure:
   - **Key**: `new_question_ui`
   - **Release Conditions**: Percentage rollout or specific users
   - **Default**: Off

### Using Feature Flags

#### Mobile

```typescript
import { analytics } from '../utils/analytics';

// In your component
const [useNewUI, setUseNewUI] = useState(false);

useEffect(() => {
  const checkFeature = async () => {
    const isEnabled = await analytics.isFeatureEnabled('new_question_ui');
    setUseNewUI(isEnabled);
  };
  checkFeature();
}, []);

return useNewUI ? <NewQuestionUI /> : <OldQuestionUI />;
```

#### Backend

Feature flags are typically used in frontend, but you can use them in backend for server-side experiments:

```typescript
// Note: Backend feature flags require additional setup
// They're not included in the basic integration
```

---

## 💰 Cost & Free Tier

### PostHog Free Tier (Cloud)

- **1 million events/month** (free)
- **Unlimited users**
- **Unlimited projects**
- **Full feature access**
- **Data retention**: 7 years

### When You'll Need to Upgrade

- **10M+ events/month**: $450/month
- **100M+ events/month**: Custom pricing

### Cost Optimization

1. **Sample Events in Production**
   ```typescript
   // Only track 10% of events for high-volume actions
   if (Math.random() < 0.1) {
     analytics.track(userId, 'frequent_event', properties);
   }
   ```

2. **Disable in Development**
   - Analytics automatically disabled if API key not configured
   - Only enable for staging and production

3. **Filter Noisy Events**
   - Don't track every screen view if you have many screens
   - Focus on key user actions

4. **Use Session Replay Sparingly**
   - Only record sessions for specific user segments
   - High bandwidth usage

---

## 🔍 Privacy & GDPR Compliance

### User Data

PostHog complies with GDPR by:
- ✅ **Self-hosting option** (full data control)
- ✅ **Data deletion** (user can request deletion)
- ✅ **Anonymization** (hash user IDs if needed)
- ✅ **No tracking by default** (must opt-in)

### Anonymizing Users

If you need to anonymize user IDs:

```typescript
// Backend
import crypto from 'crypto';

const anonymousId = crypto
  .createHash('sha256')
  .update(userId)
  .digest('hex');

analytics.track(anonymousId, 'event', properties);
```

```typescript
// Mobile
import CryptoJS from 'crypto-js';

const anonymousId = CryptoJS.SHA256(userId).toString();
analytics.identify(anonymousId);
```

### Opt-Out

Allow users to opt out of analytics:

```typescript
// Backend
if (!user.analyticsEnabled) {
  return; // Don't track
}

// Mobile
if (userSettings.analyticsEnabled) {
  analytics.track('event', properties);
}
```

---

## 🐛 Troubleshooting

### Backend: "PostHog API key not configured"

**Problem**: See this log message:
```
ℹ️  PostHog API key not configured - analytics disabled
```

**Solution**:
1. Check `POSTHOG_API_KEY` is set in environment
   ```bash
   echo $POSTHOG_API_KEY
   ```
2. Verify API key format starts with `phc_`
3. For local development, this is expected (analytics disabled)

### Mobile: Events Not Showing Up

**Problem**: Events not appearing in PostHog dashboard

**Solutions**:

1. **Check API Key Configuration**
   ```typescript
   // In mobile/App.tsx
   console.log('PostHog API Key:', Constants.expoConfig?.extra?.posthogApiKey);
   ```

2. **Events May Be Batched**
   - PostHog batches events for performance
   - Wait 30-60 seconds for events to appear
   - Check "Live Events" tab in PostHog for real-time view

3. **Development Mode**
   - PostHog works in development but events may not be saved
   - Test with production build: `eas build --profile preview`

### Events Missing Properties

**Problem**: Events show up but missing custom properties

**Solution**:
```typescript
// Ensure properties are serializable (no functions, circular refs)
const properties = {
  user_id: userId,
  timestamp: new Date().toISOString(), // Convert dates to strings
  count: 123,
  flag: true,
};

analytics.track('event', properties);
```

---

## 📚 Best Practices

### DO ✅

- ✅ Track user actions, not technical events
- ✅ Use consistent event naming (snake_case)
- ✅ Include relevant context in properties
- ✅ Identify users after authentication
- ✅ Reset analytics on logout
- ✅ Test events in development before deploying
- ✅ Create dashboards for key metrics

### DON'T ❌

- ❌ Track sensitive data (passwords, payment info)
- ❌ Track every single action (focus on key events)
- ❌ Use different naming for same event (be consistent)
- ❌ Track personal data without user consent
- ❌ Ignore GDPR compliance requirements
- ❌ Leave analytics always enabled (offer opt-out)

---

## 🔗 Additional Resources

- **PostHog Docs**: https://posthog.com/docs
- **Node.js SDK**: https://posthog.com/docs/libraries/node
- **React Native SDK**: https://posthog.com/docs/libraries/react-native
- **Feature Flags**: https://posthog.com/docs/feature-flags
- **Session Replay**: https://posthog.com/docs/session-replay
- **Self-Hosting**: https://posthog.com/docs/self-host

---

## 📝 Summary

### Backend
- ✅ **Installed**: posthog-node
- ✅ **Configured**: AnalyticsService singleton
- ✅ **Integrated**: Auth, Question, Vote services
- ✅ **Events**: signup, login, question_created, vote_cast, points

### Mobile
- ✅ **Installed**: posthog-react-native
- ✅ **Configured**: AnalyticsProvider singleton
- ✅ **Integrated**: App initialization, automatic screen tracking
- ✅ **Events**: Full event tracking library
- ✅ **Features**: Feature flags, user identification, session tracking

### Next Steps

1. **Create PostHog Project** (cloud or self-hosted)
2. **Get API Key** from project settings
3. **Add to Environment Variables**:
   - Backend: `POSTHOG_API_KEY` in Railway/Render
   - Mobile: `posthogApiKey` in `app.json`
4. **Deploy to Staging** and verify events flow
5. **Create Dashboards** for key metrics
6. **Set Up Feature Flags** for gradual rollouts
7. **Monitor User Behavior** and iterate

---

**Last Updated**: 2025-11-22
**Status**: ✅ Ready for deployment
**Free Tier**: 1M events/month (sufficient for early stage)
