import { Platform } from 'react-native';

/**
 * API Configuration
 *
 * Development setup for WSL + Android Studio (Windows):
 * - Android Emulator uses 10.0.2.2 to reach host machine (Windows localhost)
 * - WSL2 auto-forwards ports to Windows localhost
 * - Therefore: Android Emulator → 10.0.2.2 → Windows localhost → WSL Docker
 *
 * No brittle networking needed! This is the battle-tested pattern.
 */

/**
 * Get the API base URL based on environment and platform
 */
const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Development environment
    return Platform.select({
      // Android emulator's special alias for host machine
      // This reaches Windows localhost, which WSL2 forwards to WSL
      android: 'http://10.0.2.2:8000',

      // iOS simulator shares host network, can use localhost directly
      ios: 'http://localhost:8000',

      // Web fallback (if using Expo web)
      default: 'http://localhost:8000',
    });
  }

  // Production - replace with your production API URL
  return 'https://api.yourdomain.com';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Token storage keys
 */
export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: '@auth/access_token',
  REFRESH_TOKEN: '@auth/refresh_token',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register/',
    LOGIN: '/api/auth/token/',
    REFRESH: '/api/auth/token/refresh/',
    VERIFY_OTP: '/api/auth/verify-otp/',
    RESEND_OTP: '/api/auth/resend-otp/',
    FORGOT_PASSWORD: '/api/auth/password/forgot/',
    RESET_PASSWORD: '/api/auth/password/reset/',
  },
  USERS: {
    ME: '/api/users/me/',
    UPDATE: (id: string) => `/api/users/${id}/`,
  },
  PROJECTS: {
    LIST: '/api/projects/',
    DETAIL: (id: string) => `/api/projects/${id}/`,
    CREATE: '/api/projects/',
    UPDATE: (id: string) => `/api/projects/${id}/`,
    DELETE: (id: string) => `/api/projects/${id}/`,
  },
} as const;
