-- Migration: Add Referral System
-- Description: Adds referral code tracking, referral relationships, and rewards
-- Date: 2025-11-22

-- Add referral columns to users table
ALTER TABLE "users" ADD COLUMN "referralCode" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN "referredBy" TEXT;

-- Create unique index on referralCode
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");

-- Create referrals table
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "referralCode" VARCHAR(20) NOT NULL,
    "pointsAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardedAt" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- Create unique index on referredId (each user can only be referred once)
CREATE UNIQUE INDEX "referrals_referredId_key" ON "referrals"("referredId");

-- Create indexes for efficient queries
CREATE INDEX "referrals_referrerId_idx" ON "referrals"("referrerId");
CREATE INDEX "referrals_referralCode_idx" ON "referrals"("referralCode");
CREATE INDEX "referrals_createdAt_idx" ON "referrals"("createdAt");

-- Add foreign key constraints
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Generate referral codes for existing users (optional - can be done in application code)
-- This can be run separately or in the application during user login
-- UPDATE "users" SET "referralCode" = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)) WHERE "referralCode" IS NULL;
