import { Request, Response, NextFunction } from 'express';
import topicService from '../../services/topic.service';
import logger from '../../utils/logger';

class TopicController {
  /**
   * GET /api/v1/topics/my-expertise
   * Get current user's topic expertise profile
   */
  async getMyExpertise(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const profile = await topicService.getUserTopicProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/topics
   * Get all topics
   */
  async getAllTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await topicService.getAllTopics({ limit, offset });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/topics/:topicId
   * Get topic by ID with stats
   */
  async getTopicById(req: Request, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;

      const topic = await topicService.getTopicById(topicId);

      res.json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/topics/:topicId/leaderboard
   * Get topic leaderboard (top experts)
   */
  async getTopicLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const leaderboard = await topicService.getTopicLeaderboard(topicId, limit);

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

  /**
   * POST /api/v1/topics
   * Create a new topic (admin only for now)
   */
  async createTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      const topic = await topicService.createTopic({ name, description });

      logger.info(`Topic created: ${topic.name} by user ${req.user!.id}`);

      res.status(201).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TopicController();
