import { Request, Response } from 'express';
import uploadService from '../../services/upload.service';
import { sendSuccess } from '../../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../../utils/errors';

class UploadController {
  /**
   * POST /api/v1/upload/profile
   * Upload profile picture
   */
  uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const result = await uploadService.uploadImage(req.file, 'profiles');
    return sendSuccess(res, result, 201);
  });

  /**
   * POST /api/v1/upload/question
   * Upload question image
   */
  uploadQuestionImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const result = await uploadService.uploadImage(req.file, 'questions');
    return sendSuccess(res, result, 201);
  });

  /**
   * POST /api/v1/upload/option
   * Upload option image
   */
  uploadOptionImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const result = await uploadService.uploadImage(req.file, 'options');
    return sendSuccess(res, result, 201);
  });

  /**
   * DELETE /api/v1/upload/:key
   * Delete uploaded image
   */
  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    await uploadService.deleteImage(key);
    return sendSuccess(res, { message: 'Image deleted successfully' });
  });
}

export default new UploadController();
