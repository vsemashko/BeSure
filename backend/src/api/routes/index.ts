import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import voteRoutes from './vote.routes';

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

// Future routes:
// router.use('/users', userRoutes);
// router.use('/topics', topicRoutes);

export default router;
