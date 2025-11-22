import { Router } from 'express';
import questionController from '../controllers/question.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { createQuestionSchema, getQuestionByIdSchema } from '../schemas/question.schemas';

const router = Router();

/**
 * POST /api/v1/questions
 * Create a new question (requires authentication)
 */
router.post('/', authenticate, validate(createQuestionSchema), questionController.create);

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
router.get('/:id', validate(getQuestionByIdSchema), questionController.getById);

/**
 * DELETE /api/v1/questions/:id
 * Delete a question (requires authentication)
 */
router.delete('/:id', authenticate, validate(getQuestionByIdSchema), questionController.delete);

export default router;
