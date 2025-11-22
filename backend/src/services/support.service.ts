import prisma from '../config/database';
import logger from '../utils/logger';
import { ValidationError, NotFoundError } from '../utils/errors';

export interface SupportTicket {
  userId: string;
  email: string;
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'account' | 'billing' | 'other';
  userAgent?: string;
  appVersion?: string;
}

class SupportService {
  /**
   * Create a support ticket
   */
  async createTicket(data: SupportTicket): Promise<{ ticketId: string }> {
    // Validate input
    if (!data.email || !data.subject || !data.message) {
      throw new ValidationError('Email, subject, and message are required');
    }

    if (data.subject.length < 5 || data.subject.length > 200) {
      throw new ValidationError('Subject must be between 5 and 200 characters');
    }

    if (data.message.length < 10 || data.message.length > 2000) {
      throw new ValidationError('Message must be between 10 and 2000 characters');
    }

    // Create ticket in database
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: data.userId,
        email: data.email,
        subject: data.subject,
        message: data.message,
        category: data.category,
        userAgent: data.userAgent,
        appVersion: data.appVersion,
        status: 'open',
      },
    });

    logger.info(`Support ticket created: ${ticket.id} by user ${data.userId}`);

    // TODO: Send email notification to support team
    // This would integrate with SendGrid, AWS SES, or similar service
    // await this.sendEmailNotification(ticket);

    return {
      ticketId: ticket.id,
    };
  }

  /**
   * Get user's support tickets
   */
  async getUserTickets(userId: string, limit: number = 20) {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        subject: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return tickets;
  }

  /**
   * Get ticket by ID (only if user owns it)
   */
  async getTicketById(ticketId: string, userId: string) {
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket');
    }

    return ticket;
  }

  // Future: Email notification integration
  // private async sendEmailNotification(ticket: any): Promise<void> {
  //   // Integration with email service
  //   // SendGrid, AWS SES, etc.
  // }
}

export default new SupportService();
