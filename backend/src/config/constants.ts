import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // File Storage (S3/R2)
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || 'besure-images',
    region: process.env.S3_REGION || 'auto',
  },

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:19000'],

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Point System (MVP values from PRD)
  points: {
    startingBalance: 10,
    voteReward: 2,
    questionCost: {
      basic: 10,
      anonymous: 3, // Additional cost
      urgent: 5, // Additional cost
    },
    questionCompletionReward: 5,
    perVoteReward: 0.5,
    minVotesPenalty: 5, // Refund if < 5 votes
  },

  // Question limits
  question: {
    minOptions: 2,
    maxOptions: 6,
    maxTitleLength: 500,
    maxOptionLength: 200,
    minExpirationMinutes: 5,
    maxExpirationDays: 7,
  },
};

// Validation
if (!config.databaseUrl && config.nodeEnv !== 'test') {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!config.jwtSecret || config.jwtSecret === 'development-secret-change-in-production') {
  if (config.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('⚠️  Warning: Using default JWT_SECRET. This is not secure for production!');
}

export default config;
