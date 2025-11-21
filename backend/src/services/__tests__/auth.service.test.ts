import authService from '../auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, AuthenticationError } from '../../utils/errors';

// Mock dependencies
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterInput = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
    };

    it('should successfully register a new user', async () => {
      // Mock: No existing user
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

      // Mock: User creation
      const mockUser = {
        id: 'user-123',
        email: validRegisterInput.email,
        username: validRegisterInput.username,
        points: 10,
        createdAt: new Date(),
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Mock: JWT token generation
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Execute
      const result = await authService.register(validRegisterInput);

      // Assertions
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(validRegisterInput.email);
      expect(result.user.username).toBe(validRegisterInput.username);

      // Verify bcrypt was called with correct params
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterInput.password, 10);

      // Verify user was created with hashed password
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: validRegisterInput.email,
            username: validRegisterInput.username,
            passwordHash: 'hashedPassword123',
          }),
        })
      );
    });

    it('should throw ConflictError if email already exists', async () => {
      // Mock: Existing user with same email
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: validRegisterInput.email,
      });

      // Execute & Assert
      await expect(authService.register(validRegisterInput)).rejects.toThrow(
        ConflictError
      );
      await expect(authService.register(validRegisterInput)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should throw ConflictError if username already exists', async () => {
      // Mock: Existing user with same username
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        username: validRegisterInput.username,
        email: 'other@example.com',
      });

      // Execute & Assert
      await expect(authService.register(validRegisterInput)).rejects.toThrow(
        ConflictError
      );
      await expect(authService.register(validRegisterInput)).rejects.toThrow(
        'Username already taken'
      );
    });
  });

  describe('login', () => {
    const validLoginInput = {
      email: 'test@example.com',
      password: 'Test123!@#',
    };

    it('should successfully login with valid credentials', async () => {
      // Mock: User found
      const mockUser = {
        id: 'user-123',
        email: validLoginInput.email,
        username: 'testuser',
        passwordHash: 'hashedPassword123',
        points: 10,
        createdAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Mock: Password verification succeeds
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock: JWT token generation
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Execute
      const result = await authService.login(validLoginInput);

      // Assertions
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(validLoginInput.email);
      expect(result.user).not.toHaveProperty('passwordHash'); // Ensure password hash is not returned

      // Verify password comparison
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validLoginInput.password,
        mockUser.passwordHash
      );
    });

    it('should throw AuthenticationError if user not found', async () => {
      // Mock: User not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.login(validLoginInput)).rejects.toThrow(
        AuthenticationError
      );
      await expect(authService.login(validLoginInput)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw AuthenticationError if password is incorrect', async () => {
      // Mock: User found
      const mockUser = {
        id: 'user-123',
        email: validLoginInput.email,
        username: 'testuser',
        passwordHash: 'hashedPassword123',
        points: 10,
        createdAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Mock: Password verification fails
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Execute & Assert
      await expect(authService.login(validLoginInput)).rejects.toThrow(
        AuthenticationError
      );
      await expect(authService.login(validLoginInput)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('getMe', () => {
    it('should return user profile for valid userId', async () => {
      // Mock: User found
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        points: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        profileData: null,
        pointStats: null,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Execute
      const result = await authService.getMe('user-123');

      // Assertions
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object),
      });
    });

    it('should throw AuthenticationError if user not found', async () => {
      // Mock: User not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute & Assert
      await expect(authService.getMe('nonexistent-user')).rejects.toThrow(
        AuthenticationError
      );
      await expect(authService.getMe('nonexistent-user')).rejects.toThrow(
        'User not found'
      );
    });
  });
});
