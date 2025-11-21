import apiClient from './client';

export interface TopicExpertise {
  topicId: string;
  topicName: string;
  voteCount: number;
  expertiseLevel: string;
}

export interface UserTopicProfile {
  userId: string;
  username: string;
  expertise: TopicExpertise[];
  topExpertise: TopicExpertise[];
  badges: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  voteCount: number;
  expertiseLevel: string;
}

class TopicApi {
  /**
   * Get current user's topic expertise profile
   */
  async getMyExpertise(): Promise<UserTopicProfile> {
    const response = await apiClient.get<{ data: UserTopicProfile }>('/topics/my-expertise');
    return response.data;
  }

  /**
   * Get all topics
   */
  async getAllTopics(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    topics: Topic[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get<{
      data: {
        topics: Topic[];
        total: number;
        limit: number;
        offset: number;
      };
    }>('/topics', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get topic by ID with stats
   */
  async getTopicById(topicId: string): Promise<any> {
    const response = await apiClient.get<{ data: any }>(`/topics/${topicId}`);
    return response.data;
  }

  /**
   * Get topic leaderboard (top experts)
   */
  async getTopicLeaderboard(
    topicId: string,
    limit: number = 10
  ): Promise<{
    leaderboard: LeaderboardEntry[];
    total: number;
  }> {
    const response = await apiClient.get<{
      data: {
        leaderboard: LeaderboardEntry[];
        total: number;
      };
    }>(`/topics/${topicId}/leaderboard`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Create a new topic
   */
  async createTopic(data: {
    name: string;
    description?: string;
  }): Promise<Topic> {
    const response = await apiClient.post<{ data: Topic }>('/topics', data);
    return response.data;
  }
}

export default new TopicApi();
