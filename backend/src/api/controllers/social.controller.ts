import { Request, Response, NextFunction } from 'express';
import socialService from '../../services/social.service';
import logger from '../../utils/logger';

class SocialController {
  /**
   * POST /api/v1/social/follow/:userId
   * Follow a user
   */
  async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const followerId = req.user!.id;
      const { userId } = req.params;

      const result = await socialService.followUser(followerId, userId);

      logger.info(`User ${followerId} followed user ${userId}`);

      res.json({
        success: true,
        data: result,
        message: 'Successfully followed user',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/social/follow/:userId
   * Unfollow a user
   */
  async unfollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const followerId = req.user!.id;
      const { userId } = req.params;

      await socialService.unfollowUser(followerId, userId);

      logger.info(`User ${followerId} unfollowed user ${userId}`);

      res.json({
        success: true,
        message: 'Successfully unfollowed user',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/social/followers/:userId
   * Get user's followers
   */
  async getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await socialService.getFollowers(userId, { limit, offset });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/social/following/:userId
   * Get users that a user is following
   */
  async getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await socialService.getFollowing(userId, { limit, offset });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/social/feed/friends
   * Get friend feed (questions from followed users)
   */
  async getFriendFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await socialService.getFriendFeed(userId, { limit, offset });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/social/profile/:userId
   * Get user profile with stats
   */
  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const viewerId = req.user?.id;

      const profile = await socialService.getUserProfile(userId, viewerId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/social/search
   * Search users by username
   */
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const viewerId = req.user?.id;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 2 characters',
        });
      }

      const result = await socialService.searchUsers(query, {
        limit,
        offset,
        viewerId,
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
   * GET /api/v1/social/suggestions
   * Get suggested users to follow
   */
  async getSuggestedUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await socialService.getSuggestedUsers(userId, { limit });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/social/popular
   * Get popular users
   */
  async getPopularUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await socialService.getPopularUsers({ limit, offset });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SocialController();
