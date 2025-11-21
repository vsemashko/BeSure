import { Router } from 'express';
import challengeController from '../controllers/challenge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All challenge routes require authentication
router.use(authenticate);

// GET /api/v1/challenges/today - Get today's challenges
router.get('/today', challengeController.getTodayChallenges);

// GET /api/v1/challenges/history - Get challenge history
router.get('/history', challengeController.getChallengeHistory);

// GET /api/v1/challenges/stats - Get challenge statistics
router.get('/stats', challengeController.getChallengeStats);

export default router;
