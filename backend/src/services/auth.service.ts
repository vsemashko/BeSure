import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config/constants';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    points: number;
    createdAt: Date;
  };
  token: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate input
    this.validateRegisterInput(input);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: input.email }, { username: input.username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new ConflictError('Email already registered');
      }
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user with point stats
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        points: config.points.startingBalance,
        pointStats: {
          create: {
            currentBalance: config.points.startingBalance,
            lifetimeEarned: config.points.startingBalance,
            lifetimeSpent: 0,
            level: 1,
            streakDays: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        points: true,
        createdAt: true,
      },
    });

    // Log registration
    logger.info(`New user registered: ${user.username} (${user.email})`);

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user.id, user.email);

    return {
      user,
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        points: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const { token, refreshToken } = this.generateTokens(user.id, user.email);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.username} (${user.email})`);

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        profileData: true,
        pointStats: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return user;
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, email: string) {
    const payload = { userId, email };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtRefreshExpiresIn,
    } as SignOptions);

    return { token, refreshToken };
  }

  /**
   * Validate registration input
   */
  private validateRegisterInput(input: RegisterInput): void {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Username validation
    if (input.username.length < 3 || input.username.length > 50) {
      throw new ValidationError('Username must be between 3 and 50 characters');
    }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(input.username)) {
      throw new ValidationError(
        'Username can only contain letters, numbers, and underscores'
      );
    }

    // Password validation
    if (input.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (!/\d/.test(input.password)) {
      throw new ValidationError('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(input.password)) {
      throw new ValidationError('Password must contain at least one special character');
    }
  }
}

export default new AuthService();
