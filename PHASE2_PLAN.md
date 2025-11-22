# Phase 2: Beta Refinement - Implementation Plan

**Timeline**: Weeks 3-6 (4 weeks)
**Branch**: `claude/phase-2-beta-refinement`
**Status**: 🚧 IN PROGRESS

---

## 📋 Overview

Phase 2 focuses on user retention, engagement, and growth through social features, better discovery, and enhanced notifications.

**Key Objectives**:
- Improve D7 retention to 40%+
- Add viral social features (follow, share, invite)
- Enhance content discovery
- Better user insights with analytics

---

## 🎯 Priority Breakdown

### **Priority 1: Social Features** (Week 3-4) - Critical for Growth
**Impact**: High - Drives retention and viral growth

#### Backend API
- [ ] Follow/unfollow user endpoints
- [ ] Get followers/following lists
- [ ] Friend activity feed endpoint
- [ ] Referral/invite system with tracking
- [ ] Social sharing metadata

#### Mobile UI
- [ ] Follow/unfollow button on profiles
- [ ] Followers/following lists screens
- [ ] Friend activity feed tab
- [ ] Referral code generation & sharing
- [ ] Social media share integration (extended)

**Estimated Time**: 12-16 hours

---

### **Priority 2: Enhanced Notifications** (Week 3) - High Engagement
**Impact**: High - Increases return rate and engagement

#### Backend
- [ ] Question answered notification trigger
- [ ] New follower notification
- [ ] Challenge completion notification
- [ ] Streak reminder (daily at 8pm)
- [ ] Friend activity notifications

#### Mobile
- [ ] Notification preferences screen
- [ ] In-app notification center
- [ ] Rich push notifications with actions
- [ ] Notification sound/vibration settings

**Estimated Time**: 8-10 hours

---

### **Priority 3: Search & Discovery** (Week 5) - Medium Impact
**Impact**: Medium - Helps users find relevant content

#### Backend
- [ ] Full-text search for questions
- [ ] User search by username
- [ ] Topic filtering and trending
- [ ] Search result ranking algorithm

#### Mobile
- [ ] Search screen with filters
- [ ] Trending topics widget
- [ ] Search history
- [ ] Popular questions section

**Estimated Time**: 10-12 hours

---

### **Priority 4: Question Templates** (Week 4) - Quick Win
**Impact**: Medium - Improves UX, faster question creation

#### Implementation
- [ ] Template data structure
- [ ] Pre-built template library (20-30 templates)
- [ ] Template categories (Fashion, Food, Travel, etc.)
- [ ] Template selection UI
- [ ] Custom template creation

**Estimated Time**: 6-8 hours

---

### **Priority 5: Enhanced Analytics** (Week 5-6) - Low Priority
**Impact**: Medium - Better insights for creators

#### Backend
- [ ] Question insights API (views, engagement rate)
- [ ] Voter demographics breakdown
- [ ] Time-based trends
- [ ] CSV/PDF export functionality

#### Mobile
- [ ] Question insights screen
- [ ] Charts and visualizations
- [ ] Export options
- [ ] Performance metrics

**Estimated Time**: 10-12 hours

---

## 📅 Week-by-Week Breakdown

### Week 3 (Days 1-7)
**Focus**: Social Features + Enhanced Notifications

**Day 1-2**: Backend - Follow/Unfollow System
- Prisma schema updates (UserFollow model)
- API endpoints: POST /social/follow, DELETE /social/unfollow
- Get followers/following endpoints

**Day 3-4**: Mobile - Follow UI
- Follow button component
- Followers/Following screens
- Follow state management

**Day 5-6**: Enhanced Notifications
- Backend notification triggers
- Mobile notification center
- Push notification integration

**Day 7**: Testing & Polish
- E2E testing
- Bug fixes
- Performance review

---

### Week 4 (Days 8-14)
**Focus**: Friend Activity Feed + Question Templates

**Day 8-9**: Friend Activity Feed
- Backend: Activity feed API
- Mobile: Activity feed screen
- Real-time updates

**Day 10-11**: Referral System
- Backend: Referral tracking
- Mobile: Invite friends UI
- Referral rewards (+10 points)

**Day 12-13**: Question Templates
- Template library creation
- Template selection UI
- Quick create flow

**Day 14**: Testing & Polish

---

### Week 5 (Days 15-21)
**Focus**: Search & Discovery

**Day 15-16**: Backend Search
- Full-text search implementation
- Search indexing
- Ranking algorithm

**Day 17-18**: Mobile Search UI
- Search screen
- Filters and sorting
- Search history

**Day 19-20**: Trending & Discovery
- Trending algorithm
- Trending topics widget
- Popular questions

**Day 21**: Testing & Polish

---

### Week 6 (Days 22-28)
**Focus**: Enhanced Analytics + Final Polish

**Day 22-23**: Question Insights
- Backend analytics API
- Mobile insights screen

**Day 24-25**: Visualizations
- Charts library integration
- Data visualization components

