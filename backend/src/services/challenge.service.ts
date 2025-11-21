import prisma from '../config/database';
import pointsService from './points.service';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

interface DailyChallenges {
  date: string;
  challenges: Challenge[];
  completedCount: number;
  totalReward: number;
}

class ChallengeService {
  /**
   * Challenge templates based on PRD-PointSystem.md
   */
  private challengeTemplates = [
    {
      type: 'vote_count',
      title: 'Vote 3 Times',
      description: 'Cast 3 votes on questions today',
      target: 3,
      reward: 5,
    },
    {
      type: 'vote_count',
      title: 'Vote 5 Times',
      description: 'Cast 5 votes on questions today',
      target: 5,
      reward: 10,
    },
    {
      type: 'vote_count',
      title: 'Vote 10 Times',
      description: 'Cast 10 votes on questions today',
      target: 10,
      reward: 20,
    },
    {
      type: 'first_vote',
      title: 'Early Bird',
      description: 'Cast your first vote of the day',
      target: 1,
      reward: 5,
    },
    {
      type: 'vote_streak',
      title: 'Keep it Going',
      description: 'Vote today to maintain your streak',
      target: 1,
      reward: 10,
    },
    {
      type: 'help_others',
      title: 'Community Helper',
      description: 'Help 5 people make decisions',
      target: 5,
      reward: 15,
    },
  ];

  /**
   * Get today's date string (YYYY-MM-DD)
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Generate random daily challenges (3 per day)
   */
  private generateDailyChallenges(): Challenge[] {
    // Shuffle templates and pick 3
    const shuffled = [...this.challengeTemplates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    return selected.map((template, index) => ({
      id: `challenge_${index + 1}`,
      type: template.type,
      title: template.title,
      description: template.description,
      target: template.target,
      progress: 0,
      reward: template.reward,
      completed: false,
    }));
  }

  /**
   * Get or create user's daily challenges
   */
  async getDailyChallenges(userId: string): Promise<DailyChallenges> {
    const today = this.getTodayDateString();
    const todayDate = new Date(today);

    // Try to get existing challenges for today
    let userChallenge = await prisma.userChallenge.findUnique({
      where: {
        userId_challengeDate: {
          userId,
          challengeDate: todayDate,
        },
      },
    });

    // If no challenges for today, generate new ones
    if (!userChallenge) {
      const newChallenges = this.generateDailyChallenges();

      userChallenge = await prisma.userChallenge.create({
        data: {
          userId,
          challengeDate: todayDate,
          challenges: newChallenges,
          completed: [],
        },
      });

      logger.info(`Generated daily challenges for user ${userId}`);
    }

    const challenges = userChallenge.challenges as any as Challenge[];
    const completedIds = userChallenge.completed as any as string[];

    // Mark completed challenges
    const updatedChallenges = challenges.map((challenge) => ({
      ...challenge,
      completed: completedIds.includes(challenge.id),
    }));

    const completedCount = completedIds.length;
    const totalReward = updatedChallenges
      .filter((c) => c.completed)
      .reduce((sum, c) => sum + c.reward, 0);

    return {
      date: today,
      challenges: updatedChallenges,
      completedCount,
      totalReward,
    };
  }

  /**
   * Update challenge progress when user votes
   */
  async updateChallengeProgress(userId: string): Promise<{
    challengesCompleted: Challenge[];
    totalReward: number;
  }> {
    const today = this.getTodayDateString();
    const todayDate = new Date(today);

    // Get or create today's challenges
    const dailyChallenges = await this.getDailyChallenges(userId);

    // Count today's votes
    const todayStart = new Date(todayDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayDate);
    todayEnd.setHours(23, 59, 59, 999);

    const voteCount = await prisma.vote.count({
      where: {
        userId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Update progress for each challenge
    const updatedChallenges = dailyChallenges.challenges.map((challenge) => {
      let progress = 0;

      switch (challenge.type) {
        case 'vote_count':
        case 'first_vote':
        case 'vote_streak':
        case 'help_others':
          progress = Math.min(voteCount, challenge.target);
          break;
      }

      return {
        ...challenge,
        progress,
        completed: challenge.completed || progress >= challenge.target,
      };
    });

    // Find newly completed challenges
    const newlyCompleted = updatedChallenges.filter(
      (challenge) =>
        challenge.completed &&
        !dailyChallenges.challenges.find((c) => c.id === challenge.id)?.completed
    );

    // Update database
    const completedIds = updatedChallenges
      .filter((c) => c.completed)
      .map((c) => c.id);

    await prisma.userChallenge.update({
      where: {
        userId_challengeDate: {
          userId,
          challengeDate: todayDate,
        },
      },
      data: {
        challenges: updatedChallenges,
        completed: completedIds,
      },
    });

    // Award points for newly completed challenges
    let totalReward = 0;
    for (const challenge of newlyCompleted) {
      await pointsService.awardPoints({
        userId,
        amount: challenge.reward,
        type: 'challenge_complete',
        metadata: {
          challengeId: challenge.id,
          challengeTitle: challenge.title,
        },
      });

      totalReward += challenge.reward;

      logger.info(
        `User ${userId} completed challenge: ${challenge.title} (+${challenge.reward} points)`
      );
    }

    return {
      challengesCompleted: newlyCompleted,
      totalReward,
    };
  }

  /**
   * Get user's challenge history
   */
  async getChallengeHistory(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 30, offset = 0 } = options;

    const [challenges, total] = await Promise.all([
      prisma.userChallenge.findMany({
        where: { userId },
        orderBy: { challengeDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userChallenge.count({ where: { userId } }),
    ]);

    return {
      history: challenges.map((c) => ({
        date: c.challengeDate.toISOString().split('T')[0],
        challenges: c.challenges,
        completed: c.completed,
        completedCount: (c.completed as any as string[]).length,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get user's challenge statistics
   */
  async getChallengeStats(userId: string) {
    const allChallenges = await prisma.userChallenge.findMany({
      where: { userId },
      select: {
        completed: true,
        challenges: true,
      },
    });

    const totalDays = allChallenges.length;
    const totalChallengesCompleted = allChallenges.reduce(
      (sum, day) => sum + (day.completed as any as string[]).length,
      0
    );
    const totalChallengesPossible = totalDays * 3; // 3 challenges per day

    // Calculate total rewards earned from challenges
    const totalRewards = allChallenges.reduce((sum, day) => {
      const challenges = day.challenges as any as Challenge[];
      const completedIds = day.completed as any as string[];
      const dayRewards = challenges
        .filter((c) => completedIds.includes(c.id))
        .reduce((s, c) => s + c.reward, 0);
      return sum + dayRewards;
    }, 0);

    const completionRate =
      totalChallengesPossible > 0
        ? (totalChallengesCompleted / totalChallengesPossible) * 100
        : 0;

    return {
      totalDays,
      totalChallengesCompleted,
      totalChallengesPossible,
      completionRate: Math.round(completionRate * 10) / 10,
      totalRewards,
    };
  }
}

export default new ChallengeService();
