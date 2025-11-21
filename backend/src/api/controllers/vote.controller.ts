import { Request, Response } from 'express';
import voteService from '../../services/vote.service';
import { sendSuccess } from '../../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

class VoteController {
  /**
   * POST /api/v1/votes
   * Cast a vote
   */
  castVote = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { questionId, optionId } = req.body;

    const result = await voteService.castVote({
      userId,
      questionId,
      optionId,
    });

    return sendSuccess(res, result, 201);
  });

  /**
   * GET /api/v1/votes/question/:questionId
   * Get votes for a question
   */
  getQuestionVotes = asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;

    const votes = await voteService.getQuestionVotes(questionId);

    return sendSuccess(res, votes);
  });

  /**
   * GET /api/v1/votes/question/:questionId/stats
   * Get vote statistics for a question
   */
  getQuestionStats = asyncHandler(async (req: Request, res: Response) => {
    const { questionId } = req.params;

    const stats = await voteService.getQuestionStats(questionId);

    return sendSuccess(res, stats);
  });

  /**
   * GET /api/v1/votes/my
   * Get current user's voting history
   */
  getMyVotes = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { limit, offset } = req.query;

    const result = await voteService.getUserVotes(userId, {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    return sendSuccess(res, result);
  });
}

export default new VoteController();
