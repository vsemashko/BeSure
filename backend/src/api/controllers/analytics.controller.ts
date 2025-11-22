import { Request, Response } from 'express';
import analyticsService from '../../services/analytics.service';
import { sendSuccess } from '../../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../../utils/logger';

class AnalyticsController {
  /**
   * GET /api/v1/analytics/question/:id
   * Get comprehensive insights for a question
   */
  getQuestionInsights = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    logger.info('Getting question insights', { questionId: id, userId });

    const insights = await analyticsService.getQuestionInsights(id, userId);

    return sendSuccess(res, insights);
  });

  /**
   * GET /api/v1/analytics/my-stats
   * Get current user's statistics
   */
  getMyStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    logger.info('Getting user stats', { userId });

    const stats = await analyticsService.getUserStats(userId);

    return sendSuccess(res, stats);
  });

  /**
   * GET /api/v1/analytics/export/:questionId
   * Export question data for CSV/PDF
   */
  exportQuestionData = asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;
    const userId = req.user!.id;

    logger.info('Exporting question data', { questionId, userId });

    const exportData = await analyticsService.exportQuestionData(
      questionId,
      userId
    );

    return sendSuccess(res, exportData);
  });

  /**
   * GET /api/v1/analytics/question/:id/quick
   * Get quick stats for a question (lightweight)
   */
  getQuickStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const quickStats = await analyticsService.getQuestionQuickStats(id);

    return sendSuccess(res, quickStats);
  });
}

export default new AnalyticsController();
