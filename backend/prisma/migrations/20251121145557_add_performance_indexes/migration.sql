-- Add performance indexes to improve query efficiency

-- QuestionTopic indexes for efficient topic-based queries
CREATE INDEX IF NOT EXISTS "question_topics_topicId_idx" ON "question_topics"("topicId");
CREATE INDEX IF NOT EXISTS "question_topics_questionId_idx" ON "question_topics"("questionId");

-- UserInterest indexes for user interest queries
CREATE INDEX IF NOT EXISTS "user_interests_userId_idx" ON "user_interests"("userId");
CREATE INDEX IF NOT EXISTS "user_interests_topicId_idx" ON "user_interests"("topicId");

-- UserTopicExpertise indexes for expertise queries and leaderboards
CREATE INDEX IF NOT EXISTS "user_topic_expertise_userId_idx" ON "user_topic_expertise"("userId");
CREATE INDEX IF NOT EXISTS "user_topic_expertise_topicId_idx" ON "user_topic_expertise"("topicId");
CREATE INDEX IF NOT EXISTS "user_topic_expertise_expertiseLevel_idx" ON "user_topic_expertise"("expertiseLevel");

-- UserBadge indexes for badge queries and user profiles
CREATE INDEX IF NOT EXISTS "user_badges_userId_idx" ON "user_badges"("userId");
CREATE INDEX IF NOT EXISTS "user_badges_earnedAt_idx" ON "user_badges"("earnedAt");

-- UserChallenge indexes for daily challenge lookups
CREATE INDEX IF NOT EXISTS "user_challenges_userId_idx" ON "user_challenges"("userId");
CREATE INDEX IF NOT EXISTS "user_challenges_challengeDate_idx" ON "user_challenges"("challengeDate");
