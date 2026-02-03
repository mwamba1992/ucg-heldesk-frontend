import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/services/api';
import type { User, LoginCredentials, AuthResponse } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginCredentials): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      const data = response.data;

      token.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      user.value = data.user;

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      error.value = errorMessage;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
    }
  }

  function clearAuth(): void {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async function refreshAccessToken(): Promise<string | null> {
    if (!refreshToken.value) {
      clearAuth();
      return null;
    }

    try {
      const response = await api.post<AuthResponse>('/auth/refresh', {
        refreshToken: refreshToken.value,
      });
      const data = response.data;

      token.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      user.value = data.user;

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      return data.accessToken;
    } catch {
      clearAuth();
      return null;
    }
  }

  async function fetchProfile(): Promise<void> {
    if (!token.value) return;

    try {
      const response = await api.get<User>('/auth/me');
      user.value = response.data;
    } catch {
      clearAuth();
    }
  }

  // Initialize: fetch profile if token exists
  if (token.value && !user.value) {
    fetchProfile();
  }

  return {
    user,
    token,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearAuth,
    refreshAccessToken,
    fetchProfile,
  };
});
