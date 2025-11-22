import apiClient from './client';

export interface QuestionInsights {
  questionId: string;
  totalVotes: number;
  totalViews: number;
  engagementRate: number;
  votesByOption: Array<{
    optionId: string;
    content: string;
    voteCount: number;
    percentage: number;
  }>;
  voterDemographics: {
    totalVoters: number;
    avgPointsPerVoter: number;
    topVotersByPoints: Array<{
      userId: string;
      username: string;
      points: number;
    }>;
  };
  timeBasedTrends: Array<{
    timestamp: string;
    cumulativeVotes: number;
  }>;
  createdAt: string;
  expiresAt: string;
  status: string;
}

export interface UserStats {
  userId: string;
  questionsCreated: number;
  totalVotesReceived: number;
  votesGiven: number;
  avgVotesPerQuestion: number;
  mostPopularQuestion: {
    id: string;
    title: string;
    voteCount: number;
  } | null;
  topPerformingTopics: Array<{
    topic: string;
    questionCount: number;
    avgVotes: number;
  }>;
}

export interface ExportData {
  question: {
    id: string;
    title: string;
    description: string | null;
    createdAt: string;
    expiresAt: string;
    status: string;
  };
  options: Array<{
    content: string;
    voteCount: number;
    percentage: number;
  }>;
  votes: Array<{
    optionContent: string;
    voterUsername: string;
    votedAt: string;
    voterPoints: number;
  }>;
  summary: {
    totalVotes: number;
    engagementRate: number;
    winningOption: string;
  };
}

export interface QuickStats {
  totalVotes: number;
  topOption: string;
  topOptionPercentage: number;
}

class AnalyticsApi {
  /**
   * Get comprehensive insights for a question
   * @param questionId - ID of the question
   */
  async getQuestionInsights(questionId: string): Promise<QuestionInsights> {
    const response = await apiClient.get<{ data: QuestionInsights }>(
      `/analytics/question/${questionId}`
    );
    return response.data;
  }

  /**
   * Get current user's statistics
   */
  async getMyStats(): Promise<UserStats> {
    const response = await apiClient.get<{ data: UserStats }>('/analytics/my-stats');
    return response.data;
  }

  /**
   * Export question data for CSV/PDF
   * @param questionId - ID of the question to export
   */
  async exportQuestionData(questionId: string): Promise<ExportData> {
    const response = await apiClient.get<{ data: ExportData }>(
      `/analytics/export/${questionId}`
    );
    return response.data;
  }

  /**
   * Get quick stats for a question (lightweight)
   * @param questionId - ID of the question
   */
  async getQuickStats(questionId: string): Promise<QuickStats> {
    const response = await apiClient.get<{ data: QuickStats }>(
      `/analytics/question/${questionId}/quick`
    );
    return response.data;
  }
}

export default new AnalyticsApi();
