import { Router } from 'express';
import leaderboardController from '../controllers/leaderboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Global leaderboards (public, but show user rank if authenticated)
router.get('/points', leaderboardController.getPointsLeaderboard);
router.get('/streak', leaderboardController.getStreakLeaderboard);
router.get('/questions', leaderboardController.getQuestionCreatorsLeaderboard);
router.get('/votes', leaderboardController.getVotersLeaderboard);

// Friend leaderboards require authentication
router.get('/friends/:type', authenticate, leaderboardController.getFriendLeaderboard);

export default router;
