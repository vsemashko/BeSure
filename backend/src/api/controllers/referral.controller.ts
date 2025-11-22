import { Request, Response, NextFunction } from 'express';
import referralService from '../../services/referral.service';

class ReferralController {
  /**
   * GET /api/v1/referral/code
   * Get user's referral code
   */
  async getReferralCode(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const referralCode = await referralService.getUserReferralCode(userId);

      res.json({
        success: true,
        data: {
          referralCode,
          shareUrl: `${process.env.APP_URL || 'https://besure.app'}/invite/${referralCode}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/referral/stats
   * Get referral statistics for current user
   */
  async getReferralStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const stats = await referralService.getReferralStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/referral/referred-users
   * Get list of users referred by current user
   */
  async getReferredUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const referredUsers = await referralService.getReferredUsers(userId, limit);

      res.json({
        success: true,
        data: {
          referredUsers,
          total: referredUsers.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/referral/validate
   * Validate a referral code (public endpoint for signup flow)
   */
  async validateReferralCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Referral code is required',
        });
        return;
      }

      // Validate format
      const isValidFormat = referralService.validateReferralCode(code);

      if (!isValidFormat) {
        res.json({
          success: true,
          data: {
            valid: false,
            message: 'Invalid referral code format',
          },
        });
        return;
      }

      // Check if code exists (without revealing user info)
      try {
        await referralService.getUserReferralCode(code);
        res.json({
          success: true,
          data: {
            valid: true,
            message: 'Valid referral code',
          },
        });
      } catch (error) {
        res.json({
          success: true,
          data: {
            valid: false,
            message: 'Referral code not found',
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new ReferralController();
