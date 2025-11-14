/**
 * Authentication mutation hooks using TanStack Query
 * Handles login, register, OTP verification, and OTP resend
 */

import { useMutation, UseMutationResult } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import type {
  EmailTokenObtainPairRequest,
  TokenObtainPair,
  UserRegistrationRequestWritable,
  User,
  OtpVerificationRequest,
  OtpVerification,
  ResendOtpRequest,
  ResendOtp,
  PasswordResetOtpRequestRequest,
  PasswordResetOtpRequest,
  PasswordResetOtpConfirmRequestWritable,
  PasswordResetOtpConfirm,
} from '@/api/types.gen'

// Type aliases for better naming
type LoginRequest = EmailTokenObtainPairRequest
type LoginResponse = TokenObtainPair
type RegisterRequest = UserRegistrationRequestWritable
type RegisterResponse = User
type VerifyOTPRequest = OtpVerificationRequest
type VerifyOTPResponse = OtpVerification
type ResendOTPRequest = ResendOtpRequest
type ResendOTPResponse = ResendOtp
type RequestPasswordResetOTPRequest = PasswordResetOtpRequestRequest
type RequestPasswordResetOTPResponse = PasswordResetOtpRequest
type ConfirmPasswordResetOTPRequest = PasswordResetOtpConfirmRequestWritable
type ConfirmPasswordResetOTPResponse = PasswordResetOtpConfirm

/**
 * Hook for user login
 * Authenticates user and stores JWT tokens
 *
 * @example
 * ```tsx
 * const loginMutation = useLogin()
 *
 * loginMutation.mutate({
 *   email: 'user@example.com',
 *   password: 'password123',
 * })
 * ```
 */
export function useLogin(): UseMutationResult<
  LoginResponse,
  Error,
  LoginRequest,
  unknown
> {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
  })
}

/**
 * Hook for user registration
 * Creates a new user account and sends OTP to email
 *
 * @example
 * ```tsx
 * const registerMutation = useRegister()
 *
 * registerMutation.mutate({
 *   email: 'newuser@example.com',
 *   password: 'password123',
 *   first_name: 'John',
 *   last_name: 'Doe',
 * })
 * ```
 */
export function useRegister(): UseMutationResult<
  RegisterResponse,
  Error,
  RegisterRequest,
  unknown
> {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  })
}

/**
 * Hook for OTP verification
 * Verifies OTP code and completes authentication
 *
 * @example
 * ```tsx
 * const verifyOTPMutation = useVerifyOTP()
 *
 * verifyOTPMutation.mutate({
 *   email: 'user@example.com',
 *   otp_code: '123456',
 * })
 * ```
 */
export function useVerifyOTP(): UseMutationResult<
  VerifyOTPResponse,
  Error,
  VerifyOTPRequest,
  unknown
> {
  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => authService.verifyOTP(data),
  })
}

/**
 * Hook for resending OTP
 * Sends a new OTP code to user's email
 *
 * @example
 * ```tsx
 * const resendOTPMutation = useResendOTP()
 *
 * resendOTPMutation.mutate({
 *   email: 'user@example.com',
 * })
 * ```
 */
export function useResendOTP(): UseMutationResult<
  ResendOTPResponse,
  Error,
  ResendOTPRequest,
  unknown
> {
  return useMutation({
    mutationFn: (data: ResendOTPRequest) => authService.resendOTP(data),
  })
}

/**
 * Hook for requesting password reset OTP
 * Sends OTP code to user's email for password reset
 *
 * @example
 * ```tsx
 * const requestPasswordResetOTPMutation = useRequestPasswordResetOTP()
 *
 * requestPasswordResetOTPMutation.mutate({
 *   email: 'user@example.com',
 * })
 * ```
 */
export function useRequestPasswordResetOTP(): UseMutationResult<
  RequestPasswordResetOTPResponse,
  Error,
  RequestPasswordResetOTPRequest,
  unknown
> {
  return useMutation({
    mutationFn: (data: RequestPasswordResetOTPRequest) =>
      authService.requestPasswordResetOTP(data),
  })
}

/**
 * Hook for confirming password reset with OTP
 * Resets password using OTP code sent to email
 *
 * @example
 * ```tsx
 * const confirmPasswordResetOTPMutation = useConfirmPasswordResetOTP()
 *
 * confirmPasswordResetOTPMutation.mutate({
 *   email: 'user@example.com',
 *   code: '123456',
 *   password: 'NewPassword123!',
 * })
 * ```
 */
export function useConfirmPasswordResetOTP(): UseMutationResult<
  ConfirmPasswordResetOTPResponse,
  Error,
  ConfirmPasswordResetOTPRequest,
  unknown
> {
  return useMutation({
    mutationFn: (data: ConfirmPasswordResetOTPRequest) =>
      authService.confirmPasswordResetOTP(data),
  })
}
