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

  // User action logging with breadcrumbs
  logUserAction(action: string, details?: any) {
    this.info(`[User Action] ${action}`, details);

    // Add Sentry breadcrumb for user actions
    Sentry.addBreadcrumb({
      category: 'user.action',
      message: action,
      level: 'info',
      data: details,
    });
  }

  // Navigation logging with breadcrumbs
  logNavigation(from: string, to: string, params?: any) {
    this.info(`[Navigation] ${from} -> ${to}`, params);

    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `${from} -> ${to}`,
      level: 'info',
      data: params,
    });
  }

  // UI event logging with breadcrumbs
  logUIEvent(event: string, component: string, data?: any) {
    this.debug(`[UI Event] ${component}.${event}`, data);

    Sentry.addBreadcrumb({
      category: 'ui.event',
      message: `${component}.${event}`,
      level: 'debug',
      data,
    });
  }

  // API call logging with breadcrumbs
  logAPICall(method: string, endpoint: string, status?: number) {
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${endpoint}`,
      level: status && status >= 400 ? 'warning' : 'info',
      data: {
        method,
        url: endpoint,
        status_code: status,
      },
    });
  }

  // Performance logging
  logPerformance(metric: string, duration: number) {
    if (isDevelopment) {
      this.debug(`[Performance] ${metric}: ${duration}ms`);
    }

    // Add breadcrumb for slow operations (> 1 second)
    if (duration > 1000) {
      Sentry.addBreadcrumb({
        category: 'performance',
        message: `Slow operation: ${metric}`,
        level: 'warning',
        data: {
          metric,
          duration_ms: duration,
        },
      });
    }
  }

  // State change logging with breadcrumbs
  logStateChange(stateName: string, oldValue: any, newValue: any) {
    this.debug(`[State Change] ${stateName}`, { from: oldValue, to: newValue });

    Sentry.addBreadcrumb({
      category: 'state',
      message: `${stateName} changed`,
      level: 'debug',
      data: {
        from: oldValue,
        to: newValue,
      },
    });
  }
}

export const logger = new Logger();
export default logger;
