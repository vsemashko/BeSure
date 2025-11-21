import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../../utils/errors';

// Simple in-memory rate limiter (replace with Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || 'unknown';
    const now = Date.now();

    // Clean up old entries
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (const [key, value] of requestCounts.entries()) {
        if (now > value.resetTime) {
          requestCounts.delete(key);
        }
      }
    }

    // Get or create request count
    let record = requestCounts.get(identifier);

    if (!record || now > record.resetTime) {
      // Create new record or reset
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      requestCounts.set(identifier, record);
      next();
      return;
    }

    // Increment count
    record.count++;

    if (record.count > options.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      next(new RateLimitError(`Too many requests. Try again in ${retryAfter} seconds`));
      return;
    }

    next();
  };
};

/**
 * Stricter rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
});

/**
 * Standard rate limiter for API endpoints
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});
