import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT, TOKEN_STORAGE_KEYS } from '@/config/api';

/**
 * Axios instance for API calls
 *
 * Configured with:
 * - Base URL (10.0.2.2 for Android emulator, localhost for iOS)
 * - Timeout (30 seconds)
 * - Request interceptor (adds JWT token from AsyncStorage)
 * - Response interceptor (handles 401 errors)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request interceptor: Add JWT token from AsyncStorage to all requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token from storage:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle 401 Unauthorized (token expired/invalid)
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // If unauthorized, clear the stored token
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
        delete apiClient.defaults.headers.Authorization;
      } catch (storageError) {
        console.error('Failed to clear auth token:', storageError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Set the authentication token
 * @param token - JWT access token
 */
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Failed to set auth token:', error);
  }
};

/**
 * Clear the authentication token
 */
export const clearAuthToken = async (): Promise<void> => {
  try {
    delete apiClient.defaults.headers.Authorization;
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

/**
 * Get the current authentication token
 * @returns The stored JWT token or null if not found
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};
