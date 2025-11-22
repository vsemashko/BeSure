import prisma from '../config/database';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import logger from '../utils/logger';

export interface QuestionInsights {
  questionId: string;
  totalVotes: number;
  totalViews: number;
  engagementRate: number;
  votesByOption: Array<{
    optionId: string;
    content: string;
    voteCount: number;
    percentage: number;
  }>;
  voterDemographics: {
    totalVoters: number;
    avgPointsPerVoter: number;
    topVotersByPoints: Array<{
      userId: string;
      username: string;
      points: number;
    }>;
  };
  timeBasedTrends: Array<{
    timestamp: Date;
    cumulativeVotes: number;
  }>;
  createdAt: Date;
  expiresAt: Date;
  status: string;
}

export interface UserStats {
  userId: string;
  questionsCreated: number;
  totalVotesReceived: number;
  votesGiven: number;
  avgVotesPerQuestion: number;
  mostPopularQuestion: {
    id: string;
    title: string;
    voteCount: number;
  } | null;
  topPerformingTopics: Array<{
    topic: string;
    questionCount: number;
    avgVotes: number;
  }>;
}

export interface ExportData {
  question: {
    id: string;
    title: string;
    description: string | null;
    createdAt: Date;
    expiresAt: Date;
    status: string;
  };
  options: Array<{
    content: string;
    voteCount: number;
    percentage: number;
  }>;
  votes: Array<{
    optionContent: string;
    voterUsername: string;
    votedAt: Date;
    voterPoints: number;
  }>;
  summary: {
    totalVotes: number;
    engagementRate: number;
    winningOption: string;
  };
}

