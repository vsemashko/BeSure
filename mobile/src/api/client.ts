import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { jwtDecode } from 'jwt-decode';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import {
  API_TIMEOUT,
  API_RETRY_ATTEMPTS,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_REFRESH_THRESHOLD,
  ERROR_MESSAGES,
} from '../constants';
import logger from '../utils/logger';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';

interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: API_RETRY_ATTEMPTS,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ?? 0) >= 500
        );
      },
      onRetry: (retryCount, error) => {
        logger.warn(`Retrying request (${retryCount}/${API_RETRY_ATTEMPTS})`, {
          url: error.config?.url,
          method: error.config?.method,
        });
      },
    });

    // Request interceptor to add auth token and check expiry
    this.client.interceptors.request.use(
      async (config) => {
        logger.logRequest(config.method?.toUpperCase() || 'GET', config.url || '');

        // Get token if not in memory
        if (!this.token) {
          this.token = await this.getToken();
        }

        // Check if token needs refresh
        if (this.token && this.shouldRefreshToken(this.token)) {
          await this.handleTokenRefresh();
        }

        // Add token to request
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        return config;
      },
      (error) => {
        logger.logError('REQUEST', error.config?.url || '', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        const method = response.config.method?.toUpperCase() || 'GET';
        const url = response.config.url || '';
        const status = response.status;

        logger.logResponse(method, url, status);
        logger.logAPICall(method, url, status);

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        const method = originalRequest.method?.toUpperCase() || 'GET';
        const url = originalRequest.url || '';
        const status = error.response?.status;

        logger.logError(method, url, error);
        logger.logAPICall(method, url, status);

        // Handle 401 Unauthorized - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.handleTokenRefresh();
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.clearTokens();
            throw this.createApiError(ERROR_MESSAGES.TOKEN_EXPIRED, 401, 'TOKEN_EXPIRED');
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          throw this.createApiError(
            ERROR_MESSAGES.RATE_LIMIT_ERROR,
            429,
            'RATE_LIMIT_EXCEEDED'
          );
        }

        // Handle network errors
        if (!error.response) {
          throw this.createApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, 'NETWORK_ERROR');
        }

        // Handle other errors
        const apiError = error.response?.data as any;
        throw this.createApiError(
          apiError?.error?.message || ERROR_MESSAGES.GENERIC_ERROR,
          error.response?.status,
          apiError?.error?.code
        );
      }
    );
  }

  /**
   * Check if token should be refreshed
   */
  private shouldRefreshToken(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;

      return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
    } catch (error) {
      logger.warn('Failed to decode token', error);
      return true; // Assume needs refresh if can't decode
    }
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const expiresAt = decoded.exp * 1000;
      return Date.now() >= expiresAt;
    } catch (error) {
      logger.warn('Failed to decode token', error);
      return true; // Assume expired if can't decode
    }
  }

  /**
   * Handle token refresh
   */
  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh to complete
      return new Promise((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      logger.info('Refreshing access token...');

      // Call refresh endpoint
      const response = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        { timeout: API_TIMEOUT }
      );

      const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

      // Update tokens
      await this.setToken(newToken);
      if (newRefreshToken) {
        await this.setRefreshToken(newRefreshToken);
      }

      // Notify all waiting subscribers
      this.refreshSubscribers.forEach((callback) => callback(newToken));
      this.refreshSubscribers = [];

      logger.info('Access token refreshed successfully');
      return newToken;
    } catch (error) {
      logger.error('Token refresh failed', error);
      this.refreshSubscribers = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Create standardized API error
   */
  private createApiError(message: string, statusCode?: number, code?: string): ApiError {
    const error = new Error(message) as Error & ApiError;
    error.message = message;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  // Token management
  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    return this.token;
  }

  async setRefreshToken(refreshToken: string): Promise<void> {
    this.refreshToken = refreshToken;
    await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }

  async getRefreshToken(): Promise<string | null> {
    if (this.refreshToken) return this.refreshToken;
    this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY);
    return this.refreshToken;
  }

  async clearTokens(): Promise<void> {
    this.token = null;
    this.refreshToken = null;
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
    logger.info('Tokens cleared');
  }

  // HTTP methods with proper typing
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Check if user is authenticated with token validation
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      // Try to refresh
      try {
        await this.handleTokenRefresh();
        return true;
      } catch (error) {
        await this.clearTokens();
        return false;
      }
    }

    return true;
  }

  // Get user info from token
  getUserIdFromToken(): string | null {
    try {
      if (!this.token) return null;
      const decoded = jwtDecode<JWTPayload>(this.token);
      return decoded.userId;
    } catch (error) {
      logger.warn('Failed to decode token for user ID', error);
      return null;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
