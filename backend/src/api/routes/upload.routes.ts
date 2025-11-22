import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/upload/profile
 * Upload profile picture
 */
router.post('/profile', upload.single('image'), uploadController.uploadProfilePicture);

/**
 * POST /api/v1/upload/question
 * Upload question image
 */
router.post('/question', upload.single('image'), uploadController.uploadQuestionImage);

/**
 * POST /api/v1/upload/option
 * Upload option image
 */
router.post('/option', upload.single('image'), uploadController.uploadOptionImage);

/**
 * DELETE /api/v1/upload/:key
 * Delete uploaded image
 */
router.delete('/:key', uploadController.deleteImage);

export default router;
