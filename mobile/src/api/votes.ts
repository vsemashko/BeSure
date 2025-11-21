import apiClient from './client';
import type { ApiResponse, VoteResult, Vote } from '../types';

export const voteApi = {
  /**
   * Cast a vote
   */
  async castVote(data: { questionId: string; optionId: string }): Promise<VoteResult> {
    const response = await apiClient.post<ApiResponse<VoteResult>>('/votes', data);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to cast vote');
  },

  /**
   * Get user's voting history
   */
  async getMyVotes(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{votes: Vote[]; total: number}> {
    const response = await apiClient.get<ApiResponse<{votes: Vote[]; total: number}>>('/votes/my', params);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get votes');
  },

  /**
   * Get votes for a question
   */
  async getQuestionVotes(questionId: string): Promise<Vote[]> {
    const response = await apiClient.get<ApiResponse<Vote[]>>(`/votes/question/${questionId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get question votes');
  },

  /**
   * Get vote statistics for a question
   */
  async getQuestionStats(questionId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/votes/question/${questionId}/stats`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get stats');
  },
};

export default voteApi;
