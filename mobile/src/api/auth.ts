import apiClient from './client';
import type { ApiResponse, AuthResponse, User } from '../types';

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);

    if (response.success && response.data) {
      // Save tokens
      await apiClient.setToken(response.data.token);
      await apiClient.setRefreshToken(response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.error?.message || 'Registration failed');
  },

  /**
   * Login user
   */
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);

    if (response.success && response.data) {
      // Save tokens
      await apiClient.setToken(response.data.token);
      await apiClient.setRefreshToken(response.data.refreshToken);
      return response.data;
    }

    throw new Error(response.error?.message || 'Login failed');
  },

  /**
   * Get current user
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get user');
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await apiClient.clearTokens();
    }
  },
};

export default authApi;
