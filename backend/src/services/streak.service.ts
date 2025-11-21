import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  lastVoteDate: Date | null;
  canUseFreeze: boolean;
  daysUntilFreeze: number | null;
}

interface StreakUpdateResult {
  streakDays: number;
  multiplier: number;
  streakBroken: boolean;
  streakContinued: boolean;
  newMilestone: boolean;
  milestoneDay?: number;
}

class StreakService {
  /**
   * Calculate streak multiplier based on current streak
   * Based on PRD-PointSystem.md specifications:
   * - 1-6 days: 1x (no bonus)
   * - 7-13 days: 1.5x
   * - 14-29 days: 2x
   * - 30+ days: 2.5x
   */
  calculateMultiplier(streakDays: number): number {
    if (streakDays >= 30) return 2.5;
    if (streakDays >= 14) return 2.0;
    if (streakDays >= 7) return 1.5;
    return 1.0;
  }

  /**
   * Get user's current streak information
   */
  async getStreakInfo(userId: string): Promise<StreakInfo> {
    const stats = await prisma.userPointStats.findUnique({
      where: { userId },
      select: {
        streakDays: true,
        longestStreak: true,
        lastVoteDate: true,
        streakFreezeUsed: true,
      },
    });

    if (!stats) {
      throw new NotFoundError('User stats');
    }

    const multiplier = this.calculateMultiplier(stats.streakDays);

    // Check if user can use freeze (1 per month)
    let canUseFreeze = true;
    let daysUntilFreeze: number | null = null;

    if (stats.streakFreezeUsed) {
      const daysSinceFreeze = Math.floor(
        (Date.now() - stats.streakFreezeUsed.getTime()) / (1000 * 60 * 60 * 24)
      );
      canUseFreeze = daysSinceFreeze >= 30;
      daysUntilFreeze = canUseFreeze ? null : 30 - daysSinceFreeze;
    }

    return {
      currentStreak: stats.streakDays,
      longestStreak: stats.longestStreak,
      multiplier,
      lastVoteDate: stats.lastVoteDate,
      canUseFreeze,
      daysUntilFreeze,
    };
  }

  /**
   * Check if streak should continue or break
   * Returns true if streak continues, false if it breaks
   */
  private shouldContinueStreak(lastVoteDate: Date | null): boolean {
    if (!lastVoteDate) return false;

    const now = new Date();
    const lastVote = new Date(lastVoteDate);

    // Reset times to midnight for day comparison
    now.setHours(0, 0, 0, 0);
    lastVote.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor(
      (now.getTime() - lastVote.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Streak continues if voting today or exactly 1 day ago
    // (allows for voting once per day)
    return daysDifference <= 1;
  }

  /**
   * Update user's streak when they vote
   * Called after each vote is cast
   */
  async updateStreakOnVote(userId: string): Promise<StreakUpdateResult> {
    const stats = await prisma.userPointStats.findUnique({
      where: { userId },
      select: {
        streakDays: true,
        longestStreak: true,
        lastVoteDate: true,
        streakLastDate: true,
      },
    });

    if (!stats) {
      throw new NotFoundError('User stats');
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let streakDays = stats.streakDays;
    let streakBroken = false;
    let streakContinued = false;
    let newMilestone = false;
    let milestoneDay: number | undefined;

    // Check if user already voted today
    if (stats.lastVoteDate) {
      const lastVoteDay = new Date(stats.lastVoteDate);
      lastVoteDay.setHours(0, 0, 0, 0);

      // If already voted today, don't update streak
      if (lastVoteDay.getTime() === today.getTime()) {
        return {
          streakDays,
          multiplier: this.calculateMultiplier(streakDays),
          streakBroken: false,
          streakContinued: false,
          newMilestone: false,
        };
      }

      // Check if streak continues or breaks
      if (this.shouldContinueStreak(stats.lastVoteDate)) {
        // Streak continues - increment
        streakDays += 1;
        streakContinued = true;

        // Check for milestones (7, 14, 30, 60, 90, 180, 365 days)
        const milestones = [7, 14, 30, 60, 90, 180, 365];
        if (milestones.includes(streakDays)) {
          newMilestone = true;
          milestoneDay = streakDays;
        }
      } else {
        // Streak broken - reset to 1
        streakDays = 1;
        streakBroken = true;
        logger.info(`User ${userId} streak broken. Resetting to 1 day.`);
      }
    } else {
      // First vote ever
      streakDays = 1;
    }

    // Update stats in database
    const longestStreak = Math.max(stats.longestStreak, streakDays);

    await prisma.userPointStats.update({
      where: { userId },
      data: {
        streakDays,
        longestStreak,
        streakLastDate: now,
        lastVoteDate: now,
      },
    });

    const multiplier = this.calculateMultiplier(streakDays);

    logger.info(
      `User ${userId} streak updated: ${streakDays} days (multiplier: ${multiplier}x)`
    );

    // Award badges for milestones
    if (newMilestone && milestoneDay) {
      await this.awardStreakBadge(userId, milestoneDay);
    }

    return {
      streakDays,
      multiplier,
      streakBroken,
      streakContinued,
      newMilestone,
      milestoneDay,
    };
  }

  /**
   * Use streak freeze to prevent streak from breaking
   * Can be used once per month
   */
  async useStreakFreeze(userId: string): Promise<boolean> {
    const info = await this.getStreakInfo(userId);

    if (!info.canUseFreeze) {
      throw new Error(
        `Streak freeze not available. Wait ${info.daysUntilFreeze} more days.`
      );
    }

    if (info.currentStreak === 0) {
      throw new Error('No active streak to freeze');
    }

    // Check if streak is actually broken (last vote was 2+ days ago)
    if (info.lastVoteDate) {
      const shouldContinue = this.shouldContinueStreak(info.lastVoteDate);
      if (shouldContinue) {
        throw new Error('Streak is not broken, freeze not needed');
      }
    }

    // Update freeze usage
    await prisma.userPointStats.update({
      where: { userId },
      data: {
        streakFreezeUsed: new Date(),
        streakLastDate: new Date(), // Extend last date to today
      },
    });

    logger.info(`User ${userId} used streak freeze`);

    return true;
  }

  /**
   * Award streak milestone badge
   */
  private async awardStreakBadge(
    userId: string,
    days: number
  ): Promise<void> {
    const badgeType = `streak_${days}`;

    // Check if badge already exists
    const existingBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeType: {
          userId,
          badgeType,
        },
      },
    });

    if (existingBadge) return;

    // Create badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeType,
        metadata: {
          streakDays: days,
          earnedAt: new Date(),
        },
      },
    });

    logger.info(`User ${userId} earned ${badgeType} badge`);
  }

  /**
   * Get user's streak badges
   */
  async getStreakBadges(userId: string) {
    const badges = await prisma.userBadge.findMany({
      where: {
        userId,
        badgeType: {
          startsWith: 'streak_',
        },
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return badges;
  }

  /**
   * Calculate leaderboard of top streaks
   */
  async getStreakLeaderboard(limit: number = 10) {
    const topStreaks = await prisma.userPointStats.findMany({
      where: {
        streakDays: {
          gt: 0,
        },
      },
      orderBy: {
        streakDays: 'desc',
      },
      take: limit,
      select: {
        userId: true,
        streakDays: true,
        longestStreak: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return topStreaks.map((entry) => ({
      userId: entry.userId,
      username: entry.user.username,
      currentStreak: entry.streakDays,
      longestStreak: entry.longestStreak,
      multiplier: this.calculateMultiplier(entry.streakDays),
    }));
  }
}

export default new StreakService();
