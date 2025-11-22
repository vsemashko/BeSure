import apiClient from './client';
import type { ApiResponse } from '../types';

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

export interface ReferralCodeResponse {
  referralCode: string;
  shareUrl: string;
}

export interface ReferredUser {
  username: string;
  profileData: any;
  joinedAt: string;
  referredAt: string;
  pointsAwarded: boolean;
  rewardedAt: string | null;
}

export interface ReferredUsersResponse {
  referredUsers: ReferredUser[];
  total: number;
}

const referralApi = {
  /**
   * Get user's referral code and share URL
   */
  async getReferralCode(): Promise<ReferralCodeResponse> {
    const response = await apiClient.get<ApiResponse<ReferralCodeResponse>>('/referral/code');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get referral code');
  },

  /**
   * Get referral statistics for current user
   */
  async getReferralStats(): Promise<ReferralStats> {
    const response = await apiClient.get<ApiResponse<ReferralStats>>('/referral/stats');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get referral stats');
  },

  /**
   * Get list of users referred by current user
   */
  async getReferredUsers(limit: number = 50): Promise<ReferredUsersResponse> {
    const response = await apiClient.get<ApiResponse<ReferredUsersResponse>>(
      `/referral/referred-users?limit=${limit}`
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to get referred users');
  },

  /**
   * Validate a referral code (public endpoint for signup flow)
   */
  async validateReferralCode(code: string): Promise<{ valid: boolean; message: string }> {
    const response = await apiClient.post<
      ApiResponse<{ valid: boolean; message: string }>
    >('/referral/validate', { code });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message || 'Failed to validate referral code');
  },
};

export default referralApi;
