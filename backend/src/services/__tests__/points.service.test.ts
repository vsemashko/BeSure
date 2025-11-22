import pointsService, { PointTransactionInput } from '../points.service';
import prisma from '../../config/database';
import { InsufficientPointsError, NotFoundError } from '../../utils/errors';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userPointStats: {
      findUnique: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    pointTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('PointsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default transaction mock
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback(prisma);
    });
  });

  describe('awardPoints', () => {
    it('should successfully award points to user', async () => {
      const input: PointTransactionInput = {
        userId: 'user-123',
        amount: 2,
        type: 'vote',
        referenceId: 'question-123',
      };

      // Mock user update
      (prisma.user.update as jest.Mock).mockResolvedValue({
        points: 12,
      });

      // Mock stats update
      (prisma.userPointStats.update as jest.Mock).mockResolvedValue({});

      // Mock transaction creation
      (prisma.pointTransaction.create as jest.Mock).mockResolvedValue({
        id: 'txn-123',
        ...input,
        createdAt: new Date(),
      });

      // Execute
      const result = await pointsService.awardPoints(input);

      // Assertions
      expect(result).toBe(12);

      // Verify user was updated
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: input.userId },
        data: { points: { increment: input.amount } },
        select: { points: true },
      });

      // Verify stats were updated
      expect(prisma.userPointStats.update).toHaveBeenCalledWith({
        where: { userId: input.userId },
        data: {
          currentBalance: 12,
          lifetimeEarned: { increment: input.amount },
        },
      });

      // Verify transaction was recorded
      expect(prisma.pointTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: input.userId,
          amount: input.amount,
          type: input.type,
          referenceId: input.referenceId,
        }),
      });
    });

    it('should throw error for negative amounts', async () => {
      const input: PointTransactionInput = {
        userId: 'user-123',
        amount: -5,
        type: 'test',
      };

      // Execute & Assert
      await expect(pointsService.awardPoints(input)).rejects.toThrow(
        'Amount must be positive'
      );

      // Verify no database calls were made
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw error for zero amounts', async () => {
      const input: PointTransactionInput = {
        userId: 'user-123',
        amount: 0,
        type: 'test',
      };

      // Execute & Assert
      await expect(pointsService.awardPoints(input)).rejects.toThrow(
        'Amount must be positive'
      );
    });
  });

  describe('deductPoints', () => {
    it('should successfully deduct points from user', async () => {
      const input: PointTransactionInput = {
        userId: 'user-123',
        amount: 10,
        type: 'question_create',
        referenceId: 'question-123',
      };

      // Mock user with sufficient points
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        points: 20,
      });

      // Mock user update
      (prisma.user.update as jest.Mock).mockResolvedValue({
        points: 10,
      });

      // Mock stats update
      (prisma.userPointStats.update as jest.Mock).mockResolvedValue({});

      // Mock transaction creation
      (prisma.pointTransaction.create as jest.Mock).mockResolvedValue({
        id: 'txn-123',
        userId: input.userId,
        amount: -input.amount,
        type: input.type,
        createdAt: new Date(),
      });

      // Execute
      const result = await pointsService.deductPoints(input);

      // Assertions
      expect(result).toBe(10);

      // Verify user balance was checked
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: input.userId },
        select: { points: true },
      });

      // Verify points were deducted
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: input.userId },
        data: { points: { decrement: input.amount } },
        select: { points: true },
      });

      // Verify stats were updated
      expect(prisma.userPointStats.update).toHaveBeenCalledWith({
        where: { userId: input.userId },
        data: {
          currentBalance: 10,
          lifetimeSpent: { increment: input.amount },
        },
      });
    });

    it('should throw error if user has insufficient points', async () => {
      const input: PointTransactionInput = {
        userId: 'user-123',
        amount: 15,
        type: 'question_create',
      };

      // Mock user with insufficient points
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        points: 5,
      });

      // Execute & Assert
      await expect(pointsService.deductPoints(input)).rejects.toThrow(
        InsufficientPointsError
      );

      // Verify update was not called
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const input: PointTransactionInput = {
        userId: 'nonexistent',
        amount: 10,
        type: 'test',
      };

      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(pointsService.deductPoints(input)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw error for negative amounts', async () => {
      const input: PointTransactionInput = {
        userId: 'user-123',
        amount: -10,
        type: 'test',
      };

      // Execute & Assert
      await expect(pointsService.deductPoints(input)).rejects.toThrow(
        'Amount must be positive'
      );
    });
  });

  describe('getBalance', () => {
    it('should return user point balance', async () => {
      const userId = 'user-123';
      const mockBalance = 42;

      // Mock user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        points: mockBalance,
      });

      // Execute
      const balance = await pointsService.getBalance(userId);

      // Assertions
      expect(balance).toBe(mockBalance);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { points: true },
      });
    });

    it('should throw error if user not found', async () => {
      const userId = 'nonexistent';

      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(pointsService.getBalance(userId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history for user', async () => {
      const userId = 'user-123';
      const mockTransactions = [
        {
          id: 'txn-1',
          userId,
          amount: 2,
          type: 'vote',
          createdAt: new Date(),
          referenceId: 'q1',
          metadata: null,
        },
        {
          id: 'txn-2',
          userId,
          amount: -10,
          type: 'question_create',
          createdAt: new Date(),
          referenceId: 'q2',
          metadata: null,
        },
      ];

      // Mock transactions
      (prisma.pointTransaction.findMany as jest.Mock).mockResolvedValue(
        mockTransactions
      );

      // Mock count
      (prisma.pointTransaction.count as jest.Mock) = jest.fn().mockResolvedValue(2);

      // Execute
      const result = await pointsService.getTransactionHistory(userId);

      // Assertions
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0]).toHaveProperty('type', 'vote');
      expect(result.transactions[1]).toHaveProperty('type', 'question_create');
      expect(result.total).toBe(2);

      expect(prisma.pointTransaction.findMany).toHaveBeenCalled();
    });

    it('should support custom limit', async () => {
      const userId = 'user-123';
      const limit = 10;

      (prisma.pointTransaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.pointTransaction.count as jest.Mock) = jest.fn().mockResolvedValue(0);

      // Execute
      await pointsService.getTransactionHistory(userId, { limit });

      // Verify limit was applied
      expect(prisma.pointTransaction.findMany).toHaveBeenCalled();
    });
  });
});
