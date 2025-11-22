import { create } from 'zustand';
import { authApi } from '../api';
import type { User } from '../types';
import logger from '../utils/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      logger.logUserAction('login_attempt', { email });

      const response = await authApi.login({ email, password });

      logger.logUserAction('login_success', {
        userId: response.user.id,
        username: response.user.username,
      });

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      logger.logUserAction('login_failure', { email, error: error.message });

      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      logger.logUserAction('register_attempt', { email, username });

      const response = await authApi.register({ email, username, password });

      logger.logUserAction('register_success', {
        userId: response.user.id,
        username: response.user.username,
      });

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      logger.logUserAction('register_failure', { email, username, error: error.message });

      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      logger.logUserAction('logout_attempt');
      await authApi.logout();
      logger.logUserAction('logout_success');
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const user = await authApi.getMe();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => set({ user }),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
