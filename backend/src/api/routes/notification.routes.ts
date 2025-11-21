import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// POST /api/v1/notifications/token - Save push token
router.post('/token', notificationController.savePushToken);

// DELETE /api/v1/notifications/token - Remove push token
router.delete('/token', notificationController.removePushToken);

// GET /api/v1/notifications/preferences - Get preferences
router.get('/preferences', notificationController.getPreferences);

// PUT /api/v1/notifications/preferences - Update preferences
router.put('/preferences', notificationController.updatePreferences);

export default router;
