import voteService, { CastVoteInput } from '../vote.service';
import prisma from '../../config/database';
import pointsService from '../points.service';
import streakService from '../streak.service';
import challengeService from '../challenge.service';
import topicService from '../topic.service';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    vote: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    question: {
      findUnique: jest.fn(),
    },
    questionOption: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../points.service');
jest.mock('../streak.service');
jest.mock('../challenge.service');
jest.mock('../topic.service');

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('VoteService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default transaction mock
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback(prisma);
    });
  });

  describe('castVote', () => {
    it('should successfully cast a vote and award points', async () => {
      const input: CastVoteInput = {
        userId: 'user-123',
        questionId: 'question-123',
        optionId: 'option-123',
      };

      // Mock question exists and is valid
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({
        id: input.questionId,
        userId: 'other-user',
        status: 'active',
        expiresAt: new Date(Date.now() + 3600000),
        options: [
          { id: 'option-123', content: 'Option 1' },
          { id: 'option-456', content: 'Option 2' },
        ],
      });

      // Mock option exists
      (prisma.questionOption.findUnique as jest.Mock).mockResolvedValue({
        id: input.optionId,
        questionId: input.questionId,
      });

      // Mock no existing vote
      (prisma.vote.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock vote creation
      const mockVote = {
        id: 'vote-123',
        ...input,
        createdAt: new Date(),
      };
      (prisma.vote.create as jest.Mock).mockResolvedValue(mockVote);

      // Mock streak service
      (streakService.updateStreakOnVote as jest.Mock).mockResolvedValue({
        streakDays: 1,
        multiplier: 1.0,
        streakContinued: true,
        newMilestone: false,
      });

      // Mock points service
      (pointsService.awardVotePointsWithMultiplier as jest.Mock).mockResolvedValue({
        totalPoints: 2,
        basePoints: 2,
        bonusPoints: 0,
        newBalance: 12,
      });

      // Mock challenge service
      (challengeService.updateChallengeProgress as jest.Mock).mockResolvedValue({
        challengesCompleted: [],
        totalReward: 0,
      });

      // Mock topic service
      (topicService.updateTopicExpertiseOnVote as jest.Mock).mockResolvedValue([]);

      // Execute
      const result = await voteService.castVote(input);

      // Assertions
      expect(result).toHaveProperty('vote');
      expect(result.vote.id).toBe(mockVote.id);
      expect(result.pointsEarned).toBe(2);
      expect(result.basePoints).toBe(2);
      expect(result.streak.currentStreak).toBe(1);
      expect(result.streak.multiplier).toBe(1.0);

      // Verify vote was created
      expect(prisma.vote.create).toHaveBeenCalledWith({
        data: {
          userId: input.userId,
          questionId: input.questionId,
          optionId: input.optionId,
        },
      });

      // Verify streak was updated
      expect(streakService.updateStreakOnVote).toHaveBeenCalledWith(input.userId);

      // Verify points were awarded with multiplier
      expect(pointsService.awardVotePointsWithMultiplier).toHaveBeenCalledWith(
        input.userId,
        input.questionId,
        1.0
      );

      // Verify challenges were updated
      expect(challengeService.updateChallengeProgress).toHaveBeenCalledWith(input.userId);

      // Verify topic expertise was updated
      expect(topicService.updateTopicExpertiseOnVote).toHaveBeenCalledWith(
        input.userId,
        input.questionId
      );
    });

    it('should handle vote with active streak and bonus points', async () => {
      const input: CastVoteInput = {
        userId: 'user-123',
        questionId: 'question-123',
        optionId: 'option-123',
      };

      // Mock validation
      (prisma.question.findUnique as jest.Mock).mockResolvedValue({
        id: input.questionId,
        userId: 'other-user',
        status: 'active',
        expiresAt: new Date(Date.now() + 3600000),
        options: [
          { id: 'option-123', content: 'Option 1' },
          { id: 'option-456', content: 'Option 2' },
        ],
      });
      (prisma.questionOption.findUnique as jest.Mock).mockResolvedValue({
        id: input.optionId,
        questionId: input.questionId,
      });
      (prisma.vote.findFirst as jest.Mock).mockResolvedValue(null);

      (prisma.vote.create as jest.Mock).mockResolvedValue({
        id: 'vote-123',
        ...input,
        createdAt: new Date(),
      });

      // Mock 7-day streak with 1.5x multiplier
      (streakService.updateStreakOnVote as jest.Mock).mockResolvedValue({
        streakDays: 7,
        multiplier: 1.5,
        streakContinued: true,
        newMilestone: true,
        milestoneDay: 7,
      });

      // Mock points with streak bonus
      (pointsService.awardVotePointsWithMultiplier as jest.Mock).mockResolvedValue({
        totalPoints: 3,
        basePoints: 2,
        bonusPoints: 1,
        newBalance: 15,
      });

      // Mock completed challenges
      (challengeService.updateChallengeProgress as jest.Mock).mockResolvedValue({
        challengesCompleted: [{ id: 'ch1', name: 'Vote 10 times', reward: 5 }],
        totalReward: 5,
      });

      (topicService.updateTopicExpertiseOnVote as jest.Mock).mockResolvedValue([
        { topicName: 'Technology', level: 'knowledgeable' },
      ]);

      // Execute
      const result = await voteService.castVote(input);

      // Assertions
      expect(result.streak.currentStreak).toBe(7);
      expect(result.streak.multiplier).toBe(1.5);
      expect(result.streak.newMilestone).toBe(true);
      expect(result.pointsEarned).toBe(3);
      expect(result.bonusPoints).toBe(1);
      expect(result.challenges.completed).toHaveLength(1);
      expect(result.challenges.bonusPoints).toBe(5);
      expect(result.topicExpertise).toHaveLength(1);
    });
  });

  describe('getQuestionVotes', () => {
    it('should return votes for a question', async () => {
      const questionId = 'question-123';
      const mockVotes = [
        {
          id: 'vote-1',
          userId: 'user-1',
          questionId,
          optionId: 'opt-1',
          createdAt: new Date(),
          option: { id: 'opt-1', content: 'Option 1' },
          user: { id: 'user-1', username: 'user1' },
        },
        {
          id: 'vote-2',
          userId: 'user-2',
          questionId,
          optionId: 'opt-2',
          createdAt: new Date(),
          option: { id: 'opt-2', content: 'Option 2' },
          user: { id: 'user-2', username: 'user2' },
        },
      ];

      (prisma.vote.findMany as jest.Mock).mockResolvedValue(mockVotes);

      // Execute
      const result = await voteService.getQuestionVotes(questionId);

      // Assertions
      expect(result).toHaveLength(2);
      expect(result[0].optionId).toBe('opt-1');
      expect(result[1].optionId).toBe('opt-2');

      expect(prisma.vote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { questionId },
        })
      );
    });
  });

  describe('hasUserVoted', () => {
    it('should return true if user has voted on question', async () => {
      const userId = 'user-123';
      const questionId = 'question-123';

      (prisma.vote.findUnique as jest.Mock).mockResolvedValue({
        id: 'vote-123',
        userId,
        questionId,
      });

      // Execute
      const result = await voteService.hasUserVoted(userId, questionId);

      // Assertions
      expect(result).toBe(true);
      expect(prisma.vote.findUnique).toHaveBeenCalled();
    });

    it('should return false if user has not voted on question', async () => {
      const userId = 'user-123';
      const questionId = 'question-123';

      (prisma.vote.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute
      const result = await voteService.hasUserVoted(userId, questionId);

      // Assertions
      expect(result).toBe(false);
    });
  });
});
