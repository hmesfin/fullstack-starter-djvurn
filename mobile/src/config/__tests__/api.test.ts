import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { API_BASE_URL, API_TIMEOUT, TOKEN_STORAGE_KEYS, API_ENDPOINTS } from '../api';

describe('API Configuration', () => {
  describe('API_BASE_URL', () => {
    it('should use ngrok URL in development', () => {
      // In dev mode, API_BASE_URL should use ngrok tunnel
      expect(API_BASE_URL).toContain('ngrok');
    });

    it('should be a valid URL', () => {
      // API_BASE_URL should be a valid URL format
      expect(API_BASE_URL).toMatch(/^https?:\/\/.+/);
    });
  });

  describe('API_TIMEOUT', () => {
    it('should be 30 seconds (30000ms)', () => {
      expect(API_TIMEOUT).toBe(30000);
    });
  });

  describe('TOKEN_STORAGE_KEYS', () => {
    it('should have correct access token key', () => {
      expect(TOKEN_STORAGE_KEYS.ACCESS_TOKEN).toBe('@auth/access_token');
    });

    it('should have correct refresh token key', () => {
      expect(TOKEN_STORAGE_KEYS.REFRESH_TOKEN).toBe('@auth/refresh_token');
    });
  });

  describe('API_ENDPOINTS', () => {
    describe('AUTH endpoints', () => {
      it('should have register endpoint', () => {
        expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/api/auth/register/');
      });

      it('should have login endpoint', () => {
        expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/api/auth/token/');
      });

      it('should have refresh endpoint', () => {
        expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/api/auth/token/refresh/');
      });

      it('should have verify OTP endpoint', () => {
        expect(API_ENDPOINTS.AUTH.VERIFY_OTP).toBe('/api/auth/verify-otp/');
      });

      it('should have resend OTP endpoint', () => {
        expect(API_ENDPOINTS.AUTH.RESEND_OTP).toBe('/api/auth/resend-otp/');
      });
    });

    describe('USERS endpoints', () => {
      it('should have me endpoint', () => {
        expect(API_ENDPOINTS.USERS.ME).toBe('/api/users/me/');
      });

      it('should generate update endpoint with user ID', () => {
        expect(API_ENDPOINTS.USERS.UPDATE('123')).toBe('/api/users/123/');
      });
    });

    describe('PROJECTS endpoints', () => {
      it('should have list endpoint', () => {
        expect(API_ENDPOINTS.PROJECTS.LIST).toBe('/api/projects/');
      });

      it('should have create endpoint', () => {
        expect(API_ENDPOINTS.PROJECTS.CREATE).toBe('/api/projects/');
      });

      it('should generate detail endpoint with project ID', () => {
        expect(API_ENDPOINTS.PROJECTS.DETAIL('abc-123')).toBe('/api/projects/abc-123/');
      });

      it('should generate update endpoint with project ID', () => {
        expect(API_ENDPOINTS.PROJECTS.UPDATE('abc-123')).toBe('/api/projects/abc-123/');
      });

      it('should generate delete endpoint with project ID', () => {
        expect(API_ENDPOINTS.PROJECTS.DELETE('abc-123')).toBe('/api/projects/abc-123/');
      });
    });
  });
});
