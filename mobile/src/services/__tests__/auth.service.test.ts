import { authService } from '../auth.service';
import { apiClient } from '../api-client';
import type {
  UserRegistrationRequestWritable,
  EmailTokenObtainPairRequest,
  OtpVerificationRequest,
  ResendOtpRequest,
} from '@/api/types.gen';

// Mock the API client
jest.mock('../api-client');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should send registration request and return user data', async () => {
      const mockRequest: UserRegistrationRequestWritable = {
        email: 'test@example.com',
        password: 'TestPass123',
        first_name: 'Test',
        last_name: 'User',
      };

      const mockResponse = {
        data: {
          id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          is_email_verified: false,
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.register(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register/', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on failed registration', async () => {
      const mockRequest: UserRegistrationRequestWritable = {
        email: 'test@example.com',
        password: 'weak',
        first_name: 'Test',
        last_name: 'User',
      };

      const mockError = {
        response: {
          data: { password: ['Password is too weak'] },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(authService.register(mockRequest)).rejects.toEqual(mockError);
    });
  });

  describe('login', () => {
    it('should send login request and return tokens', async () => {
      const mockRequest: EmailTokenObtainPairRequest = {
        email: 'test@example.com',
        password: 'TestPass123',
      };

      const mockResponse = {
        data: {
          access: 'access-token',
          refresh: 'refresh-token',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.login(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/token/', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on invalid credentials', async () => {
      const mockRequest: EmailTokenObtainPairRequest = {
        email: 'test@example.com',
        password: 'wrong',
      };

      const mockError = {
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(authService.login(mockRequest)).rejects.toEqual(mockError);
    });
  });

  describe('verifyOTP', () => {
    it('should send OTP verification request and return success', async () => {
      const mockRequest: OtpVerificationRequest = {
        email: 'test@example.com',
        code: '123456',
      };

      const mockResponse = {
        data: {
          message: 'Email verified successfully',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.verifyOTP(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/verify-otp/', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on invalid OTP code', async () => {
      const mockRequest: OtpVerificationRequest = {
        email: 'test@example.com',
        code: '000000',
      };

      const mockError = {
        response: {
          status: 400,
          data: { error: 'Invalid or expired OTP code' },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(authService.verifyOTP(mockRequest)).rejects.toEqual(mockError);
    });
  });

  describe('resendOTP', () => {
    it('should send resend OTP request and return success', async () => {
      const mockRequest: ResendOtpRequest = {
        email: 'test@example.com',
      };

      const mockResponse = {
        data: {
          message: 'OTP sent successfully',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.resendOTP(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/resend-otp/', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('refreshToken', () => {
    it('should send refresh token request and return new access token', async () => {
      const refreshToken = 'refresh-token';

      const mockResponse = {
        data: {
          access: 'new-access-token',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.refreshToken(refreshToken);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/token/refresh/', {
        refresh: refreshToken,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMe', () => {
    it('should fetch current user data', async () => {
      const mockResponse = {
        data: {
          id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          is_email_verified: true,
        },
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.getMe();

      expect(apiClient.get).toHaveBeenCalledWith('/api/users/me/');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
