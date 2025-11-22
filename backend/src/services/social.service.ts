import prisma from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

interface UserProfile {
  id: string;
  username: string;
  points: number;
  createdAt: Date;
  profileData: any;
  isFollowing?: boolean;
  isFollower?: boolean;
  stats: {
    followersCount: number;
    followingCount: number;
    questionsCount: number;
    votesCount: number;
  };
}

interface FollowResult {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

class SocialService {
  /**
   * Follow a user
   */
  async followUser(followerId: string, followingId: string): Promise<FollowResult> {
    // Validate
    if (followerId === followingId) {
      throw new ValidationError('Cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      throw new NotFoundError('User');
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictError('Already following this user');
    }

    // Create follow relationship
    const follow = await prisma.userFollow.create({
      data: {
        followerId,
        followingId,
      },
    });

    logger.info(`User ${followerId} followed user ${followingId}`);

    return follow;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundError('Follow relationship');
    }

    await prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    logger.info(`User ${followerId} unfollowed user ${followingId}`);
  }

  /**
   * Check if user is following another user
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }

  /**
   * Get user's followers
   */
  async getFollowers(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 50, offset = 0 } = options;

    const [follows, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              points: true,
              createdAt: true,
              profileData: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userFollow.count({ where: { followingId: userId } }),
    ]);

    return {
      followers: follows.map((f) => f.follower),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 50, offset = 0 } = options;

    const [follows, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              points: true,
              createdAt: true,
              profileData: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    return {
      following: follows.map((f) => f.following),
      total,
      limit,
      offset,
    };
  }

  /**
   * Get friend feed (questions from users you follow)
   */
  async getFriendFeed(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 20, offset = 0 } = options;

    // Get list of users being followed
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return {
        questions: [],
        total: 0,
        limit,
        offset,
      };
    }

    // Get questions from followed users
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: {
          userId: { in: followingIds },
          status: 'active',
          privacyLevel: { in: ['public', 'friends'] },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          options: {
            include: {
              _count: {
                select: { votes: true },
              },
            },
          },
          _count: {
            select: { votes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.question.count({
        where: {
          userId: { in: followingIds },
          status: 'active',
          privacyLevel: { in: ['public', 'friends'] },
        },
      }),
    ]);

    return {
      questions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get user profile with stats
   */
  async getUserProfile(userId: string, viewerId?: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        points: true,
        createdAt: true,
        profileData: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get stats
    const [followersCount, followingCount, questionsCount, votesCount] =
      await Promise.all([
        prisma.userFollow.count({ where: { followingId: userId } }),
        prisma.userFollow.count({ where: { followerId: userId } }),
        prisma.question.count({ where: { userId } }),
        prisma.vote.count({ where: { userId } }),
      ]);

    let isFollowing = false;
    let isFollower = false;

    if (viewerId && viewerId !== userId) {
      [isFollowing, isFollower] = await Promise.all([
        this.isFollowing(viewerId, userId),
        this.isFollowing(userId, viewerId),
      ]);
    }

    return {
      ...user,
      isFollowing,
      isFollower,
      stats: {
        followersCount,
        followingCount,
        questionsCount,
        votesCount,
      },
    };
  }

  /**
   * Search users by username
   */
  async searchUsers(
    query: string,
    options: { limit?: number; offset?: number; viewerId?: string } = {}
  ) {
    const { limit = 20, offset = 0, viewerId } = options;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          username: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          username: true,
          points: true,
          createdAt: true,
          profileData: true,
        },
        orderBy: { points: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({
        where: {
          username: {
            contains: query,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    // Add following status if viewer provided
    const usersWithStatus = viewerId
      ? await Promise.all(
          users.map(async (user) => ({
            ...user,
            isFollowing: await this.isFollowing(viewerId, user.id),
          }))
        )
      : users;

    return {
      users: usersWithStatus,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get suggested users to follow (users with similar interests)
   */
  async getSuggestedUsers(
    userId: string,
    options: { limit?: number } = {}
  ) {
    const { limit = 10 } = options;

    // Get user's topic interests
    const userTopics = await prisma.userTopicExpertise.findMany({
      where: { userId },
      select: { topicId: true },
      take: 5,
      orderBy: { voteCount: 'desc' },
    });

    const topicIds = userTopics.map((t) => t.topicId);

    if (topicIds.length === 0) {
      // No topics yet, suggest popular users
      return this.getPopularUsers({ limit });
    }

    // Get users who are active in same topics
    const suggestedUserIds = await prisma.userTopicExpertise.findMany({
      where: {
        topicId: { in: topicIds },
        userId: { not: userId },
      },
      select: { userId: true },
      distinct: ['userId'],
      take: limit * 2, // Get more candidates
    });

    // Exclude already following
    const following = await prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    const candidateIds = suggestedUserIds
      .map((u) => u.userId)
      .filter((id) => !followingIds.includes(id))
      .slice(0, limit);

    const users = await prisma.user.findMany({
      where: { id: { in: candidateIds } },
      select: {
        id: true,
        username: true,
        points: true,
        createdAt: true,
        profileData: true,
      },
    });

    return {
      users,
      total: users.length,
    };
  }

  /**
   * Get popular users (by points)
   */
  async getPopularUsers(options: { limit?: number; offset?: number } = {}) {
    const { limit = 10, offset = 0 } = options;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          points: true,
          createdAt: true,
          profileData: true,
        },
        orderBy: { points: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      total,
      limit,
      offset,
    };
  }
}

export default new SocialService();
