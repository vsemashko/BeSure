import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

interface TopicExpertise {
  topicId: string;
  topicName: string;
  voteCount: number;
  expertiseLevel: string;
}

interface UserTopicProfile {
  userId: string;
  username: string;
  expertise: TopicExpertise[];
  topExpertise: TopicExpertise[];
  badges: string[];
}

class TopicService {
  /**
   * Expertise level thresholds based on vote count
   */
  private expertiseLevels = [
    { level: 'master', minVotes: 50, badge: 'topic_master' },
    { level: 'expert', minVotes: 25, badge: 'topic_expert' },
    { level: 'knowledgeable', minVotes: 10, badge: 'topic_knowledgeable' },
    { level: 'interested', minVotes: 1, badge: null },
  ];

  /**
   * Calculate expertise level based on vote count
   */
  private calculateExpertiseLevel(voteCount: number): string {
    for (const level of this.expertiseLevels) {
      if (voteCount >= level.minVotes) {
        return level.level;
      }
    }
    return 'interested';
  }

  /**
   * Update user's topic expertise after voting on a question
   */
  async updateTopicExpertiseOnVote(
    userId: string,
    questionId: string
  ): Promise<TopicExpertise[]> {
    // Get question topics
    const questionTopics = await prisma.questionTopic.findMany({
      where: { questionId },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (questionTopics.length === 0) {
      return [];
    }

    const updatedExpertise: TopicExpertise[] = [];

    for (const qt of questionTopics) {
      const topicId = qt.topicId;

      // Get or create user topic expertise
      let expertise = await prisma.userTopicExpertise.findUnique({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
      });

      const newVoteCount = (expertise?.voteCount || 0) + 1;
      const newLevel = this.calculateExpertiseLevel(newVoteCount);
      const oldLevel = expertise?.expertiseLevel || null;

      // Upsert expertise record
      expertise = await prisma.userTopicExpertise.upsert({
        where: {
          userId_topicId: {
            userId,
            topicId,
          },
        },
        create: {
          userId,
          topicId,
          voteCount: 1,
          expertiseLevel: newLevel,
        },
        update: {
          voteCount: newVoteCount,
          expertiseLevel: newLevel,
        },
      });

      // Check if level increased and award badge
      if (oldLevel !== newLevel && newLevel !== 'interested') {
        await this.awardExpertiseBadge(userId, topicId, qt.topic.name, newLevel);
      }

      updatedExpertise.push({
        topicId,
        topicName: qt.topic.name,
        voteCount: newVoteCount,
        expertiseLevel: newLevel,
      });

      logger.info(
        `User ${userId} expertise in ${qt.topic.name}: ${newLevel} (${newVoteCount} votes)`
      );
    }

    return updatedExpertise;
  }

  /**
   * Award expertise badge for reaching a new level
   */
  private async awardExpertiseBadge(
    userId: string,
    topicId: string,
    topicName: string,
    level: string
  ): Promise<void> {
    const badgeType = `${level}_${topicId}`;

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
          topicId,
          topicName,
          expertiseLevel: level,
          earnedAt: new Date(),
        },
      },
    });

    logger.info(`User ${userId} earned ${level} badge in ${topicName}`);
  }

  /**
   * Get user's topic expertise profile
   */
  async getUserTopicProfile(userId: string): Promise<UserTopicProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get all expertise
    const expertise = await prisma.userTopicExpertise.findMany({
      where: { userId },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        voteCount: 'desc',
      },
    });

    const formattedExpertise = expertise.map((e) => ({
      topicId: e.topicId,
      topicName: e.topic.name,
      voteCount: e.voteCount,
      expertiseLevel: e.expertiseLevel || 'interested',
    }));

    // Get top 5 expertise areas
    const topExpertise = formattedExpertise.slice(0, 5);

    // Get expertise badges
    const badges = await prisma.userBadge.findMany({
      where: {
        userId,
        badgeType: {
          in: ['topic_master', 'topic_expert', 'topic_knowledgeable'].map((b) =>
            b.toString()
          ),
        },
      },
    });

    return {
      userId,
      username: user.username,
      expertise: formattedExpertise,
      topExpertise,
      badges: badges.map((b) => b.badgeType),
    };
  }

  /**
   * Get all topics
   */
  async getAllTopics(options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options;

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.topic.count(),
    ]);

    return {
      topics,
      total,
      limit,
      offset,
    };
  }

  /**
   * Create a new topic
   */
  async createTopic(data: { name: string; description?: string }) {
    const topic = await prisma.topic.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    logger.info(`Created new topic: ${data.name}`);

    return topic;
  }

  /**
   * Get topic by ID with stats
   */
  async getTopicById(topicId: string) {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        userExpertise: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            voteCount: 'desc',
          },
          take: 10, // Top 10 experts
        },
      },
    });

    if (!topic) {
      throw new NotFoundError('Topic');
    }

    return topic;
  }

  /**
   * Get topic leaderboard (top experts)
   */
  async getTopicLeaderboard(topicId: string, limit: number = 10) {
    const expertise = await prisma.userTopicExpertise.findMany({
      where: { topicId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        voteCount: 'desc',
      },
      take: limit,
    });

    return expertise.map((e) => ({
      userId: e.userId,
      username: e.user.username,
      voteCount: e.voteCount,
      expertiseLevel: e.expertiseLevel || 'interested',
    }));
  }

  /**
   * Auto-tag question with topics based on content
   * Simple keyword matching for MVP
   */
  async autoTagQuestion(questionId: string, questionText: string): Promise<string[]> {
    // Common topics and their keywords
    const topicKeywords: Record<string, string[]> = {
      fashion: ['outfit', 'wear', 'dress', 'style', 'clothes', 'fashion', 'shoes'],
      food: ['eat', 'food', 'restaurant', 'meal', 'cook', 'recipe', 'dinner'],
      travel: ['travel', 'trip', 'vacation', 'visit', 'destination', 'flight'],
      tech: ['phone', 'computer', 'app', 'software', 'device', 'tech', 'gadget'],
      career: ['job', 'career', 'work', 'interview', 'salary', 'promotion'],
      relationships: ['date', 'relationship', 'friend', 'love', 'partner'],
      entertainment: ['movie', 'show', 'game', 'watch', 'play', 'entertainment'],
      health: ['health', 'fitness', 'exercise', 'workout', 'diet', 'doctor'],
      finance: ['money', 'buy', 'purchase', 'invest', 'budget', 'save', 'spend'],
    };

    const text = questionText.toLowerCase();
    const matchedTopics: string[] = [];

    for (const [topicName, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        // Get or create topic
        let topic = await prisma.topic.findFirst({
          where: { name: topicName },
        });

        if (!topic) {
          topic = await this.createTopic({ name: topicName });
        }

        // Create question-topic relationship
        await prisma.questionTopic.upsert({
          where: {
            questionId_topicId: {
              questionId,
              topicId: topic.id,
            },
          },
          create: {
            questionId,
            topicId: topic.id,
            confidence: 0.8, // Simple matching = 80% confidence
          },
          update: {},
        });

        matchedTopics.push(topicName);
      }
    }

    logger.info(`Auto-tagged question ${questionId} with topics: ${matchedTopics.join(', ')}`);

    return matchedTopics;
  }
}

export default new TopicService();
