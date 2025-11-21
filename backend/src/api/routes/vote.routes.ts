import { Router } from 'express';
import voteController from '../controllers/vote.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { submitVoteSchema, getUserVotesSchema } from '../schemas/vote.schemas';

const router = Router();

/**
 * POST /api/v1/votes
 * Cast a vote (requires authentication)
 */
router.post('/', authenticate, validate(submitVoteSchema), voteController.castVote);

/**
 * GET /api/v1/votes/my
 * Get current user's voting history (requires authentication)
 */
router.get('/my', authenticate, validate(getUserVotesSchema), voteController.getMyVotes);

/**
 * GET /api/v1/votes/question/:questionId
 * Get votes for a question
 */
router.get('/question/:questionId', voteController.getQuestionVotes);

/**
 * GET /api/v1/votes/question/:questionId/stats
 * Get vote statistics for a question
 */
router.get('/question/:questionId/stats', voteController.getQuestionStats);

export default router;
