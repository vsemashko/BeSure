import { Router } from 'express';
import referralController from '../controllers/referral.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get user's referral code (authenticated)
router.get('/code', authenticate, referralController.getReferralCode);

// Get referral statistics (authenticated)
router.get('/stats', authenticate, referralController.getReferralStats);

// Get referred users list (authenticated)
router.get('/referred-users', authenticate, referralController.getReferredUsers);

// Validate referral code (public - used during signup)
router.post('/validate', referralController.validateReferralCode);

export default router;
