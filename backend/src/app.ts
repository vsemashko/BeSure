import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/constants';
import routes from './api/routes';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler';
import { apiRateLimiter } from './api/middleware/rateLimiter';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app = express();

  // ============================================
  // SECURITY & MIDDLEWARE
  // ============================================

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP request logger
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Rate limiting (apply to all routes)
  app.use(apiRateLimiter);

  // ============================================
  // ROUTES
  // ============================================

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'BeSure API',
        version: config.apiVersion,
        environment: config.nodeEnv,
        documentation: '/api/v1/health',
      },
    });
  });

  // API routes
  app.use(`/api/${config.apiVersion}`, routes);

  // ============================================
  // ERROR HANDLING
  // ============================================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
