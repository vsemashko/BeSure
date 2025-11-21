import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import voteRoutes from './vote.routes';
import streakRoutes from './streak.routes';
import challengeRoutes from './challenge.routes';
import topicRoutes from './topic.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
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

// Future routes:
// router.use('/users', userRoutes);

export default router;
