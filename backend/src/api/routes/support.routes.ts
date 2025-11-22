import { Router } from 'express';
import supportController from '../controllers/support.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All support routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/support/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
router.post(
  '/tickets',
  supportController.createTicketValidation,
  supportController.createTicket
);

/**
 * @route   GET /api/v1/support/tickets
 * @desc    Get user's support tickets
 * @access  Private
 */
router.get('/tickets', supportController.getUserTickets);

/**
 * @route   GET /api/v1/support/tickets/:id
 * @desc    Get specific ticket by ID
 * @access  Private
 */
router.get('/tickets/:id', supportController.getTicketById);

export default router;
