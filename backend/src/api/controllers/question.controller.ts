import { Request, Response } from 'express';
import questionService from '../../services/question.service';
import { sendSuccess } from '../../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

class QuestionController {
  /**
   * POST /api/v1/questions
   * Create a new question
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      title,
      description,
      options,
      expiresInMinutes,
      isAnonymous,
      privacyLevel,
    } = req.body;

    const question = await questionService.createQuestion({
      userId,
      title,
      description,
      options,
      expiresInMinutes: parseInt(expiresInMinutes, 10),
      isAnonymous: isAnonymous || false,
      privacyLevel: privacyLevel || 'public',
    });

    return sendSuccess(res, question, 201);
  });

  /**
   * GET /api/v1/questions/:id
   * Get a single question
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const question = await questionService.getQuestion(id, userId);

    return sendSuccess(res, question);
  });

  /**
   * GET /api/v1/questions
   * Get question feed
   */
  getFeed = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { mode, limit, offset } = req.query;

    const result = await questionService.getFeed({
      userId,
      mode: mode as any,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    return sendSuccess(res, result);
  });

  /**
   * DELETE /api/v1/questions/:id
   * Delete a question
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await questionService.deleteQuestion(id, userId);

    return sendSuccess(res, { message: 'Question deleted successfully' });
  });

  /**
   * GET /api/v1/questions/my
   * Get current user's questions
   */
  getMyQuestions = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { limit, offset } = req.query;

    const result = await questionService.getUserQuestions(userId, {
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    return sendSuccess(res, result);
  });
}

export default new QuestionController();
