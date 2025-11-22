import { Request, Response, NextFunction } from 'express';
import supportService from '../../services/support.service';
import logger from '../../utils/logger';
import { body, validationResult } from 'express-validator';

class SupportController {
  /**
   * Validation rules for creating a support ticket
   */
  createTicketValidation = [
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters'),
    body('category')
      .isIn(['bug', 'feature', 'account', 'billing', 'other'])
      .withMessage('Invalid category'),
    body('userAgent').optional().isString(),
    body('appVersion').optional().isString(),
  ];

  /**
   * POST /api/v1/support/tickets
   * Create a new support ticket
   */
  async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array(),
          },
        });
      }

      const userId = req.user!.id;
      const email = req.user!.email;

      const { subject, message, category, userAgent, appVersion } = req.body;

      const result = await supportService.createTicket({
        userId,
        email,
        subject,
        message,
        category,
        userAgent,
        appVersion,
      });

      logger.info(`Support ticket created: ${result.ticketId} by user ${userId}`);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Support ticket created successfully. Our team will review it shortly.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/support/tickets
   * Get user's support tickets
   */
  async getUserTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 20;

      const tickets = await supportService.getUserTickets(userId, limit);

      res.json({
        success: true,
        data: {
          tickets,
          total: tickets.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/support/tickets/:id
   * Get specific ticket by ID
   */
  async getTicketById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const ticketId = req.params.id;

      const ticket = await supportService.getTicketById(ticketId, userId);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SupportController();
