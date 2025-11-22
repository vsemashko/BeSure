import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config/constants';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';
import logger from '../utils/logger';
import referralService from './referral.service';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  referralCode?: string; // Optional referral code
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

export interface UpdateProfileInput {
  username?: string;
  profileData?: {
    avatarUrl?: string;
    bio?: string;
    displayName?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
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

    // Generate unique referral code
    const referralCodeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let referralCode = '';
    for (let i = 0; i < 8; i++) {
      referralCode += referralCodeChars[Math.floor(Math.random() * referralCodeChars.length)];
    }

    // Create user with point stats and referral code
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        referralCode,
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

    // Apply referral code if provided
    if (input.referralCode) {
      try {
        await referralService.applyReferralCode(user.id, input.referralCode);
        logger.info(`User ${user.username} registered with referral code: ${input.referralCode}`);
      } catch (error) {
        // Log but don't fail registration if referral code is invalid
        logger.warn(
          `Failed to apply referral code ${input.referralCode} for user ${user.username}:`,
          error
        );
      }
    }

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
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
        userId: string;
        email: string;
      };

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true },
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id, user.email);

      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    // Check if username is being updated and if it's already taken
    if (input.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: input.username,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new ConflictError('Username already taken');
      }
    }

    // Get current profile data and preferences
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileData: true, preferences: true },
    });

    // Merge profileData and preferences
    const updatedProfileData = input.profileData
      ? { ...(currentUser?.profileData as object || {}), ...input.profileData }
      : undefined;

    const updatedPreferences = input.preferences
      ? { ...(currentUser?.preferences as object || {}), ...input.preferences }
      : undefined;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: input.username,
        profileData: updatedProfileData as any,
        preferences: updatedPreferences as any,
      },
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        profileData: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Profile updated for user: ${updatedUser.username}`);

    return updatedUser;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, passwordHash: true },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password (same rules as registration)
    if (input.newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (!/\d/.test(input.newPassword)) {
      throw new ValidationError('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(input.newPassword)) {
      throw new ValidationError('Password must contain at least one special character');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    logger.info(`Password changed for user: ${user.username}`);

    return { message: 'Password changed successfully' };
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
