-- AlterTable: Add streak enhancement fields to user_point_stats
ALTER TABLE "user_point_stats"
ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "streakFreezeUsed" TIMESTAMP(3);

-- Update existing rows to set longestStreak equal to current streakDays
UPDATE "user_point_stats"
SET "longestStreak" = "streakDays"
WHERE "longestStreak" = 0 AND "streakDays" > 0;
