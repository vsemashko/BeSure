import apiClient from './client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  value: number;
  profileData?: any;
}

export interface LeaderboardResult {
  leaderboard: LeaderboardEntry[];
  total: number;
  userRank?: {
    rank: number;
    value: number;
  };
}

export type LeaderboardType = 'points' | 'streak' | 'questions' | 'votes';

class LeaderboardApi {
  /**
   * Get global points leaderboard
   */
  async getPointsLeaderboard(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get('/leaderboard/points', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  /**
   * Get global streak leaderboard
   */
  async getStreakLeaderboard(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get('/leaderboard/streak', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  /**
   * Get question creators leaderboard
   */
  async getQuestionCreatorsLeaderboard(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get('/leaderboard/questions', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  /**
   * Get voters leaderboard
   */
  async getVotersLeaderboard(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<LeaderboardResult> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get('/leaderboard/votes', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  /**
   * Get friend leaderboard filtered by type
   */
  async getFriendLeaderboard(
    type: LeaderboardType,
    limit: number = 50
  ): Promise<LeaderboardResult> {
    const response = await apiClient.get(`/leaderboard/friends/${type}`, {
      params: { limit },
    });
    return response.data.data;
  }
}

export default new LeaderboardApi();
