import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../../utils/errors';
import { sendError } from '../../utils/helpers';
import logger from '../../utils/logger';
import config from '../../config/constants';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Log error (but don't log validation errors at error level)
  if (err instanceof ValidationError) {
    logger.warn('Validation error:', {
      error: err.message,
      details: err.validationErrors,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  }

  // Handle validation errors with detailed messages
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.validationErrors,
      },
    });
  }

  // Handle known application errors
  if (err instanceof AppError) {
    return sendError(res, err.code || 'APP_ERROR', err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      return sendError(res, 'DUPLICATE_ENTRY', 'This resource already exists', 409);
    }
    if (prismaError.code === 'P2025') {
      // Record not found
      return sendError(res, 'NOT_FOUND', 'Resource not found', 404);
    }
  }

  // Handle JWT errors (fallback)
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'INVALID_TOKEN', 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'TOKEN_EXPIRED', 'Authentication token expired', 401);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, 'VALIDATION_ERROR', err.message, 400);
  }

  // Default to 500 server error
  const message =
    config.nodeEnv === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error';

  return sendError(res, 'INTERNAL_ERROR', message, 500, {
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(
    res,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.path}`,
    404
  );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
