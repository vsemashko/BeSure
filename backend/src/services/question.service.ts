import prisma from '../config/database';
import config from '../config/constants';
import pointsService from './points.service';
import topicService from './topic.service';
import referralService from './referral.service';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  InsufficientPointsError,
} from '../utils/errors';
import logger from '../utils/logger';

export interface CreateQuestionInput {
  userId: string;
  title: string;
  description?: string;
  options: Array<{
    content: string;
    imageUrl?: string;
  }>;
  expiresInMinutes: number;
  isAnonymous: boolean;
  privacyLevel: 'public' | 'friends';
}

export interface QuestionWithDetails {
  id: string;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  privacyLevel: string;
  expiresAt: Date;
  createdAt: Date;
  status: string;
  options: Array<{
    id: string;
    content: string;
    imageUrl: string | null;
    orderIndex: number;
    voteCount?: number;
    percentage?: number;
  }>;
  user?: {
    id: string;
    username: string;
  };
  totalVotes: number;
  hasVoted?: boolean;
  userVote?: string; // optionId if user has voted
}

class QuestionService {
  /**
   * Create a new question
   */
  async createQuestion(input: CreateQuestionInput): Promise<QuestionWithDetails> {
    // Validate input
    this.validateCreateInput(input);

    // Calculate question cost
    const isUrgent = input.expiresInMinutes < 360; // < 6 hours
    const cost = pointsService.calculateQuestionCost({
      isAnonymous: input.isAnonymous,
      isUrgent,
    });

    // Check if user can afford it
    const affordability = await pointsService.canAffordQuestion(input.userId, cost);
    if (!affordability.canAfford) {
      throw new InsufficientPointsError(cost, affordability.current);
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + input.expiresInMinutes);

    // Create question in a transaction
    const question = await prisma.$transaction(async (tx) => {
      // Create question
      const newQuestion = await tx.question.create({
        data: {
          userId: input.userId,
          title: input.title,
          description: input.description,
          isAnonymous: input.isAnonymous,
          privacyLevel: input.privacyLevel,
          expiresAt,
          metadata: { cost, isUrgent },
          options: {
            create: input.options.map((option, index) => ({
              content: option.content,
              imageUrl: option.imageUrl,
              orderIndex: index,
            })),
          },
        },
        include: {
          options: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      // Deduct points from user
      await pointsService.deductQuestionPoints(input.userId, newQuestion.id, cost);

      return newQuestion;
    });

    logger.info(
      `Question created: ${question.id} by user ${input.userId} (cost: ${cost} points)`
    );

    // Auto-tag question with topics
    const questionText = `${input.title} ${input.description || ''}`;
    await topicService.autoTagQuestion(question.id, questionText);

    // Check and reward referrals (if this is user's first question)
    try {
      const rewarded = await referralService.checkAndRewardReferral(input.userId);
      if (rewarded) {
        logger.info(`Referral reward processed for user ${input.userId}'s first question`);
      }
    } catch (error) {
      logger.error('Error processing referral reward:', error);
      // Don't fail question creation if referral check fails
    }

    return this.formatQuestion(question);
  }

  /**
   * Get a single question by ID
   */
  async getQuestion(
    questionId: string,
    userId?: string
  ): Promise<QuestionWithDetails> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        votes: userId
          ? {
              where: { userId },
              select: { optionId: true },
            }
          : false,
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Question');
    }

    // Calculate vote counts and percentages
    const totalVotes = question._count.votes;
    const options = question.options.map((option: any) => ({
      id: option.id,
      content: option.content,
      imageUrl: option.imageUrl,
      orderIndex: option.orderIndex,
      voteCount: option._count.votes,
      percentage: totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0,
    }));

    // Check if user has voted
    const hasVoted = Boolean(userId && (question.votes as any[]).length > 0);
    const userVote = hasVoted ? (question.votes as any[])[0].optionId : undefined;

    return {
      id: question.id,
      title: question.title,
      description: question.description,
      isAnonymous: question.isAnonymous,
      privacyLevel: question.privacyLevel,
      expiresAt: question.expiresAt,
      createdAt: question.createdAt,
      status: question.status,
      options,
      user: question.isAnonymous ? undefined : question.user,
      totalVotes,
      hasVoted,
      userVote,
    };
  }

  /**
   * Get question feed
   */
  async getFeed(options: {
    userId?: string;
    mode?: 'urgent' | 'popular' | 'foryou';
    limit?: number;
    offset?: number;
  }) {
    const { userId, mode = 'foryou', limit = 20, offset = 0 } = options;

    // Build where clause
    const where: any = {
      status: 'active',
      expiresAt: {
        gt: new Date(), // Not expired
      },
    };

    // Exclude questions user has voted on
    if (userId) {
      where.votes = {
        none: {
          userId,
        },
      };
    }

    // Build order by clause based on mode
    let orderBy: any = { createdAt: 'desc' };

    if (mode === 'urgent') {
      orderBy = { expiresAt: 'asc' }; // Expiring soon first
    } else if (mode === 'popular') {
      // TODO: Implement proper sorting by vote count
      // For now, just use createdAt
      orderBy = { createdAt: 'desc' };
    }

    // Fetch questions
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          options: {
            select: {
              id: true,
              content: true,
              imageUrl: true,
              orderIndex: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: { votes: true },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions: questions.map((q) => this.formatQuestion(q)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Close expired questions
   */
  async closeExpiredQuestions(): Promise<number> {
    const now = new Date();

    // Find expired questions with details
    const expiredQuestions = await prisma.question.findMany({
      where: {
        status: 'active',
        expiresAt: {
          lte: now,
        },
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    if (expiredQuestions.length === 0) {
      return 0;
    }

    // Close them and award points
    for (const question of expiredQuestions) {
      try {
        await prisma.question.update({
          where: { id: question.id },
          data: { status: 'closed' },
        });

        // Award completion rewards
        await pointsService.awardQuestionCompletionRewards(question.id);

        // Determine the winning option (most votes)
        if (question.options.length > 0) {
          const sortedOptions = question.options.sort(
            (a, b) => b._count.votes - a._count.votes
          );
          const winningOption = sortedOptions[0];

          // Send notification if there were any votes
          if (winningOption._count.votes > 0) {
            const notificationService = (
              await import('./notification.service')
            ).default;
            await notificationService
              .sendQuestionAnsweredNotification(
                question.userId,
                question.id,
                question.title,
                winningOption.content
              )
              .catch((err) =>
                logger.error(
                  `Failed to send question answered notification for ${question.id}`,
                  err
                )
              );
          }
        }
      } catch (error) {
        logger.error(`Failed to close question ${question.id}:`, error);
      }
    }

    logger.info(`Closed ${expiredQuestions.length} expired questions`);

    return expiredQuestions.length;
  }

  /**
   * Delete a question (user must own it)
   */
  async deleteQuestion(questionId: string, userId: string): Promise<void> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        userId: true,
        status: true,
        votes: { select: { id: true } },
      },
    });

    if (!question) {
      throw new NotFoundError('Question');
    }

    if (question.userId !== userId) {
      throw new AuthorizationError('You can only delete your own questions');
    }

    if (question.votes.length > 0) {
      throw new ValidationError('Cannot delete a question that has votes');
    }

    // Delete question and refund points
    await prisma.$transaction(async (tx) => {
      // Get question cost from metadata
      const fullQuestion = await tx.question.findUnique({
        where: { id: questionId },
        select: { metadata: true },
      });

      const cost = (fullQuestion?.metadata as any)?.cost || config.points.questionCost.basic;

      // Delete question
      await tx.question.delete({
        where: { id: questionId },
      });

      // Refund points
      await pointsService.awardPoints({
        userId,
        amount: cost,
        type: 'question_delete_refund',
        referenceId: questionId,
      });
    });

    logger.info(`Question ${questionId} deleted by user ${userId}`);
  }

  /**
   * Get user's questions
   */
  async getUserQuestions(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 20, offset = 0 } = options;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          options: true,
          _count: {
            select: { votes: true },
          },
        },
      }),
      prisma.question.count({ where: { userId } }),
    ]);

    return {
      questions: questions.map((q) => this.formatQuestion(q)),
      total,
      limit,
      offset,
    };
  }

  /**
   * Validate create question input
   */
  private validateCreateInput(input: CreateQuestionInput): void {
    // Title validation
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError('Question title is required');
    }
    if (input.title.length > config.question.maxTitleLength) {
      throw new ValidationError(
        `Question title must be less than ${config.question.maxTitleLength} characters`
      );
    }

    // Options validation
    if (!input.options || input.options.length < config.question.minOptions) {
      throw new ValidationError(
        `At least ${config.question.minOptions} options are required`
      );
    }
    if (input.options.length > config.question.maxOptions) {
      throw new ValidationError(
        `Maximum ${config.question.maxOptions} options allowed`
      );
    }

    // Validate each option
    input.options.forEach((option, index) => {
      if (!option.content && !option.imageUrl) {
        throw new ValidationError(`Option ${index + 1} must have content or an image`);
      }
      if (option.content && option.content.length > config.question.maxOptionLength) {
        throw new ValidationError(
          `Option ${index + 1} must be less than ${config.question.maxOptionLength} characters`
        );
      }
    });

    // Expiration validation
    const minMinutes = config.question.minExpirationMinutes;
    const maxMinutes = config.question.maxExpirationDays * 24 * 60;

    if (input.expiresInMinutes < minMinutes) {
      throw new ValidationError(
        `Expiration must be at least ${minMinutes} minutes`
      );
    }
    if (input.expiresInMinutes > maxMinutes) {
      throw new ValidationError(
        `Expiration must be less than ${config.question.maxExpirationDays} days`
      );
    }
  }

  /**
   * Format question for API response
   */
  private formatQuestion(question: any): QuestionWithDetails {
    const totalVotes = question._count?.votes || 0;

    return {
      id: question.id,
      title: question.title,
      description: question.description,
      isAnonymous: question.isAnonymous,
      privacyLevel: question.privacyLevel,
      expiresAt: question.expiresAt,
      createdAt: question.createdAt,
      status: question.status,
      options: question.options.map((opt: any) => ({
        id: opt.id,
        content: opt.content,
        imageUrl: opt.imageUrl,
        orderIndex: opt.orderIndex,
        voteCount: opt._count?.votes,
        percentage: opt._count?.votes ? (opt._count.votes / totalVotes) * 100 : 0,
      })),
      user: question.isAnonymous ? undefined : question.user,
      totalVotes,
    };
  }
}

export default new QuestionService();
