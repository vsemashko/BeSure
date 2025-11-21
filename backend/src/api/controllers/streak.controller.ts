import { Request, Response, NextFunction } from 'express';
import streakService from '../../services/streak.service';
import logger from '../../utils/logger';

class StreakController {
  /**
   * GET /api/v1/streaks/my
   * Get current user's streak information
   */
  async getMyStreak(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const streakInfo = await streakService.getStreakInfo(userId);

      res.json({
        success: true,
        data: streakInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/streaks/freeze
   * Use streak freeze to save a broken streak
   */
  async useFreeze(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const result = await streakService.useStreakFreeze(userId);

      logger.info(`User ${userId} used streak freeze`);

      res.json({
        success: true,
        data: {
          freezeUsed: result,
          message: 'Streak freeze applied successfully!',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/streaks/badges
   * Get current user's streak badges
   */
  async getMyBadges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const badges = await streakService.getStreakBadges(userId);

      res.json({
        success: true,
        data: {
          badges,
          count: badges.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/streaks/leaderboard
   * Get streak leaderboard
   */
  async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const leaderboard = await streakService.getStreakLeaderboard(limit);

      res.json({
        success: true,
        data: {
          leaderboard,
          total: leaderboard.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StreakController();
