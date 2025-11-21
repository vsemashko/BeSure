import prisma from '../config/database';
import pointsService from './points.service';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

export interface CastVoteInput {
  userId: string;
  questionId: string;
  optionId: string;
}

class VoteService {
  /**
   * Cast a vote on a question
   */
  async castVote(input: CastVoteInput): Promise<{
    vote: any;
    pointsEarned: number;
    newBalance: number;
  }> {
    const { userId, questionId, optionId } = input;

    // Validate vote
    await this.validateVote(userId, questionId, optionId);

    // Cast vote and award points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create vote
      const vote = await tx.vote.create({
        data: {
          userId,
          questionId,
          optionId,
        },
      });

      // Award points for voting
      const newBalance = await pointsService.awardVotePoints(userId, questionId);

      return { vote, newBalance };
    });

    logger.info(`User ${userId} voted on question ${questionId}`);

    return {
      vote: result.vote,
      pointsEarned: 2, // From config
      newBalance: result.newBalance,
    };
  }

  /**
   * Get votes for a question
   */
  async getQuestionVotes(questionId: string) {
    const votes = await prisma.vote.findMany({
      where: { questionId },
      include: {
        option: {
          select: {
            id: true,
            content: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return votes;
  }

  /**
   * Get user's voting history
   */
  async getUserVotes(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 50, offset = 0 } = options;

    const [votes, total] = await Promise.all([
      prisma.vote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          question: {
            select: {
              id: true,
              title: true,
              status: true,
              expiresAt: true,
            },
          },
          option: {
            select: {
              id: true,
              content: true,
            },
          },
        },
      }),
      prisma.vote.count({ where: { userId } }),
    ]);

    return {
      votes,
      total,
      limit,
      offset,
    };
  }

  /**
   * Check if user has voted on a question
   */
  async hasUserVoted(userId: string, questionId: string): Promise<boolean> {
    const vote = await prisma.vote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    return !!vote;
  }

  /**
   * Get vote statistics for a question
   */
  async getQuestionStats(questionId: string) {
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
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Question');
    }

    const totalVotes = question._count.votes;

    const optionStats = question.options.map((option) => ({
      optionId: option.id,
      content: option.content,
      voteCount: option._count.votes,
      percentage: totalVotes > 0 ? (option._count.votes / totalVotes) * 100 : 0,
    }));

    // Sort by vote count descending
    optionStats.sort((a, b) => b.voteCount - a.voteCount);

    return {
      questionId: question.id,
      totalVotes,
      options: optionStats,
      status: question.status,
      expiresAt: question.expiresAt,
    };
  }

  /**
   * Validate vote before casting
   */
  private async validateVote(
    userId: string,
    questionId: string,
    optionId: string
  ): Promise<void> {
    // Check if question exists and is active
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        status: true,
        expiresAt: true,
        userId: true,
        options: {
          select: { id: true },
        },
      },
    });

    if (!question) {
      throw new NotFoundError('Question');
    }

    if (question.status !== 'active') {
      throw new ValidationError('This question is no longer active');
    }

    if (question.expiresAt < new Date()) {
      throw new ValidationError('This question has expired');
    }

    // Check if user is trying to vote on their own question
    if (question.userId === userId) {
      throw new ValidationError('You cannot vote on your own question');
    }

    // Check if option belongs to this question
    const validOption = question.options.find((opt) => opt.id === optionId);
    if (!validOption) {
      throw new ValidationError('Invalid option for this question');
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
    });

    if (existingVote) {
      throw new ConflictError('You have already voted on this question');
    }
  }

  /**
   * Get user's vote on a specific question
   */
  async getUserVoteOnQuestion(userId: string, questionId: string) {
    const vote = await prisma.vote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId,
        },
      },
      include: {
        option: {
          select: {
            id: true,
            content: true,
            imageUrl: true,
          },
        },
      },
    });

    return vote;
  }
}

export default new VoteService();
