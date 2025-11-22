import apiClient from './client';

export interface UserProfile {
  id: string;
  username: string;
  points: number;
  createdAt: string;
  profileData: any;
  isFollowing?: boolean;
  isFollower?: boolean;
  stats: {
    followersCount: number;
    followingCount: number;
    questionsCount: number;
    votesCount: number;
  };
}

export interface UserListItem {
  id: string;
  username: string;
  points: number;
  createdAt: string;
  profileData?: any;
  isFollowing?: boolean;
}

class SocialApi {
  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<void> {
    await apiClient.post(`/social/follow/${userId}`);
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<void> {
    await apiClient.delete(`/social/follow/${userId}`);
  }

  /**
   * Get user's followers
   */
  async getFollowers(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{
    followers: UserListItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get<{
      data: {
        followers: UserListItem[];
        total: number;
        limit: number;
        offset: number;
      };
    }>(`/social/followers/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{
    following: UserListItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 50, offset = 0 } = options;
    const response = await apiClient.get<{
      data: {
        following: UserListItem[];
        total: number;
        limit: number;
        offset: number;
      };
    }>(`/social/following/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get friend feed (questions from followed users)
   */
  async getFriendFeed(options: { limit?: number; offset?: number } = {}): Promise<{
    questions: any[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 20, offset = 0 } = options;
    const response = await apiClient.get<{
      data: {
        questions: any[];
        total: number;
        limit: number;
        offset: number;
      };
    }>('/social/feed/friends', {
      params: { limit, offset },
    });
    return response.data;
  }

  /**
   * Get user profile with stats
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<{ data: UserProfile }>(`/social/profile/${userId}`);
    return response.data;
  }

  /**
   * Search users by username
   */
  async searchUsers(
    query: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{
    users: UserListItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 20, offset = 0 } = options;
    const response = await apiClient.get<{
      data: {
        users: UserListItem[];
        total: number;
        limit: number;
        offset: number;
      };
    }>('/social/search', {
      params: { q: query, limit, offset },
    });
    return response.data;
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedUsers(limit: number = 10): Promise<{
    users: UserListItem[];
    total: number;
  }> {
    const response = await apiClient.get<{
      data: {
        users: UserListItem[];
        total: number;
      };
    }>('/social/suggestions', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get popular users
   */
  async getPopularUsers(options: { limit?: number; offset?: number } = {}): Promise<{
    users: UserListItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { limit = 10, offset = 0 } = options;
    const response = await apiClient.get<{
      data: {
        users: UserListItem[];
        total: number;
        limit: number;
        offset: number;
      };
    }>('/social/popular', {
      params: { limit, offset },
    });
    return response.data;
  }
}

export default new SocialApi();
