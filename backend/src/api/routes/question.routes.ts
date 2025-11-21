import { Router } from 'express';
import questionController from '../controllers/question.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/questions
 * Create a new question (requires authentication)
 */
router.post('/', authenticate, questionController.create);

/**
 * GET /api/v1/questions
 * Get question feed
 */
router.get('/', questionController.getFeed);

/**
 * GET /api/v1/questions/my
 * Get current user's questions (requires authentication)
 */
router.get('/my', authenticate, questionController.getMyQuestions);

/**
 * GET /api/v1/questions/:id
 * Get a single question
 */
router.get('/:id', questionController.getById);

/**
 * DELETE /api/v1/questions/:id
 * Delete a question (requires authentication)
 */
router.delete('/:id', authenticate, questionController.delete);

export default router;
