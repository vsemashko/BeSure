import apiClient from './client';
import type { ApiResponse, Question, CreateQuestionInput, FeedMode } from '../types';

export const questionApi = {
  /**
   * Create a new question
   */
  async create(data: CreateQuestionInput): Promise<Question> {
    const response = await apiClient.post<ApiResponse<Question>>('/questions', data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to create question');
  },

  /**
   * Get question feed
   */
  async getFeed(params?: {
    mode?: FeedMode;
    limit?: number;
    offset?: number;
  }): Promise<{questions: Question[]; total: number}> {
    const response = await apiClient.get<ApiResponse<{questions: Question[]; total: number; limit: number; offset: number}>>('/questions', { params });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get feed');
  },

  /**
   * Get a single question
   */
  async getById(id: string): Promise<Question> {
    const response = await apiClient.get<ApiResponse<Question>>(`/questions/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Question not found');
  },

  /**
   * Get current user's questions
   */
  async getMyQuestions(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{questions: Question[]; total: number}> {
    const response = await apiClient.get<ApiResponse<{questions: Question[]; total: number}>>('/questions/my', { params });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get questions');
  },

  /**
   * Delete a question
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<{message: string}>>(`/questions/${id}`);

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete question');
    }
  },
};

export default questionApi;
