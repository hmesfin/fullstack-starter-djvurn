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
