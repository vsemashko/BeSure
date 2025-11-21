import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema } from '../schemas/auth.schemas';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authRateLimiter);

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * POST /api/v1/auth/logout
 * Logout user (client handles token removal)
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, authController.getMe);

export default router;
