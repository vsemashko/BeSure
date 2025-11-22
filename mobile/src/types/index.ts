/**
 * TypeScript types for BeSure mobile app
 * Matching backend API responses
 */

export interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  createdAt: string;
  updatedAt?: string;
  profileData?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface QuestionOption {
  id: string;
  content: string;
  imageUrl?: string;
  orderIndex: number;
  voteCount?: number;
  percentage?: number;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  isAnonymous: boolean;
  privacyLevel: string;
  expiresAt: string;
  createdAt: string;
  status: 'active' | 'closed' | 'deleted';
  options: QuestionOption[];
  user?: {
    id: string;
    username: string;
  };
  totalVotes: number;
  hasVoted?: boolean;
  userVote?: string; // optionId
}

export interface Vote {
  id: string;
  questionId: string;
  userId: string;
  optionId: string;
  createdAt: string;
}

export interface VoteResult {
  vote: Vote;
  pointsEarned: number;
  newBalance: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  referenceId?: string;
  metadata?: any;
  createdAt: string;
}

export interface UserPointStats {
  userId: string;
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  level: number;
  streakDays: number;
  streakLastDate?: string;
  lastVoteDate?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// Feed modes
export type FeedMode = 'urgent' | 'popular' | 'foryou';

// Create question input
export interface CreateQuestionInput {
  title: string;
  description?: string;
  imageUrl?: string;
  options: Array<{
    content: string;
    imageUrl?: string;
  }>;
  expiresInMinutes: number;
  isAnonymous: boolean;
  privacyLevel: 'public' | 'friends';
}
