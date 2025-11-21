import { Request, Response, NextFunction } from 'express';
import notificationService from '../../services/notification.service';
import logger from '../../utils/logger';

class NotificationController {
  /**
   * POST /api/v1/notifications/token
   * Save user's push notification token
   */
  async savePushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { token, platform } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token is required',
        });
      }

      await notificationService.savePushToken(userId, token, platform || 'unknown');

      logger.info(`Push token saved for user ${userId}`);

      res.json({
        success: true,
        message: 'Push token saved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/token
   * Remove user's push notification token
   */
  async removePushToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { token } = req.body;

      await notificationService.removePushToken(userId, token);

      logger.info(`Push token removed for user ${userId}`);

      res.json({
        success: true,
        message: 'Push token removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/preferences
   * Get user's notification preferences
   */
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const preferences = await notificationService.getPreferences(userId);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/preferences
   * Update user's notification preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const preferences = req.body;

      await notificationService.updatePreferences(userId, preferences);

      logger.info(`Notification preferences updated for user ${userId}`);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
