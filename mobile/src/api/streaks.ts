import apiClient from './client';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  lastVoteDate: Date | null;
  canUseFreeze: boolean;
  daysUntilFreeze: number | null;
}

export interface StreakBadge {
  userId: string;
  badgeType: string;
  earnedAt: string;
  metadata: any;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
}

class StreakApi {
  /**
   * Get current user's streak information
   */
  async getMyStreak(): Promise<StreakInfo> {
    const response = await apiClient.get('/streaks/my');
    return response.data.data;
  }

  /**
   * Use streak freeze to save a broken streak
   */
  async useFreeze(): Promise<{ freezeUsed: boolean; message: string }> {
    const response = await apiClient.post('/streaks/freeze');
    return response.data.data;
  }

  /**
   * Get current user's streak badges
   */
  async getMyBadges(): Promise<{ badges: StreakBadge[]; count: number }> {
    const response = await apiClient.get('/streaks/badges');
    return response.data.data;
  }

  /**
   * Get streak leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<{
    leaderboard: LeaderboardEntry[];
    total: number;
  }> {
    const response = await apiClient.get('/streaks/leaderboard', {
      params: { limit },
    });
    return response.data.data;
  }
}

export default new StreakApi();
