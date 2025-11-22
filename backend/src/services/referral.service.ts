import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import pointsService from './points.service';

// Referral reward amount
const REFERRAL_REWARD_POINTS = 10;

// Characters allowed in referral codes
const REFERRAL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0,O,1,I)
const REFERRAL_CODE_LENGTH = 8;

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

class ReferralService {
  /**
   * Generate a unique referral code
   */
  private generateReferralCode(): string {
    let code = '';
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * REFERRAL_CODE_CHARS.length);
      code += REFERRAL_CODE_CHARS[randomIndex];
    }
    return code;
  }

  /**
   * Create a unique referral code for a user (called during registration)
   */
  async createReferralCode(userId: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = this.generateReferralCode();

      try {
        // Try to update user with this code
        await prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
        });

        logger.info(`Generated referral code ${code} for user ${userId}`);
        return code;
      } catch (error: any) {
        // If unique constraint fails, try again
        if (error.code === 'P2002') {
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed to generate unique referral code after maximum attempts');
  }

  /**
   * Get user's referral code
   */
  async getUserReferralCode(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.referralCode) {
      // Generate one if it doesn't exist (for existing users)
      return await this.createReferralCode(userId);
    }

    return user.referralCode;
  }

  /**
   * Apply a referral code when a user signs up
   * This should be called during user registration
   */
  async applyReferralCode(
    newUserId: string,
    referralCode: string
  ): Promise<{ referrerId: string; referrerUsername: string }> {
    // Find the referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      select: { id: true, username: true },
    });

    if (!referrer) {
      throw new ValidationError('Invalid referral code');
    }

    // Check if user is trying to refer themselves
    if (referrer.id === newUserId) {
      throw new ValidationError('You cannot use your own referral code');
    }

    // Check if new user already has a referrer
    const existingUser = await prisma.user.findUnique({
      where: { id: newUserId },
      select: { referredBy: true },
    });

    if (existingUser?.referredBy) {
      throw new ValidationError('User has already been referred');
    }

    // Create referral record and update user
    await prisma.$transaction(async (tx) => {
      // Update new user with referrer
      await tx.user.update({
        where: { id: newUserId },
        data: { referredBy: referrer.id },
      });

      // Create referral record
      await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: newUserId,
          referralCode: referralCode.toUpperCase(),
        },
      });
    });

    logger.info(`User ${newUserId} was referred by ${referrer.id} using code ${referralCode}`);

    return {
      referrerId: referrer.id,
      referrerUsername: referrer.username,
    };
  }

  /**
   * Check if a referred user has completed their first question
   * If yes, award points to the referrer
   */
  async checkAndRewardReferral(userId: string): Promise<boolean> {
    // Find referral record for this user
    const referral = await prisma.referral.findUnique({
      where: { referredId: userId },
      include: {
        referrer: {
          select: { id: true, username: true },
        },
        referred: {
          select: { username: true },
        },
      },
    });

    // No referral or already rewarded
    if (!referral || referral.pointsAwarded) {
      return false;
    }

    // Check if user has created at least one question
    const questionCount = await prisma.question.count({
      where: { userId },
    });

    if (questionCount === 0) {
      return false;
    }

    // Award points to referrer
    await prisma.$transaction(async (tx) => {
      // Award points
      await pointsService.awardPoints({
        userId: referral.referrerId,
        amount: REFERRAL_REWARD_POINTS,
        type: 'referral',
        referenceId: userId,
        metadata: {
          referredUser: referral.referred.username,
          referralCode: referral.referralCode,
        },
      });

      // Mark referral as rewarded
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          pointsAwarded: true,
          rewardedAt: new Date(),
        },
      });
    });

    logger.info(
      `Awarded ${REFERRAL_REWARD_POINTS} points to ${referral.referrer.username} for referring ${referral.referred.username}`
    );

    return true;
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: string): Promise<ReferralStats> {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      select: {
        pointsAwarded: true,
      },
    });

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter((r) => r.pointsAwarded).length;
    const pendingReferrals = totalReferrals - successfulReferrals;
    const totalPointsEarned = successfulReferrals * REFERRAL_REWARD_POINTS;

    return {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      totalPointsEarned,
    };
  }

  /**
   * Get list of users referred by this user
   */
  async getReferredUsers(userId: string, limit: number = 50) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            username: true,
            profileData: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return referrals.map((r) => ({
      username: r.referred.username,
      profileData: r.referred.profileData,
      joinedAt: r.referred.createdAt,
      referredAt: r.createdAt,
      pointsAwarded: r.pointsAwarded,
      rewardedAt: r.rewardedAt,
    }));
  }

  /**
   * Validate referral code format
   */
  validateReferralCode(code: string): boolean {
    if (!code || code.length !== REFERRAL_CODE_LENGTH) {
      return false;
    }

    // Check if all characters are valid
    return code
      .toUpperCase()
      .split('')
      .every((char) => REFERRAL_CODE_CHARS.includes(char));
  }
}

export default new ReferralService();
