import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import config from './constants';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Only initializes if SENTRY_DSN is configured
 */
export function initSentry(): void {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('ℹ️  Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: config.nodeEnv,

    // Performance Monitoring
    tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Profiling (optional integration)
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Release tracking
    release: process.env.npm_package_version || '1.0.0',

    // Filter out sensitive data
    beforeSend(event, _hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive data from context
      if (event.contexts?.runtime) {
        delete event.contexts.runtime.env;
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Network errors that are expected
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      // JWT errors (handled by auth middleware)
      'TokenExpiredError',
      'JsonWebTokenError',
      // Client errors (4xx) - these are user errors, not system errors
      'ValidationError',
      'AuthenticationError',
      'NotFoundError',
    ],
  });

  console.log(`✓ Sentry initialized for ${config.nodeEnv} environment`);
}

/**
 * Capture an exception with Sentry
 * @param error - The error to capture
 * @param context - Additional context
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a message with Sentry
 * @param message - The message to capture
 * @param level - Severity level
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 * @param user - User information
 */
export function setUser(user: { id: string; email?: string; username?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param category - Category
 * @param level - Severity level
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
  });
}

export { Sentry };
