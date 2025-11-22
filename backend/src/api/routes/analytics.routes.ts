import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/analytics/my-stats
 * Get current user's statistics (requires authentication)
 */
router.get('/my-stats', authenticate, analyticsController.getMyStats);

/**
 * GET /api/v1/analytics/question/:id
 * Get comprehensive insights for a question (requires authentication - creator only)
 */
router.get(
  '/question/:id',
  authenticate,
  analyticsController.getQuestionInsights
);

/**
 * GET /api/v1/analytics/question/:id/quick
 * Get quick stats for a question (public)
 */
router.get('/question/:id/quick', analyticsController.getQuickStats);

/**
 * GET /api/v1/analytics/export/:questionId
 * Export question data for CSV/PDF (requires authentication - creator only)
 */
router.get(
  '/export/:questionId',
  authenticate,
  analyticsController.exportQuestionData
);

export default router;
