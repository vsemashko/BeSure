# BeSure: Point System Mechanics & Improvements
## Comprehensive Point Economy Design

**Version:** 1.0
**Last Updated:** November 21, 2025
**Document Owner:** Product & Game Design Team

---

## Table of Contents

1. [Overview & Philosophy](#overview--philosophy)
2. [Current Point Mechanics](#current-point-mechanics)
3. [Suggested Improvements](#suggested-improvements)
4. [Complete Point Economy](#complete-point-economy)
5. [Balance & Anti-Gaming Measures](#balance--anti-gaming-measures)
6. [Gamification Features](#gamification-features)
7. [Implementation Considerations](#implementation-considerations)
8. [Testing & Tuning](#testing--tuning)

---

## Overview & Philosophy

### Core Principles

The BeSure point system is designed around three key principles:

1. **Fair Exchange:** Users must contribute before they can ask for help
2. **Quality over Quantity:** Reward meaningful engagement, not just activity
3. **Positive Loops:** Create satisfying cycles of giving and receiving help

### Goals

- ✅ Prevent spam and low-quality questions
- ✅ Encourage active participation in voting
- ✅ Create a sense of progression and achievement
- ✅ Make the economy feel fair and balanced
- ✅ Prevent gaming and exploitation

### Key Metrics to Track

- **Point Velocity:** How fast points flow through the system
- **Point Distribution:** How points are spread across users
- **Inflation/Deflation:** Whether points become too easy or too hard to earn
- **User Retention:** Does the point system keep users engaged?
- **Question Quality:** Are point costs improving quality?

---

## Current Point Mechanics

### Original Concept (from brief)

**Earning Points:**
- Each vote given: +1 point

**Spending Points:**
- Creating a question: costs some points
- Author gets small reward when question completes

**Issues with Current Design:**
1. ❌ Too simple - lacks depth and engagement
2. ❌ No incentive for quality - all votes worth the same
3. ❌ No protection against gaming - easy to spam votes
4. ❌ Unclear costs - "some points" is vague
5. ❌ No variety - only one way to earn/spend
6. ❌ No progression - feels flat, no sense of advancement

---

## Suggested Improvements

### Improvement 1: Dynamic Point Costs

**Problem:** Fixed costs don't account for different question types

**Solution:** Variable costs based on question settings

| Question Type | Point Cost | Rationale |
|---------------|------------|-----------|
| Basic (2 options, 24h, text only) | 5 points | Entry level |
| Standard (3-4 options, 24h, photos) | 10 points | Most common |
| Premium (5-6 options, 7 days, photos) | 15 points | Maximum features |
| Anonymous | +3 points | Reduces accountability |
| Friends-only | -2 points | Smaller audience |
| Urgent (<6 hours) | +5 points | Priority placement |

**Example:**
- Standard question with 4 options, 48h, photos: **10 points**
- Same but anonymous: **13 points**
- Same but urgent (3h): **18 points**

### Improvement 2: Tiered Voting Rewards

**Problem:** All votes worth same regardless of effort or timing

**Solution:** Variable rewards based on multiple factors

#### Base Voting Rewards
- **Quick vote** (<30 seconds): +1 point
- **Thoughtful vote** (30s-2min): +2 points
- **Considered vote** (>2 min): +3 points

#### Bonus Multipliers
- **Early voter** (first 10 votes): +1 bonus
- **Urgent question** (expires <6h): +1 bonus
- **Under-voted question** (<5 votes): +2 bonus
- **Topic expertise** (voted in category 10+ times): +1 bonus
- **Streak bonus** (voted 5 days in a row): +1 bonus

**Example:**
- User votes on urgent question (expires in 2h)
- Takes 45 seconds to decide
- Is one of first 5 voters
- Has expertise in the topic

**Points earned:** 2 (thoughtful) + 1 (early) + 1 (urgent) + 1 (expertise) = **5 points**

### Improvement 3: Question Completion Rewards

**Problem:** Original design gives "small reward" - too vague

**Solution:** Rewards based on engagement quality

| Metric | Reward |
|--------|--------|
| **Base completion reward** | 3 points |
| **Per vote received** | 0.5 points |
| **Bonus: 20+ votes** | +5 points |
| **Bonus: 50+ votes** | +10 points |
| **Bonus: 100+ votes** | +20 points |
| **Penalty: <5 votes** | -5 points (refund difference) |

**Example:**
- User creates standard question (10 points)
- Gets 35 votes
- **Reward:** 3 (base) + 17.5 (votes) + 5 (20+ bonus) = **25.5 points**
- **Net gain:** 25.5 - 10 = **+15.5 points**

**Poor example:**
- User creates question (10 points)
- Gets only 3 votes
- **Reward:** 3 (base) - 5 (penalty) = **-2 points** (but refunded to 0)
- **Net loss:** -10 points (but gets 5 point refund)
- **Actual loss:** -5 points

### Improvement 4: Streak System

**Problem:** No incentive for regular engagement

**Solution:** Daily streak bonuses

| Streak Days | Bonus Multiplier | Special Reward |
|-------------|------------------|----------------|
| 3 days | 1.2x points | - |
| 7 days | 1.5x points | "Dedicated" badge |
| 14 days | 1.75x points | - |
| 30 days | 2x points | "Committed" badge |
| 60 days | 2.5x points | "Legend" badge |

**Additional streak perks:**
- 7-day streak: Free anonymous question
- 30-day streak: Free premium question
- Lost streak protection (1 "freeze" per month)

### Improvement 5: Level System

**Problem:** No sense of progression or achievement

**Solution:** User levels with cumulative benefits

| Level | Total Points Earned | Perks |
|-------|-------------------|-------|
| 1. Newcomer | 0-49 | Basic features |
| 2. Contributor | 50-199 | -10% question costs |
| 3. Helper | 200-499 | Can create polls with 6 options |
| 4. Advisor | 500-999 | -20% question costs, verified badge |
| 5. Expert | 1000-2499 | Priority feed placement |
| 6. Guru | 2500-4999 | -30% costs, custom profile themes |
| 7. Legend | 5000+ | All features, special flair |

**Note:** Levels based on *lifetime points earned*, not current balance

### Improvement 6: Topic Expertise System

**Problem:** No recognition for domain knowledge

**Solution:** Topic-specific reputation

**How it works:**
- Track votes per topic (fashion, food, tech, etc.)
- After 25 votes in a topic, become "Knowledgeable"
- After 100 votes, become "Expert"
- After 500 votes, become "Master"

**Benefits:**
- Expert badge shows on your votes
- Higher chance to be shown questions in your topics
- +1 point per vote in expertise topics
- Questions from experts shown more prominently

### Improvement 7: Daily Challenges

**Problem:** Engagement can become routine and boring

**Solution:** Dynamic daily challenges with bonus rewards

**Examples:**
- "Vote on 10 questions today" → +5 bonus points
- "Vote in 3 different topics" → +3 bonus points
- "Vote on 5 urgent questions" → +7 bonus points
- "Help 3 friends decide" → +5 bonus points
- "Be an early voter 5 times" → +8 bonus points

**Rotation:**
- 3 challenges available per day
- Refresh at midnight user timezone
- Progressive difficulty throughout week

### Improvement 8: Referral & Social Bonuses

**Problem:** No incentive to grow the community

**Solution:** Social rewards

- **Invite friend:** +20 points when they complete 10 votes
- **Friend votes on your question:** +1 point per friend vote
- **Your referrals active:** +5 points/month per active referral (cap at 50)

---

## Complete Point Economy

### Comprehensive Earning Table

| Action | Base Points | Possible Bonuses | Max Possible |
|--------|-------------|------------------|--------------|
| **Quick vote** | 1 | +4 (early, urgent, under-voted, expertise) | 5 |
| **Thoughtful vote** | 2 | +4 | 6 |
| **Considered vote** | 3 | +4 | 7 |
| **Question completion (base)** | 3 | - | 3 |
| **Per vote received** | 0.5 | - | Unlimited |
| **Question with 20+ votes** | 5 | - | 5 |
| **Question with 50+ votes** | 10 | - | 10 |
| **Question with 100+ votes** | 20 | - | 20 |
| **Daily challenge** | 3-10 | - | 10 |
| **Streak bonus** | - | 1.2x-2.5x multiplier | 2.5x |
| **Referral activation** | 20 | - | 20 |
| **Daily login** | 1 | - | 1 |

### Comprehensive Spending Table

| Action | Base Cost | Modifiers | Range |
|--------|-----------|-----------|-------|
| **Basic question** | 5 | +0-8 | 5-13 |
| **Standard question** | 10 | +0-8 | 10-18 |
| **Premium question** | 15 | +0-8 | 15-23 |
| **Anonymous modifier** | +3 | - | +3 |
| **Urgent modifier** | +5 | - | +5 |
| **Boost question** | 10 | - | 10 |
| **Freeze lost streak** | 5 | - | 5 |

### Starting Balance

New users start with:
- **10 points** (can create 2 basic questions OR vote 10 times)
- **Optional onboarding:** +5 points for completing tutorial
- **Total start:** 10-15 points

Rationale:
- Enough to post 1 question immediately (try before you buy)
- Encourages voting first to unlock more
- Not so much that it devalues points

---

## Balance & Anti-Gaming Measures

### Inflation Prevention

**Problem:** Too many points entering the economy

**Measures:**
1. **Point Sinks:** Features that remove points from economy
   - Boost questions (10 points)
   - Premium features
   - Cosmetic items (profile themes, badges)

2. **Diminishing Returns:**
   - After 50 votes per day, rewards halved
   - After 100 votes per day, rewards quartered
   - Prevents mass vote spam

3. **Point Decay:** (optional, controversial)
   - Inactive users lose 10% points per month
   - Only affects users inactive >30 days
   - Prevents point hoarding

### Spam Prevention

**Problem:** Users might vote randomly without reading

**Measures:**
1. **Minimum Time Checks:**
   - Must view question >5 seconds to get points
   - Rapid-fire voting flagged for review

2. **Quality Signals:**
   - Random attention check questions ("Please select option 2")
   - Failing 3 checks = temporary point penalty

3. **Vote Consistency:**
   - Users who always vote for first option = suspicious
   - System monitors voting patterns
   - Obvious bots flagged for review

4. **Rate Limiting:**
   - Max 100 votes per day
   - Max 10 questions per day
   - Prevents automated abuse

### Bot Detection

**Signals:**
- Voting too quickly (<5 seconds per question)
- Perfect patterns (always first option, alternating, etc.)
- API usage patterns (non-human timing)
- Device fingerprinting inconsistencies

**Actions:**
- Temporary point freeze
- Require CAPTCHA verification
- Manual review
- Account suspension if confirmed

### Point Transaction Audit Trail

Every point transaction logged:
```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Benefits:**
- Can track point flow
- Detect suspicious patterns
- Resolve user disputes
- Calculate lifetime earnings

---

## Gamification Features

### Badges & Achievements

#### Voting Badges
- **First Vote:** "Getting Started"
- **10 Votes:** "Helper"
- **100 Votes:** "Contributor"
- **1,000 Votes:** "Advisor"
- **10,000 Votes:** "Legend"

#### Question Badges
- **First Question:** "Decision Maker"
- **Popular Question:** (50+ votes) "Trending"
- **Viral Question:** (500+ votes) "Viral"

#### Streak Badges
- **7-Day Streak:** "Dedicated"
- **30-Day Streak:** "Committed"
- **365-Day Streak:** "Unstoppable"

#### Topic Expertise Badges
- **25 votes in topic:** "Interested"
- **100 votes in topic:** "Expert"
- **500 votes in topic:** "Master"

#### Special Badges
- **Early Adopter:** Joined in first month
- **Beta Tester:** Participated in beta
- **Top 1% Voter:** Among most active voters
- **Helpful Friend:** 100+ friend votes

### Leaderboards

#### Global Leaderboards
- **All-time top voters**
- **All-time top question creators**
- **Current month top earners**
- **Current week streak leaders**

#### Friend Leaderboards
- Compare with friends only
- More personal and motivating

#### Topic Leaderboards
- Top voters per topic
- Topic-specific recognition

**Privacy:**
- Users can opt out of leaderboards
- Anonymous questions don't count toward leaderboards

### Profile Stats & Achievements

**Profile displays:**
- Total votes given / received
- Questions created
- Current level & progress to next
- Active streaks
- Topic expertise areas
- Badges earned
- "Win rate" (how often your choice matches majority)
- "Helpfulness score" (based on votes given vs received)

**Shareable achievements:**
- Share badges on social media
- Share milestone achievements
- Share interesting stats

---

## Implementation Considerations

### Phase 1: MVP (Simple)
- Basic earning: +2 points per vote
- Basic spending: 10 points per question
- Starting balance: 10 points
- Simple completion reward: 5 points per question

**Goal:** Validate core loop is engaging

### Phase 2: Enhanced (After 1-2 months)
- Add streak system
- Add question cost modifiers (anonymous, urgent)
- Add voting bonuses (early, under-voted)
- Add daily challenges

**Goal:** Increase engagement and retention

### Phase 3: Advanced (After 3-6 months)
- Add level system
- Add topic expertise
- Add leaderboards
- Add referral program
- Add point sinks (boost, cosmetics)

**Goal:** Create deep engagement and community

### Database Schema for Points

```sql
-- Point transactions (audit trail)
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User point stats (cached for performance)
CREATE TABLE user_point_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  current_balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  streak_last_date DATE,
  last_vote_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User topic expertise
CREATE TABLE user_topic_expertise (
  user_id UUID REFERENCES users(id),
  topic_id UUID REFERENCES topics(id),
  vote_count INTEGER DEFAULT 0,
  expertise_level VARCHAR(20),
  PRIMARY KEY (user_id, topic_id)
);

-- User badges
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_type VARCHAR(50),
  earned_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB,
  PRIMARY KEY (user_id, badge_type)
);

-- Daily challenges
CREATE TABLE user_challenges (
  user_id UUID REFERENCES users(id),
  challenge_date DATE,
  challenges JSONB,
  completed JSONB,
  PRIMARY KEY (user_id, challenge_date)
);
```

### API Endpoints for Points

```typescript
// Get user point balance and stats
GET /api/v1/users/me/points

// Get point transaction history
GET /api/v1/users/me/points/history
  ?limit=50
  &offset=0
  &type=earned|spent|bonus

// Get current level and progress
GET /api/v1/users/me/level

// Get streak information
GET /api/v1/users/me/streak

// Get daily challenges
GET /api/v1/users/me/challenges

// Get topic expertise
GET /api/v1/users/me/expertise

// Get badges and achievements
GET /api/v1/users/me/badges

// Get leaderboards
GET /api/v1/leaderboards
  ?type=global|friends|topic
  &period=all|month|week
  &topic_id=uuid
```

---

## Testing & Tuning

### Key Metrics to Monitor

#### Economy Health
- **Average user balance:** Should hover around 20-50 points
- **Point velocity:** How fast points circulate
- **New user drop-off:** Do users run out of points too quickly?
- **Whale behavior:** Are some users hoarding too many points?

#### Engagement Impact
- **Votes per user per day:** Target 5-10
- **Questions per user per week:** Target 1-3
- **Retention impact:** Does point system improve retention?
- **Session length:** Does gamification increase time spent?

#### Balance Issues
- **Point inflation:** Are points becoming worthless?
- **Point scarcity:** Are users unable to post questions?
- **Gaming detection:** How many users trying to exploit system?

### A/B Testing Opportunities

#### Test 1: Point Values
- **Variant A:** +1 per vote, 5 points per question
- **Variant B:** +2 per vote, 10 points per question
- **Variant C:** +3 per vote, 15 points per question
- **Measure:** Engagement, satisfaction, question quality

#### Test 2: Starting Balance
- **Variant A:** 5 points (must vote first)
- **Variant B:** 10 points (can post 1 question)
- **Variant C:** 20 points (can post 2 questions)
- **Measure:** New user retention, activation rate

#### Test 3: Streak Multipliers
- **Variant A:** No streaks
- **Variant B:** 1.5x max multiplier
- **Variant C:** 2.5x max multiplier
- **Measure:** Daily active users, retention

### Balancing Adjustments

**If points too scarce:**
- Increase voting rewards
- Decrease question costs
- Add more earning opportunities
- Increase starting balance

**If points too abundant:**
- Decrease voting rewards
- Increase question costs
- Add point sinks (premium features)
- Implement diminishing returns

**If engagement too low:**
- Add more bonuses and multipliers
- Introduce daily challenges
- Improve gamification (badges, leaderboards)
- Add social features (friend bonuses)

**If quality suffering:**
- Increase question costs
- Add penalties for low-engagement questions
- Reward high-quality questions more
- Implement quality voting bonuses

---

## Point System Summary

### Recommended MVP Configuration

**Earning:**
- Basic vote: **+2 points**
- Streak bonus: **1.5x** at 7 days
- Daily challenge: **+5 points**

**Spending:**
- Standard question: **10 points**
- Anonymous: **+3 points**
- Urgent: **+5 points**

**Starting:**
- New user: **10 points**
- Tutorial completion: **+5 points**

**Completion:**
- Base reward: **5 points**
- Per vote: **+0.5 points**
- Poor performance (<5 votes): **-5 points penalty**

### Expected User Flow

**Day 1:**
- Start with 10 points
- Vote on 5 questions → earn 10 points → total: 20 points
- Create 1 question (10 points) → total: 10 points
- Question gets 15 votes → earn 12.5 points → total: 22.5 points

**Week 1:**
- Vote 5x per day → ~70 points earned
- Create 2 questions per week → -20 points
- Questions get 20 votes avg → +25 points
- **Net:** +75 points
- **Balance:** ~95 points

**Month 1:**
- Average user balance: **50-150 points**
- Active user balance: **100-300 points**
- Power user balance: **500+ points**

---

## Advanced Features (Future)

### Point Marketplace
- Users can "tip" helpful voters
- Gift points to friends
- Donate to charity (convert points to real donations)

### Premium Currency
- Separate "gems" for premium features
- Can't be earned, only purchased
- Unlocks exclusive cosmetics, features

### Seasonal Events
- Double point weekends
- Holiday challenges with bonus rewards
- Limited-time badges and achievements

### Point-Based Achievements
- "Millionaire" - earn 1M lifetime points
- "Generous" - spend 10K points helping others
- "Efficient" - maintain 90%+ question success rate

---

## Conclusion

The improved point system transforms BeSure from a simple voting app into an engaging, gamified experience that:

✅ **Rewards quality** participation over mindless clicking
✅ **Prevents abuse** through smart detection and limits
✅ **Creates progression** with levels, streaks, and expertise
✅ **Feels fair** with balanced costs and rewards
✅ **Encourages community** through social features and referrals
✅ **Maintains engagement** through challenges and achievements

The system is designed to be:
- **Simple to start** (MVP can launch with basic features)
- **Easy to extend** (add complexity over time)
- **Flexible to tune** (adjust parameters based on data)
- **Fun to experience** (gamification that doesn't feel manipulative)

**Next Steps:**
1. Implement MVP point system (Phase 1)
2. Monitor metrics closely for 2-4 weeks
3. Tune parameters based on user behavior
4. Gradually introduce advanced features (Phase 2-3)
5. Continuously A/B test improvements

---

**End of Point System Document**
