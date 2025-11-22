import questionService, { CreateQuestionInput } from '../question.service';
import prisma from '../../config/database';
import pointsService from '../points.service';
import { ValidationError, NotFoundError } from '../../utils/errors';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    question: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    questionOption: {
      createMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    vote: {
      groupBy: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../points.service');

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('QuestionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default transaction mock
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback(prisma);
    });
  });

  describe('createQuestion', () => {
    it('should successfully create a question', async () => {
      const questionData: CreateQuestionInput = {
        userId: 'user-123',
        title: 'What should I have for lunch?',
        description: 'I cannot decide between these options',
        options: [
          { content: 'Pizza' },
          { content: 'Burger' },
        ],
        expiresInMinutes: 60,
        isAnonymous: false,
        privacyLevel: 'public',
      };

      // Mock user exists with sufficient points
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: questionData.userId,
        points: 20,
      });

      // Mock points check
      (pointsService.canAffordQuestion as jest.Mock).mockResolvedValue({
        canAfford: true,
        current: 20,
        required: 10,
      });

      // Mock question creation
      const mockQuestion = {
        id: 'question-123',
        userId: questionData.userId,
        title: questionData.title,
        description: questionData.description,
        isAnonymous: questionData.isAnonymous,
        privacyLevel: questionData.privacyLevel,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        status: 'active',
        metadata: { cost: 10 },
        options: [
          { id: 'opt-1', content: 'Pizza', orderIndex: 0 },
          { id: 'opt-2', content: 'Burger', orderIndex: 1 },
        ],
      };
      (prisma.question.create as jest.Mock).mockResolvedValue(mockQuestion);

      // Mock points deduction
      (pointsService.deductQuestionPoints as jest.Mock).mockResolvedValue(10);

      // Execute
      const result = await questionService.createQuestion(questionData);

      // Assertions
      expect(result).toHaveProperty('id');
      expect(result.title).toBe(questionData.title);
      expect(result.status).toBe('active');

      // Verify question was created
      expect(prisma.question.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: questionData.userId,
          title: questionData.title,
          description: questionData.description,
          isAnonymous: questionData.isAnonymous,
          privacyLevel: questionData.privacyLevel,
        }),
        include: expect.any(Object),
      });

      // Verify points were deducted
      expect(pointsService.deductQuestionPoints).toHaveBeenCalled();
    });

    it('should validate minimum number of options', async () => {
      const questionData: CreateQuestionInput = {
        userId: 'user-123',
        title: 'Test question',
        options: [{ content: 'Only one option' }],
        expiresInMinutes: 60,
        isAnonymous: false,
        privacyLevel: 'public',
      };

      // Execute & Assert
      await expect(
        questionService.createQuestion(questionData)
      ).rejects.toThrow(ValidationError);
    });

    it('should validate maximum number of options', async () => {
      const questionData: CreateQuestionInput = {
        userId: 'user-123',
        title: 'Test question',
        options: Array.from({ length: 7 }, (_, i) => ({
          content: `Option ${i + 1}`,
        })),
        expiresInMinutes: 60,
        isAnonymous: false,
        privacyLevel: 'public',
      };

      // Execute & Assert
      await expect(
        questionService.createQuestion(questionData)
      ).rejects.toThrow(ValidationError);
    });

    it('should handle anonymous questions with higher cost', async () => {
      const questionData: CreateQuestionInput = {
        userId: 'user-123',
        title: 'Anonymous question',
        options: [
          { content: 'Option 1' },
          { content: 'Option 2' },
        ],
        expiresInMinutes: 60,
        isAnonymous: true, // Anonymous costs more
        privacyLevel: 'public',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: questionData.userId,
        points: 20,
      });

      (pointsService.canAffordQuestion as jest.Mock).mockResolvedValue({
        canAfford: true,
        current: 20,
        required: 13,
      });

      const mockQuestion = {
        id: 'question-123',
        ...questionData,
        expiresAt: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        status: 'active',
        metadata: { cost: 13 }, // Base 10 + anonymous 3
        options: [
          { id: 'opt-1', content: 'Option 1', orderIndex: 0 },
          { id: 'opt-2', content: 'Option 2', orderIndex: 1 },
        ],
      };
      (prisma.question.create as jest.Mock).mockResolvedValue(mockQuestion);

      (pointsService.deductQuestionPoints as jest.Mock).mockResolvedValue(13);

      // Execute
      await questionService.createQuestion(questionData);

      // Verify higher cost for anonymous question
      expect(pointsService.deductQuestionPoints).toHaveBeenCalled();
    });

    it('should validate question title length', async () => {
      const questionData: CreateQuestionInput = {
        userId: 'user-123',
        title: '', // Empty title
        options: [
          { content: 'Option 1' },
          { content: 'Option 2' },
        ],
        expiresInMinutes: 60,
        isAnonymous: false,
        privacyLevel: 'public',
      };

      // Execute & Assert
      await expect(
        questionService.createQuestion(questionData)
      ).rejects.toThrow(ValidationError);
    });

    it('should validate expiration time', async () => {
      const questionData: CreateQuestionInput = {
        userId: 'user-123',
        title: 'Test question',
        options: [
          { content: 'Option 1' },
          { content: 'Option 2' },
        ],
        expiresInMinutes: 0, // Invalid expiration
        isAnonymous: false,
        privacyLevel: 'public',
      };

      // Execute & Assert
      await expect(
        questionService.createQuestion(questionData)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getQuestion', () => {
    it('should return question by ID with vote counts', async () => {
      const questionId = 'question-123';
      const userId = 'user-123';

      const mockQuestion = {
        id: questionId,
        title: 'Test question',
        description: 'Test description',
        status: 'active',
        userId: 'creator-123',
        isAnonymous: false,
        privacyLevel: 'public',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        options: [
          { id: 'opt1', content: 'Option 1', orderIndex: 0, imageUrl: null, _count: { votes: 5 } },
          { id: 'opt2', content: 'Option 2', orderIndex: 1, imageUrl: null, _count: { votes: 3 } },
        ],
        user: {
          id: 'creator-123',
          username: 'creator',
        },
        _count: {
          votes: 8,
        },
        votes: [],
      };

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(mockQuestion);

      // Mock vote counts
      (prisma.vote.groupBy as jest.Mock).mockResolvedValue([
        { optionId: 'opt1', _count: { id: 5 } },
        { optionId: 'opt2', _count: { id: 3 } },
      ]);

      // Execute
      const result = await questionService.getQuestion(questionId, userId);

      // Assertions
      expect(result.id).toBe(questionId);
      expect(result.title).toBe(mockQuestion.title);
      expect(result.options).toHaveLength(2);

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { id: questionId },
        include: expect.any(Object),
      });
    });

    it('should throw error if question not found', async () => {
      const questionId = 'nonexistent';

      (prisma.question.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(
        questionService.getQuestion(questionId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getFeed', () => {
    it('should return paginated questions for feed', async () => {
      const options = {
        userId: 'user-123',
        mode: 'foryou' as const,
        limit: 20,
        offset: 0,
      };

      const mockQuestions = [
        {
          id: 'q1',
          title: 'Question 1',
          status: 'active',
          expiresAt: new Date(Date.now() + 3600000),
          options: [],
          user: { username: 'user1' },
        },
        {
          id: 'q2',
          title: 'Question 2',
          status: 'active',
          expiresAt: new Date(Date.now() + 7200000),
          options: [],
          user: { username: 'user2' },
        },
      ];

      (prisma.question.findMany as jest.Mock).mockResolvedValue(mockQuestions);
      (prisma.question.count as jest.Mock).mockResolvedValue(2);

      // Execute
      const result = await questionService.getFeed(options);

      // Assertions
      expect(result.questions).toHaveLength(2);
      expect(result.total).toBe(2);

      expect(prisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: options.limit,
          skip: options.offset,
        })
      );
    });
  });
});
