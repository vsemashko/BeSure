-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileData" JSONB,
    "preferences" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "privacyLevel" VARCHAR(20) NOT NULL DEFAULT 'public',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "metadata" JSONB,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_topics" (
    "questionId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "question_topics_pkey" PRIMARY KEY ("questionId","topicId")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "interestScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_point_stats" (
    "userId" TEXT NOT NULL,
    "currentBalance" INTEGER NOT NULL DEFAULT 10,
    "lifetimeEarned" INTEGER NOT NULL DEFAULT 0,
    "lifetimeSpent" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "streakLastDate" TIMESTAMP(3),
    "streakFreezeUsed" TIMESTAMP(3),
    "lastVoteDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_point_stats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_topic_expertise" (
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "expertiseLevel" VARCHAR(20),

    CONSTRAINT "user_topic_expertise_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "userId" TEXT NOT NULL,
    "badgeType" VARCHAR(50) NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("userId","badgeType")
);

-- CreateTable
CREATE TABLE "user_challenges" (
    "userId" TEXT NOT NULL,
    "challengeDate" DATE NOT NULL,
    "challenges" JSONB NOT NULL,
    "completed" JSONB NOT NULL,

    CONSTRAINT "user_challenges_pkey" PRIMARY KEY ("userId","challengeDate")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_follows_followerId_idx" ON "user_follows"("followerId");

-- CreateIndex
CREATE INDEX "user_follows_followingId_idx" ON "user_follows"("followingId");

-- CreateIndex
CREATE INDEX "questions_expiresAt_idx" ON "questions"("expiresAt");

-- CreateIndex
CREATE INDEX "questions_status_idx" ON "questions"("status");

-- CreateIndex
CREATE INDEX "questions_userId_idx" ON "questions"("userId");

-- CreateIndex
CREATE INDEX "questions_createdAt_idx" ON "questions"("createdAt");

-- CreateIndex
CREATE INDEX "question_options_questionId_idx" ON "question_options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_questionId_userId_key" ON "votes"("questionId", "userId");

-- CreateIndex
CREATE INDEX "votes_questionId_idx" ON "votes"("questionId");

-- CreateIndex
CREATE INDEX "votes_userId_idx" ON "votes"("userId");

-- CreateIndex
CREATE INDEX "votes_createdAt_idx" ON "votes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex
CREATE INDEX "question_topics_topicId_idx" ON "question_topics"("topicId");

-- CreateIndex
CREATE INDEX "question_topics_questionId_idx" ON "question_topics"("questionId");

-- CreateIndex
CREATE INDEX "user_interests_userId_idx" ON "user_interests"("userId");

-- CreateIndex
CREATE INDEX "user_interests_topicId_idx" ON "user_interests"("topicId");

-- CreateIndex
CREATE INDEX "point_transactions_userId_idx" ON "point_transactions"("userId");

-- CreateIndex
CREATE INDEX "point_transactions_createdAt_idx" ON "point_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "user_topic_expertise_userId_idx" ON "user_topic_expertise"("userId");

-- CreateIndex
CREATE INDEX "user_topic_expertise_topicId_idx" ON "user_topic_expertise"("topicId");

-- CreateIndex
CREATE INDEX "user_topic_expertise_expertiseLevel_idx" ON "user_topic_expertise"("expertiseLevel");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_earnedAt_idx" ON "user_badges"("earnedAt");

-- CreateIndex
CREATE INDEX "user_challenges_userId_idx" ON "user_challenges"("userId");

-- CreateIndex
CREATE INDEX "user_challenges_challengeDate_idx" ON "user_challenges"("challengeDate");

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_point_stats" ADD CONSTRAINT "user_point_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_expertise" ADD CONSTRAINT "user_topic_expertise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_topic_expertise" ADD CONSTRAINT "user_topic_expertise_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