**Day 26-27**: Export & Polish
- CSV/PDF export
- Final bug fixes
- Performance optimization

**Day 28**: Phase 2 Completion
- Final testing
- Documentation update
- Deployment preparation

---

## 🔧 Technical Implementation Details

### Follow/Unfollow System

**Database Schema**:
```prisma
model UserFollow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

**API Endpoints**:
- `POST /api/v1/social/follow/:userId` - Follow a user
- `DELETE /api/v1/social/unfollow/:userId` - Unfollow a user
- `GET /api/v1/social/followers/:userId` - Get user's followers
- `GET /api/v1/social/following/:userId` - Get users being followed
- `GET /api/v1/social/feed` - Get friend activity feed
- `GET /api/v1/social/suggested` - Get suggested users to follow

---

### Notification System Enhancement

**New Notification Types**:
```typescript
enum NotificationType {
  QUESTION_ANSWERED = 'QUESTION_ANSWERED'
  NEW_FOLLOWER = 'NEW_FOLLOWER'
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED'
  STREAK_REMINDER = 'STREAK_REMINDER'
  FRIEND_QUESTION = 'FRIEND_QUESTION'
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED'
}
```

**Push Notification Schedule**:
- Immediate: Question answered, new follower
- Batched: Friend activity (max 1/hour)
- Scheduled: Streak reminder (daily at 8pm user timezone)

---

### Search Implementation

**Technology Stack**:
- PostgreSQL full-text search (tsvector)
- Materialized views for performance
- Redis caching for popular searches

**Search Ranking Factors**:
1. Recency (newer = higher)
2. Vote count (popular = higher)
3. Relevance score (text match quality)
4. User relationship (friends = higher)

---

### Question Templates

**Template Structure**:
```typescript
interface QuestionTemplate {
  id: string;
  category: string; // 'fashion', 'food', 'travel', etc.
  title: string;
  description?: string;
  options: string[];
  tags: string[];
  expiryHours: number;
}
```

**Sample Templates**:
- Fashion: "Which outfit should I wear?" (4 options)
- Food: "Where should we eat tonight?" (6 options)
- Travel: "Which vacation destination?" (4 options)
- Career: "Which job offer should I take?" (3 options)
- Tech: "Which phone should I buy?" (4 options)

---

## 📊 Success Metrics

### Engagement Metrics
- [ ] D7 retention: 40%+ (currently: baseline TBD)
- [ ] D30 retention: 25%+ (currently: baseline TBD)
- [ ] Average session: 5+ minutes
- [ ] DAU/MAU ratio: 30%+

### Social Metrics
- [ ] 100+ active users
- [ ] Average 5+ follows per user
- [ ] 20%+ of questions from friends
- [ ] 10%+ referral conversion rate

### Feature Adoption
- [ ] 50%+ users follow at least one person
- [ ] 30%+ users use templates
- [ ] 40%+ users search weekly
- [ ] 20%+ creators check analytics

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Follow/unfollow service tests
- [ ] Notification trigger tests
- [ ] Search ranking tests
- [ ] Template validation tests

### Integration Tests
- [ ] Social API endpoints
- [ ] Notification delivery
- [ ] Search with filters
- [ ] Analytics data accuracy

### E2E Tests (Manual)
- [ ] Complete follow/unfollow flow
- [ ] Receive notifications on physical device
- [ ] Search and filter questions
- [ ] Create question from template
- [ ] View question analytics

---

## 🚀 Deployment Plan

### Backend Deployment
1. Run database migrations (UserFollow, etc.)
2. Deploy backend with zero downtime
3. Verify new endpoints with Postman
4. Monitor error rates in Sentry

### Mobile Deployment
1. Build and test on TestFlight/Internal Testing
2. Gradual rollout (10% → 50% → 100%)
3. Monitor crash rates
4. Collect user feedback

### Rollback Plan
- Database migrations are reversible
- Feature flags for new features
- Previous version available for rollback

---

## 📝 Documentation Updates

- [ ] Update API documentation with new endpoints
- [ ] Create user guides for social features
- [ ] Update README with Phase 2 features
- [ ] Document analytics export format
- [ ] Update privacy policy (if needed for social features)

---

## 💡 Nice-to-Have (Time Permitting)

If ahead of schedule:
- [ ] Blocking users functionality
- [ ] Mute users
- [ ] Question bookmarking/saving
- [ ] Share question drafts
- [ ] Question history/archive
- [ ] Advanced filters (by date, popularity, etc.)
- [ ] Dark mode
- [ ] Accessibility improvements

---

## 🎯 Phase 2 Completion Criteria

**Must Have**:
- ✅ Follow/unfollow working end-to-end
- ✅ Friend activity feed functional
- ✅ Enhanced notifications delivered
- ✅ Search returns relevant results
- ✅ Templates available and working
- ✅ All tests passing
- ✅ Zero critical bugs

**Nice to Have**:
- Analytics insights available
- Referral system working
- Trending topics accurate
- Export functionality working

---

**Last Updated**: November 22, 2025
**Next Review**: End of Week 3
