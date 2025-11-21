import { logger as rnLogger, consoleTransport } from 'react-native-logs';
import * as Sentry from '@sentry/react-native';
import { LOG_LEVELS, LogLevel } from '../constants';

const isDevelopment = __DEV__;

// Configure logger
const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: isDevelopment ? 'debug' : 'info',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'blueBright' as const,
      info: 'greenBright' as const,
      warn: 'yellowBright' as const,
      error: 'redBright' as const,
    },
  },
  async: true,
  dateFormat: 'time' as const,
  printLevel: true,
  printDate: true,
  enabled: true,
};

const log = rnLogger.createLogger(config);

// Custom logger with Sentry integration
class Logger {
  debug(message: string, ...args: any[]) {
    if (isDevelopment) {
      log.debug(message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    log.info(message, ...args);
  }

  warn(message: string, ...args: any[]) {
    log.warn(message, ...args);
    if (!isDevelopment) {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: { args },
      });
    }
  }

  error(message: string, error?: Error | unknown, ...args: any[]) {
    log.error(message, error, ...args);

    if (!isDevelopment) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: { message, args },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: { error, args },
        });
      }
    }
  }

  // Network request logging
  logRequest(method: string, url: string, data?: any) {
    if (isDevelopment) {
      this.debug(`[API Request] ${method} ${url}`, data);
    }
  }

  logResponse(method: string, url: string, status: number, data?: any) {
    if (isDevelopment) {
      this.debug(`[API Response] ${method} ${url} - ${status}`, data);
    }
  }

  logError(method: string, url: string, error: any) {
    this.error(`[API Error] ${method} ${url}`, error);
  }

  // User action logging
  logUserAction(action: string, details?: any) {
    this.info(`[User Action] ${action}`, details);
  }

  // Performance logging
  logPerformance(metric: string, duration: number) {
    if (isDevelopment) {
      this.debug(`[Performance] ${metric}: ${duration}ms`);
    }
  }
}

export const logger = new Logger();
export default logger;
