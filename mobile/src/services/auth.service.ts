import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/config/api';
import type {
  UserRegistrationRequestWritable,
  User,
  EmailTokenObtainPairRequest,
  TokenObtainPair,
  OtpVerificationRequest,
  OtpVerification,
  ResendOtpRequest,
  ResendOtp,
  TokenRefreshRequest,
  TokenRefresh,
  PasswordResetOtpRequestRequest,
  PasswordResetOtpRequest,
  PasswordResetOtpConfirmRequestWritable,
  PasswordResetOtpConfirm,
} from '@/api/types.gen';

/**
 * Authentication Service
 *
 * Handles all authentication-related API calls:
 * - User registration
 * - Login (JWT token obtain)
 * - OTP verification
 * - OTP resend
 * - Token refresh
 * - Get current user
 */
export const authService = {
  /**
   * Register a new user
   * @param data - User registration data
   * @returns User data (email not yet verified)
   */
  register: async (data: UserRegistrationRequestWritable): Promise<User> => {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Login (obtain JWT tokens)
   * @param data - Login credentials
   * @returns Access and refresh tokens
   */
  login: async (data: EmailTokenObtainPairRequest): Promise<TokenObtainPair> => {
    const response = await apiClient.post<TokenObtainPair>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return response.data;
  },

  /**
   * Verify email with OTP code
   * @param data - Email and OTP code
   * @returns Success message
   */
  verifyOTP: async (data: OtpVerificationRequest): Promise<OtpVerification> => {
    const response = await apiClient.post<OtpVerification>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    );
    return response.data;
  },

  /**
   * Resend OTP verification code
   * @param data - User email
   * @returns Success message
   */
  resendOTP: async (data: ResendOtpRequest): Promise<ResendOtp> => {
    const response = await apiClient.post<ResendOtp>(
      API_ENDPOINTS.AUTH.RESEND_OTP,
      data
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * @param refreshToken - JWT refresh token
   * @returns New access token
   */
  refreshToken: async (refreshToken: string): Promise<TokenRefresh> => {
    const response = await apiClient.post<TokenRefresh>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refresh: refreshToken } as TokenRefreshRequest
    );
    return response.data;
  },

  /**
   * Get current authenticated user data
   * @returns Current user data
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.USERS.ME);
    return response.data;
  },

  /**
   * Request password reset OTP
   * @param data - User email
   * @returns Success message
   */
  requestPasswordResetOTP: async (
    data: PasswordResetOtpRequestRequest
  ): Promise<PasswordResetOtpRequest> => {
    const response = await apiClient.post<PasswordResetOtpRequest>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_OTP_REQUEST,
      data
    );
    return response.data;
  },

  /**
   * Confirm password reset with OTP code
   * @param data - Email, OTP code, and new password
   * @returns Success message
   */
  confirmPasswordResetOTP: async (
    data: PasswordResetOtpConfirmRequestWritable
  ): Promise<PasswordResetOtpConfirm> => {
    const response = await apiClient.post<PasswordResetOtpConfirm>(
      API_ENDPOINTS.AUTH.PASSWORD_RESET_OTP_CONFIRM,
      data
    );
    return response.data;
  },
};
