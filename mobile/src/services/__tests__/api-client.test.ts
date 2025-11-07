import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthToken, clearAuthToken, getAuthToken } from '../api-client';
import { API_BASE_URL, TOKEN_STORAGE_KEYS } from '@/config/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('apiClient configuration', () => {
    it('should have correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
    });

    it('should have correct timeout', () => {
      expect(apiClient.defaults.timeout).toBe(30000);
    });

    it('should have correct headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(apiClient.defaults.headers['Accept']).toBe('application/json');
    });
  });

  describe('setAuthToken', () => {
    it('should set authorization header and store token in AsyncStorage', async () => {
      const token = 'test-access-token';

      await setAuthToken(token);

      expect(apiClient.defaults.headers.Authorization).toBe(`Bearer ${token}`);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        TOKEN_STORAGE_KEYS.ACCESS_TOKEN,
        token
      );
    });

    it('should handle errors when storing token fails', async () => {
      const token = 'test-token';
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      // Should not throw, just log error
      await expect(setAuthToken(token)).resolves.not.toThrow();
    });
  });

  describe('clearAuthToken', () => {
    it('should remove authorization header and clear token from AsyncStorage', async () => {
      apiClient.defaults.headers.Authorization = 'Bearer test-token';

      await clearAuthToken();

      expect(apiClient.defaults.headers.Authorization).toBeUndefined();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        TOKEN_STORAGE_KEYS.ACCESS_TOKEN
      );
    });

    it('should handle errors when removing token fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      // Should not throw, just log error
      await expect(clearAuthToken()).resolves.not.toThrow();
    });
  });

  describe('getAuthToken', () => {
    it('should retrieve token from AsyncStorage', async () => {
      const expectedToken = 'stored-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(expectedToken);

      const token = await getAuthToken();

      expect(token).toBe(expectedToken);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        TOKEN_STORAGE_KEYS.ACCESS_TOKEN
      );
    });

    it('should return null when no token is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const token = await getAuthToken();

      expect(token).toBeNull();
    });

    it('should return null when storage fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const token = await getAuthToken();

      expect(token).toBeNull();
    });
  });

  describe('Request interceptor', () => {
    it('should add Authorization header from AsyncStorage if token exists', async () => {
      const token = 'stored-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(token);

      // Access request interceptor (it's at index 0)
      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      const config = { headers: {} };

      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header if no token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      const config = { headers: {} };

      const result = await interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response interceptor', () => {
    it('should pass through successful responses', async () => {
      const response = { data: { success: true }, status: 200 };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];
      const result = await interceptor.fulfilled(response);

      expect(result).toEqual(response);
    });

    it('should clear auth token on 401 Unauthorized', async () => {
      const error = {
        response: { status: 401 },
        config: {},
      };

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      try {
        await interceptor.rejected(error);
      } catch (err) {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          TOKEN_STORAGE_KEYS.ACCESS_TOKEN
        );
      }
    });
  });
});
