import { Router } from 'express';
import topicController from '../controllers/topic.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', topicController.getAllTopics);
router.get('/:topicId', topicController.getTopicById);
router.get('/:topicId/leaderboard', topicController.getTopicLeaderboard);

// Authenticated routes
router.get('/my-expertise', authenticate, topicController.getMyExpertise);
router.post('/', authenticate, topicController.createTopic);

export default router;
