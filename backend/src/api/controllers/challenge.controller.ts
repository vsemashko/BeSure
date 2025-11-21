import { Request, Response, NextFunction } from 'express';
import challengeService from '../../services/challenge.service';

class ChallengeController {
  /**
   * GET /api/v1/challenges/today
   * Get today's challenges for current user
   */
  async getTodayChallenges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const challenges = await challengeService.getDailyChallenges(userId);

      res.json({
        success: true,
        data: challenges,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/challenges/history
   * Get challenge history for current user
   */
  async getChallengeHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 30;
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await challengeService.getChallengeHistory(userId, {
        limit,
        offset,
      });

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/challenges/stats
   * Get challenge statistics for current user
   */
  async getChallengeStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const stats = await challengeService.getChallengeStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ChallengeController();
