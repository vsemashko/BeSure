import { Request, Response } from 'express';
import questionService from '../../services/question.service';
import notificationService from '../../services/notification.service';
import socialService from '../../services/social.service';
import { sendSuccess } from '../../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../../utils/logger';

class QuestionController {
  /**
   * POST /api/v1/questions
   * Create a new question
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const username = req.user!.username;
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

    // Notify followers about the new question (if not anonymous and public)
    if (!isAnonymous && privacyLevel === 'public') {
      // Get followers and notify them asynchronously (don't block response)
      socialService
        .getFollowers(userId, { limit: 1000, offset: 0 })
        .then(async (result) => {
          const notificationPromises = result.followers.map((follower) =>
            notificationService
              .sendFriendQuestionNotification(
                follower.id,
                userId,
                username,
                question.id,
                title
              )
              .catch((err) =>
                logger.error(
                  `Failed to send friend question notification to ${follower.id}`,
                  err
                )
              )
          );

          await Promise.all(notificationPromises);
          logger.info(
            `Sent friend question notifications to ${result.followers.length} followers`
          );
        })
        .catch((err) =>
          logger.error('Failed to get followers for notification', err)
        );
    }

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
