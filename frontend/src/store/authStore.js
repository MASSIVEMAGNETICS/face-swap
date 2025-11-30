/**
 * Auth Store
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Register new user
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, token } = response.data;
          
          localStorage.setItem('authToken', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Login user
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, token } = response.data;
          
          localStorage.setItem('authToken', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          // Ignore logout errors
        }
        
        localStorage.removeItem('authToken');
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      /**
       * Get current user profile
       */
      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.getProfile();
          set({ user: response.data.user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          // If profile fetch fails due to auth error, clear auth state
          // Using status code for reliable detection
          if (error.status === 401 || error.code === 'AUTHENTICATION_ERROR') {
            get().logout();
          }
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(profileData);
          set({ user: response.data.user, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Change password
       */
      changePassword: async (passwordData) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.changePassword(passwordData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      /**
       * Clear error
       */
      clearError: () => set({ error: null }),

      /**
       * Initialize auth from localStorage
       */
      initAuth: () => {
        const token = localStorage.getItem('authToken');
        if (token) {
          set({ token, isAuthenticated: true });
          get().fetchProfile();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
