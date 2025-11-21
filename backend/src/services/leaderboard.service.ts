import prisma from '../config/database';
import logger from '../utils/logger';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  value: number;
  profileData?: any;
}

interface LeaderboardResult {
  leaderboard: LeaderboardEntry[];
  total: number;
  userRank?: {
    rank: number;
    value: number;
  };
}

type LeaderboardType = 'points' | 'streak' | 'questions' | 'votes' | 'topic_expertise';

class LeaderboardService {
  /**
   * Get global points leaderboard
   */
  async getPointsLeaderboard(
    options: { limit?: number; offset?: number; userId?: string } = {}
  ): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0, userId } = options;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          points: true,
          profileData: true,
        },
        orderBy: { points: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count(),
    ]);

    const leaderboard = users.map((user, index) => ({
      rank: offset + index + 1,
      userId: user.id,
      username: user.username,
      value: user.points,
      profileData: user.profileData,
    }));

    let userRank: { rank: number; value: number } | undefined;

    if (userId) {
      userRank = await this.getUserRankInPoints(userId);
    }

    return {
      leaderboard,
      total,
      userRank,
    };
  }

  /**
   * Get global streak leaderboard
   */
  async getStreakLeaderboard(
    options: { limit?: number; offset?: number; userId?: string } = {}
  ): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0, userId } = options;

    const [stats, total] = await Promise.all([
      prisma.userPointStats.findMany({
        where: {
          streakDays: {
            gt: 0,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileData: true,
            },
          },
        },
        orderBy: { streakDays: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userPointStats.count({
        where: {
          streakDays: {
            gt: 0,
          },
        },
      }),
    ]);

    const leaderboard = stats.map((stat, index) => ({
      rank: offset + index + 1,
      userId: stat.userId,
      username: stat.user.username,
      value: stat.streakDays,
      profileData: stat.user.profileData,
    }));

    let userRank: { rank: number; value: number } | undefined;

    if (userId) {
      userRank = await this.getUserRankInStreak(userId);
    }

    return {
      leaderboard,
      total,
      userRank,
    };
  }

  /**
   * Get question creators leaderboard
   */
  async getQuestionCreatorsLeaderboard(
    options: { limit?: number; offset?: number; userId?: string } = {}
  ): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0, userId } = options;

    const questionCounts = await prisma.question.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    const userIds = questionCounts.map((q) => q.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        profileData: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = questionCounts.map((q, index) => {
      const user = userMap.get(q.userId);
      return {
        rank: offset + index + 1,
        userId: q.userId,
        username: user?.username || 'Unknown',
        value: q._count.id,
        profileData: user?.profileData,
      };
    });

    const total = await prisma.user.count();

    let userRank: { rank: number; value: number } | undefined;

    if (userId) {
      userRank = await this.getUserRankInQuestions(userId);
    }

    return {
      leaderboard,
      total,
      userRank,
    };
  }

  /**
   * Get voters leaderboard
   */
  async getVotersLeaderboard(
    options: { limit?: number; offset?: number; userId?: string } = {}
  ): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0, userId } = options;

    const voteCounts = await prisma.vote.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    const userIds = voteCounts.map((v) => v.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        profileData: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = voteCounts.map((v, index) => {
      const user = userMap.get(v.userId);
      return {
        rank: offset + index + 1,
        userId: v.userId,
        username: user?.username || 'Unknown',
        value: v._count.id,
        profileData: user?.profileData,
      };
    });

    const total = await prisma.user.count();

    let userRank: { rank: number; value: number } | undefined;

    if (userId) {
      userRank = await this.getUserRankInVotes(userId);
    }

    return {
      leaderboard,
      total,
      userRank,
    };
  }

  /**
   * Get friend leaderboard (filtered by followed users)
   */
  async getFriendLeaderboard(
    userId: string,
    type: LeaderboardType,
    options: { limit?: number } = {}
  ): Promise<LeaderboardResult> {
    const { limit = 50 } = options;

    // Get list of users being followed
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const friendIds = [...following.map((f) => f.followingId), userId]; // Include self

    if (friendIds.length === 0) {
      return {
        leaderboard: [],
        total: 0,
      };
    }

    switch (type) {
      case 'points':
        return this.getFriendPointsLeaderboard(friendIds, limit);
      case 'streak':
        return this.getFriendStreakLeaderboard(friendIds, limit);
      case 'questions':
        return this.getFriendQuestionsLeaderboard(friendIds, limit);
      case 'votes':
        return this.getFriendVotesLeaderboard(friendIds, limit);
      default:
        throw new Error('Invalid leaderboard type');
    }
  }

  /**
   * Get user's rank in points leaderboard
   */
  private async getUserRankInPoints(
    userId: string
  ): Promise<{ rank: number; value: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    if (!user) {
      return { rank: 0, value: 0 };
    }

    const rank = await prisma.user.count({
      where: {
        points: {
          gt: user.points,
        },
      },
    });

    return {
      rank: rank + 1,
      value: user.points,
    };
  }

  /**
   * Get user's rank in streak leaderboard
   */
  private async getUserRankInStreak(
    userId: string
  ): Promise<{ rank: number; value: number }> {
    const stats = await prisma.userPointStats.findUnique({
      where: { userId },
      select: { streakDays: true },
    });

    if (!stats) {
      return { rank: 0, value: 0 };
    }

    const rank = await prisma.userPointStats.count({
      where: {
        streakDays: {
          gt: stats.streakDays,
        },
      },
    });

    return {
      rank: rank + 1,
      value: stats.streakDays,
    };
  }

  /**
   * Get user's rank in questions leaderboard
   */
  private async getUserRankInQuestions(
    userId: string
  ): Promise<{ rank: number; value: number }> {
    const questionCount = await prisma.question.count({
      where: { userId },
    });

    const usersWithMore = await prisma.question.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: questionCount,
          },
        },
      },
    });

    return {
      rank: usersWithMore.length + 1,
      value: questionCount,
    };
  }

  /**
   * Get user's rank in votes leaderboard
   */
  private async getUserRankInVotes(
    userId: string
  ): Promise<{ rank: number; value: number }> {
    const voteCount = await prisma.vote.count({
      where: { userId },
    });

    const usersWithMore = await prisma.vote.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: voteCount,
          },
        },
      },
    });

    return {
      rank: usersWithMore.length + 1,
      value: voteCount,
    };
  }

  /**
   * Friend leaderboard helpers
   */
  private async getFriendPointsLeaderboard(
    friendIds: string[],
    limit: number
  ): Promise<LeaderboardResult> {
    const users = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: {
        id: true,
        username: true,
        points: true,
        profileData: true,
      },
      orderBy: { points: 'desc' },
      take: limit,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      value: user.points,
      profileData: user.profileData,
    }));

    return {
      leaderboard,
      total: friendIds.length,
    };
  }

  private async getFriendStreakLeaderboard(
    friendIds: string[],
    limit: number
  ): Promise<LeaderboardResult> {
    const stats = await prisma.userPointStats.findMany({
      where: {
        userId: { in: friendIds },
        streakDays: { gt: 0 },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileData: true,
          },
        },
      },
      orderBy: { streakDays: 'desc' },
      take: limit,
    });

    const leaderboard = stats.map((stat, index) => ({
      rank: index + 1,
      userId: stat.userId,
      username: stat.user.username,
      value: stat.streakDays,
      profileData: stat.user.profileData,
    }));

    return {
      leaderboard,
      total: friendIds.length,
    };
  }

  private async getFriendQuestionsLeaderboard(
    friendIds: string[],
    limit: number
  ): Promise<LeaderboardResult> {
    const questionCounts = await prisma.question.groupBy({
      by: ['userId'],
      where: { userId: { in: friendIds } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const userIds = questionCounts.map((q) => q.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, profileData: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = questionCounts.map((q, index) => {
      const user = userMap.get(q.userId);
      return {
        rank: index + 1,
        userId: q.userId,
        username: user?.username || 'Unknown',
        value: q._count.id,
        profileData: user?.profileData,
      };
    });

    return {
      leaderboard,
      total: friendIds.length,
    };
  }

  private async getFriendVotesLeaderboard(
    friendIds: string[],
    limit: number
  ): Promise<LeaderboardResult> {
    const voteCounts = await prisma.vote.groupBy({
      by: ['userId'],
      where: { userId: { in: friendIds } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const userIds = voteCounts.map((v) => v.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, profileData: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = voteCounts.map((v, index) => {
      const user = userMap.get(v.userId);
      return {
        rank: index + 1,
        userId: v.userId,
        username: user?.username || 'Unknown',
        value: v._count.id,
        profileData: user?.profileData,
      };
    });

    return {
      leaderboard,
      total: friendIds.length,
    };
  }
}

export default new LeaderboardService();
