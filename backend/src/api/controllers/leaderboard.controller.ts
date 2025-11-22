import { Request, Response, NextFunction } from 'express';
import leaderboardService from '../../services/leaderboard.service';

class LeaderboardController {
  /**
   * GET /api/v1/leaderboard/points
   * Get global points leaderboard
   */
  async getPointsLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.id;

      const result = await leaderboardService.getPointsLeaderboard({
        limit,
        offset,
        userId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/leaderboard/streak
   * Get global streak leaderboard
   */
  async getStreakLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.id;

      const result = await leaderboardService.getStreakLeaderboard({
        limit,
        offset,
        userId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/leaderboard/questions
   * Get question creators leaderboard
   */
  async getQuestionCreatorsLeaderboard(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.id;

      const result = await leaderboardService.getQuestionCreatorsLeaderboard({
        limit,
        offset,
        userId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/leaderboard/votes
   * Get voters leaderboard
   */
  async getVotersLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.id;

      const result = await leaderboardService.getVotersLeaderboard({
        limit,
        offset,
        userId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/leaderboard/friends/:type
   * Get friend leaderboard filtered by type
   */
  async getFriendLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { type } = req.params as { type: 'points' | 'streak' | 'questions' | 'votes' };
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await leaderboardService.getFriendLeaderboard(userId, type, {
        limit,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LeaderboardController();
