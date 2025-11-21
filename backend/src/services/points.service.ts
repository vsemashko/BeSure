import prisma from '../config/database';
import config from '../config/constants';
import { InsufficientPointsError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface PointTransactionInput {
  userId: string;
  amount: number;
  type: string;
  referenceId?: string;
  metadata?: any;
}

class PointsService {
  /**
   * Award points to a user
   */
  async awardPoints(input: PointTransactionInput): Promise<number> {
    const { userId, amount, type, referenceId, metadata } = input;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Update user points and stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user balance
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: amount,
          },
        },
        select: { points: true },
      });

      // Update point stats
      await tx.userPointStats.update({
        where: { userId },
        data: {
          currentBalance: user.points,
          lifetimeEarned: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.pointTransaction.create({
        data: {
          userId,
          amount,
          type,
          referenceId,
          metadata,
        },
      });

      return user.points;
    });

    logger.info(`Awarded ${amount} points to user ${userId} (type: ${type})`);

    return result;
  }

  /**
   * Deduct points from a user
   */
  async deductPoints(input: PointTransactionInput): Promise<number> {
    const { userId, amount, type, referenceId, metadata } = input;

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check if user has enough points
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.points < amount) {
      throw new InsufficientPointsError(amount, user.points);
    }

    // Deduct points and update stats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user balance
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: amount,
          },
        },
        select: { points: true },
      });

      // Update point stats
      await tx.userPointStats.update({
        where: { userId },
        data: {
          currentBalance: updatedUser.points,
          lifetimeSpent: {
            increment: amount,
          },
        },
      });

      // Create transaction record (negative amount)
      await tx.pointTransaction.create({
        data: {
          userId,
          amount: -amount,
          type,
          referenceId,
          metadata,
        },
      });

      return updatedUser.points;
    });

    logger.info(`Deducted ${amount} points from user ${userId} (type: ${type})`);

    return result;
  }

  /**
   * Award points for voting
   */
  async awardVotePoints(userId: string, questionId: string): Promise<number> {
    return this.awardPoints({
      userId,
      amount: config.points.voteReward,
      type: 'vote',
      referenceId: questionId,
    });
  }

  /**
   * Award points for voting with streak multiplier
   */
  async awardVotePointsWithMultiplier(
    userId: string,
    questionId: string,
    multiplier: number
  ): Promise<{ basePoints: number; bonusPoints: number; totalPoints: number; newBalance: number }> {
    const basePoints = config.points.voteReward; // 2 points
    const bonusPoints = Math.floor(basePoints * (multiplier - 1)); // Bonus from streak
    const totalPoints = basePoints + bonusPoints;

    // Award base points
    await this.awardPoints({
      userId,
      amount: basePoints,
      type: 'vote',
      referenceId: questionId,
    });

    // Award bonus points if multiplier > 1
    if (bonusPoints > 0) {
      await this.awardPoints({
        userId,
        amount: bonusPoints,
        type: 'streak_bonus',
        referenceId: questionId,
        metadata: { multiplier, basePoints },
      });
    }

    // Get new balance
    const newBalance = await this.getBalance(userId);

    logger.info(
      `Awarded ${totalPoints} points to user ${userId} (base: ${basePoints}, bonus: ${bonusPoints}, multiplier: ${multiplier}x)`
    );

    return {
      basePoints,
      bonusPoints,
      totalPoints,
      newBalance,
    };
  }

  /**
   * Deduct points for creating a question
   */
  async deductQuestionPoints(
    userId: string,
    questionId: string,
    cost: number
  ): Promise<number> {
    return this.deductPoints({
      userId,
      amount: cost,
      type: 'question_create',
      referenceId: questionId,
      metadata: { cost },
    });
  }

  /**
   * Award completion rewards for a question
   */
  async awardQuestionCompletionRewards(
    questionId: string
  ): Promise<{ authorReward: number; voteCount: number }> {
    // Get question with votes
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        userId: true,
        votes: {
          select: { id: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Question');
    }

    const voteCount = question.votes.length;

    // Calculate reward based on PRD
    let reward = config.points.questionCompletionReward; // Base 5 points
    reward += Math.floor(voteCount * config.points.perVoteReward); // 0.5 per vote

    // Bonus for 20+ votes
    if (voteCount >= 20) reward += 5;
    // Bonus for 50+ votes
    if (voteCount >= 50) reward += 10;
    // Bonus for 100+ votes
    if (voteCount >= 100) reward += 20;

    // Penalty for < 5 votes (but don't go negative)
    if (voteCount < 5) {
      reward = Math.max(0, reward - config.points.minVotesPenalty);
    }

    // Award points to question author
    await this.awardPoints({
      userId: question.userId,
      amount: reward,
      type: 'question_complete',
      referenceId: questionId,
      metadata: { voteCount, reward },
    });

    logger.info(
      `Question ${questionId} completed. Author rewarded ${reward} points (${voteCount} votes)`
    );

    return { authorReward: reward, voteCount };
  }

  /**
   * Get user's point balance
   */
  async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user.points;
  }

  /**
   * Get user's point stats
   */
  async getStats(userId: string) {
    const stats = await prisma.userPointStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      throw new NotFoundError('User stats');
    }

    return stats;
  }

  /**
   * Get user's point transaction history
   */
  async getTransactionHistory(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: string;
    } = {}
  ) {
    const { limit = 50, offset = 0, type } = options;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.pointTransaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Calculate cost for creating a question
   */
  calculateQuestionCost(options: {
    isAnonymous: boolean;
    isUrgent: boolean;
  }): number {
    let cost = config.points.questionCost.basic; // 10 points base

    if (options.isAnonymous) {
      cost += config.points.questionCost.anonymous; // +3 points
    }

    if (options.isUrgent) {
      cost += config.points.questionCost.urgent; // +5 points
    }

    return cost;
  }

  /**
   * Check if user can afford to create a question
   */
  async canAffordQuestion(
    userId: string,
    cost: number
  ): Promise<{ canAfford: boolean; current: number; needed: number }> {
    const balance = await this.getBalance(userId);

    return {
      canAfford: balance >= cost,
      current: balance,
      needed: Math.max(0, cost - balance),
    };
  }
}

export default new PointsService();
