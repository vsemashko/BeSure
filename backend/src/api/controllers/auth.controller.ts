import { Request, Response } from 'express';
import authService from '../../services/auth.service';
import { sendSuccess } from '../../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';

class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    const result = await authService.register({ email, username, password });
    return sendSuccess(res, result, 201);
  });

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, result);
  });

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await authService.getMe(userId);
    return sendSuccess(res, user);
  });

  /**
   * POST /api/v1/auth/logout
   * Logout user (client-side only, just removes token)
   */
  logout = asyncHandler(async (_req: Request, res: Response) => {
    return sendSuccess(res, { message: 'Logged out successfully' });
  });

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    return sendSuccess(res, tokens);
  });

  /**
   * PUT /api/v1/auth/profile
   * Update user profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updatedUser = await authService.updateProfile(userId, req.body);
    return sendSuccess(res, updatedUser);
  });

  /**
   * PUT /api/v1/auth/password
   * Change password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await authService.changePassword(userId, req.body);
    return sendSuccess(res, result);
  });
}

export default new AuthController();
