import { Router } from 'express';
import streakController from '../controllers/streak.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All streak routes require authentication
router.use(authenticate);

// GET /api/v1/streaks/my - Get current user's streak info
router.get('/my', streakController.getMyStreak);

// POST /api/v1/streaks/freeze - Use streak freeze
router.post('/freeze', streakController.useFreeze);

// GET /api/v1/streaks/badges - Get current user's streak badges
router.get('/badges', streakController.getMyBadges);

// GET /api/v1/streaks/leaderboard - Get streak leaderboard
router.get('/leaderboard', streakController.getLeaderboard);

export default router;
