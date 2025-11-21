import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import voteRoutes from './vote.routes';
import streakRoutes from './streak.routes';
import challengeRoutes from './challenge.routes';
import topicRoutes from './topic.routes';
import notificationRoutes from './notification.routes';
import socialRoutes from './social.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/votes', voteRoutes);
router.use('/streaks', streakRoutes);
router.use('/challenges', challengeRoutes);
router.use('/topics', topicRoutes);
router.use('/notifications', notificationRoutes);
router.use('/social', socialRoutes);
router.use('/leaderboard', leaderboardRoutes);

// Future routes:
// router.use('/users', userRoutes);

export default router;
