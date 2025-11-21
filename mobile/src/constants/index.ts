// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds
export const API_RETRY_ATTEMPTS = 3;
export const API_RETRY_DELAY = 1000; // 1 second

// Question Costs
export const BASE_QUESTION_COST = 10;
export const ANONYMOUS_COST = 3;
export const URGENT_COST = 5;

// Time Thresholds
export const URGENT_THRESHOLD_MINUTES = 360; // 6 hours
export const EXPIRING_SOON_MS = 3600000; // 1 hour in milliseconds

// Pagination
export const DEFAULT_PAGE_LIMIT = 20;
export const DEFAULT_LEADERBOARD_LIMIT = 50;
export const DEFAULT_CHALLENGE_HISTORY_LIMIT = 30;

// Input Limits
export const MAX_QUESTION_TITLE_LENGTH = 500;
export const MAX_OPTION_LENGTH = 200;
export const MAX_USERNAME_LENGTH = 50;
export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

// Password Requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '@$!%*?&',
};

// Token Configuration
export const TOKEN_REFRESH_THRESHOLD = 300000; // Refresh if expiring in 5 minutes
export const TOKEN_STORAGE_KEY = 'auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

// Notification Configuration
export const NOTIFICATION_CHANNEL_ID = 'default';
export const NOTIFICATION_VIBRATION_PATTERN = [0, 250, 250, 250];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
  RATE_LIMIT_ERROR: 'Too many requests. Please try again later.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  QUESTION_CREATED: 'Question created successfully!',
  VOTE_SUBMITTED: 'Vote submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  URL: /^https?:\/\/.+/,
};

// Deep Linking
export const DEEP_LINK_SCHEME = 'besure';
export const DEEP_LINK_PREFIXES = [
  'https://besure.app',
  'https://www.besure.app',
  'besure://',
];

// Cache Configuration
export const CACHE_EXPIRY_MS = 300000; // 5 minutes
export const MAX_CACHE_SIZE = 50; // Maximum number of cached items

// Logging
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];
