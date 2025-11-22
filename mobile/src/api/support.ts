import apiClient from './client';
import type { ApiResponse } from '../types';

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'bug' | 'feature' | 'account' | 'billing' | 'other';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  message: string;
  email: string;
  userAgent?: string;
  appVersion?: string;
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'account' | 'billing' | 'other';
  userAgent?: string;
  appVersion?: string;
}

export interface CreateTicketResponse {
  ticketId: string;
}

const supportApi = {
  /**
   * Create a new support ticket
   */
  async createTicket(data: CreateTicketRequest): Promise<CreateTicketResponse> {
    const response = await apiClient.post<ApiResponse<CreateTicketResponse>>(
      '/support/tickets',
      data
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to create support ticket');
  },

  /**
   * Get user's support tickets
   */
  async getUserTickets(limit: number = 20): Promise<SupportTicket[]> {
    const response = await apiClient.get<
      ApiResponse<{ tickets: SupportTicket[]; total: number }>
    >(`/support/tickets?limit=${limit}`);

    if (response.success && response.data) {
      return response.data.tickets;
    }

    throw new Error(response.error?.message || 'Failed to get support tickets');
  },

  /**
   * Get specific ticket by ID
   */
  async getTicketById(ticketId: string): Promise<SupportTicketDetail> {
    const response = await apiClient.get<ApiResponse<SupportTicketDetail>>(
      `/support/tickets/${ticketId}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get ticket details');
  },
};

export default supportApi;