class AnalyticsService {
  /**
   * Get comprehensive insights for a specific question
   */
  async getQuestionInsights(
    questionId: string,
    requestingUserId: string
  ): Promise<QuestionInsights> {
    try {
      // Fetch question with all related data
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          options: {
            include: {
              votes: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      points: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      // Only question creator can view detailed insights
      if (question.user.id !== requestingUserId) {
        throw new AuthorizationError('Only question creator can view insights');
      }

      // Calculate total votes
      const totalVotes = question.options.reduce(
        (sum, option) => sum + option.votes.length,
        0
      );

      // Calculate views (for now, we'll estimate as votes * 3-5, can be enhanced with tracking)
      const totalViews = totalVotes > 0 ? Math.floor(totalVotes * 3.5) : 0;

      // Calculate engagement rate
      const engagementRate = totalViews > 0 ? (totalVotes / totalViews) * 100 : 0;

      // Votes by option
      const votesByOption = question.options.map((option) => ({
        optionId: option.id,
        content: option.content,
        voteCount: option.votes.length,
        percentage: totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0,
      }));

      // Voter demographics
      const allVoters = question.options.flatMap((option) =>
        option.votes.map((vote) => vote.user)
      );

      const avgPointsPerVoter =
        allVoters.length > 0
          ? allVoters.reduce((sum, voter) => sum + voter.points, 0) / allVoters.length
          : 0;

      const topVotersByPoints = allVoters
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)
        .map((voter) => ({
          userId: voter.id,
          username: voter.username,
          points: voter.points,
        }));

      const voterDemographics = {
        totalVoters: allVoters.length,
        avgPointsPerVoter: Math.round(avgPointsPerVoter),
        topVotersByPoints,
      };

      // Time-based trends (cumulative votes over time)
      const allVotes = question.options.flatMap((option) =>
        option.votes.map((vote) => ({
          timestamp: vote.createdAt,
        }))
      );

      const sortedVotes = allVotes.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      const timeBasedTrends = sortedVotes.map((vote, index) => ({
        timestamp: vote.timestamp,
        cumulativeVotes: index + 1,
      }));

      logger.info('Question insights generated', {
        questionId,
        totalVotes,
        engagementRate,
      });

      return {
        questionId: question.id,
        totalVotes,
        totalViews,
        engagementRate: Math.round(engagementRate * 100) / 100,
        votesByOption,
        voterDemographics,
        timeBasedTrends,
        createdAt: question.createdAt,
        expiresAt: question.expiresAt,
        status: question.status,
      };
    } catch (error) {
      logger.error('Error generating question insights', { error, questionId });
      throw error;
    }
  }

  /**
   * Get user statistics and performance metrics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Get all questions created by user
      const questions = await prisma.question.findMany({
        where: {
          userId,
          status: { not: 'deleted' },
        },
        include: {
          votes: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
      });

      const questionsCreated = questions.length;
      const totalVotesReceived = questions.reduce(
        (sum, q) => sum + q.votes.length,
        0
      );

      // Get votes given by user
      const votesGiven = await prisma.vote.count({
        where: { userId },
      });

      const avgVotesPerQuestion =
        questionsCreated > 0 ? totalVotesReceived / questionsCreated : 0;

      // Find most popular question
      let mostPopularQuestion = null;
      if (questions.length > 0) {
        const sorted = [...questions].sort((a, b) => b.votes.length - a.votes.length);
        const topQuestion = sorted[0];
        mostPopularQuestion = {
          id: topQuestion.id,
          title: topQuestion.title,
          voteCount: topQuestion.votes.length,
        };
      }

      // Calculate top performing topics
      const topicPerformance = new Map<
        string,
        { count: number; totalVotes: number }
      >();

      questions.forEach((question) => {
        question.topics.forEach((qt) => {
          const topicName = qt.topic.name;
          const existing = topicPerformance.get(topicName) || {
            count: 0,
            totalVotes: 0,
          };
          topicPerformance.set(topicName, {
            count: existing.count + 1,
            totalVotes: existing.totalVotes + question.votes.length,
          });
        });
      });

      const topPerformingTopics = Array.from(topicPerformance.entries())
        .map(([topic, data]) => ({
          topic,
          questionCount: data.count,
          avgVotes: Math.round(data.totalVotes / data.count),
        }))
        .sort((a, b) => b.avgVotes - a.avgVotes)
        .slice(0, 5);

      logger.info('User stats generated', { userId, questionsCreated, votesGiven });

      return {
        userId,
        questionsCreated,
        totalVotesReceived,
        votesGiven,
        avgVotesPerQuestion: Math.round(avgVotesPerQuestion * 100) / 100,
        mostPopularQuestion,
        topPerformingTopics,
      };
    } catch (error) {
      logger.error('Error generating user stats', { error, userId });
      throw error;
    }
  }

  /**
   * Export question data for CSV/PDF generation
   */
  async exportQuestionData(
    questionId: string,
    requestingUserId: string
  ): Promise<ExportData> {
    try {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          user: {
            select: { id: true },
          },
          options: {
            include: {
              votes: {
                include: {
                  user: {
                    select: {
                      username: true,
                      points: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      // Only question creator can export
      if (question.user.id !== requestingUserId) {
        throw new AuthorizationError('Only question creator can export data');
      }

      const totalVotes = question.options.reduce(
        (sum, option) => sum + option.votes.length,
        0
      );

      const options = question.options.map((option) => ({
        content: option.content,
        voteCount: option.votes.length,
        percentage: totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0,
      }));

      const votes = question.options.flatMap((option) =>
        option.votes.map((vote) => ({
          optionContent: option.content,
          voterUsername: vote.user.username,
          votedAt: vote.createdAt,
          voterPoints: vote.user.points,
        }))
      );

      const winningOption =
        options.length > 0
          ? [...options].sort((a, b) => b.voteCount - a.voteCount)[0].content
          : '';

      const totalViews = totalVotes > 0 ? Math.floor(totalVotes * 3.5) : 0;
      const engagementRate = totalViews > 0 ? (totalVotes / totalViews) * 100 : 0;

      logger.info('Question data exported', { questionId, totalVotes });

      return {
        question: {
          id: question.id,
          title: question.title,
          description: question.description,
          createdAt: question.createdAt,
          expiresAt: question.expiresAt,
          status: question.status,
        },
        options,
        votes,
        summary: {
          totalVotes,
          engagementRate: Math.round(engagementRate * 100) / 100,
          winningOption,
        },
      };
    } catch (error) {
      logger.error('Error exporting question data', { error, questionId });
      throw error;
    }
  }

  /**
   * Get quick stats for a question (lightweight version)
   */
  async getQuestionQuickStats(questionId: string): Promise<{
    totalVotes: number;
    topOption: string;
    topOptionPercentage: number;
  }> {
    try {
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
        },
      });

      if (!question) {
        throw new NotFoundError('Question not found');
      }

      const totalVotes = question.options.reduce(
        (sum, option) => sum + option._count.votes,
        0
      );

      const sortedOptions = [...question.options].sort(
        (a, b) => b._count.votes - a._count.votes
      );

      const topOption = sortedOptions[0]?.content || '';
      const topOptionPercentage =
        totalVotes > 0 ? (sortedOptions[0]?._count.votes / totalVotes) * 100 : 0;

      return {
        totalVotes,
        topOption,
        topOptionPercentage: Math.round(topOptionPercentage * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting quick stats', { error, questionId });
      throw error;
    }
  }
}

export default new AnalyticsService();
