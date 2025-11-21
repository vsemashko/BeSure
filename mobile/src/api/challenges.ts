import apiClient from './client';

export interface Challenge {
  id: string;
  type: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
}

export interface DailyChallenges {
  date: string;
  challenges: Challenge[];
  completedCount: number;
  totalReward: number;
}

export interface ChallengeHistory {
  date: string;
  challenges: any;
  completed: string[];
  completedCount: number;
}

export interface ChallengeStats {
  totalDays: number;
  totalChallengesCompleted: number;
  totalChallengesPossible: number;
  completionRate: number;
  totalRewards: number;
}

class ChallengeApi {
  /**
   * Get today's challenges for current user
   */
  async getTodayChallenges(): Promise<DailyChallenges> {
    const response = await apiClient.get('/challenges/today');
    return response.data.data;
  }

  /**
   * Get challenge history for current user
   */
  async getChallengeHistory(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    history: ChallengeHistory[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 30, offset = 0 } = options;
    const response = await apiClient.get('/challenges/history', {
      params: { limit, offset },
    });
    return response.data.data;
  }

  /**
   * Get challenge statistics for current user
   */
  async getChallengeStats(): Promise<ChallengeStats> {
    const response = await apiClient.get('/challenges/stats');
    return response.data.data;
  }
}

export default new ChallengeApi();
