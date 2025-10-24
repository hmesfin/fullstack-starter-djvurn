import { z } from 'zod'

/**
 * Schema for user registration request.
 * Mirrors UserRegistrationRequestWritable from types.gen.ts
 */
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
}).strict()

/**
 * Schema for JWT token obtain (login) request.
 * Mirrors EmailTokenObtainPairRequest from types.gen.ts
 */
export const emailTokenObtainPairSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}).strict()

/**
 * Schema for OTP verification request.
 * Mirrors OtpVerificationRequest from types.gen.ts
 */
export const otpVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'OTP code must be exactly 6 digits').regex(/^\d{6}$/, 'OTP code must contain only digits'),
}).strict()

/**
 * Schema for token refresh request.
 * Mirrors TokenRefreshRequest from types.gen.ts
 */
export const tokenRefreshSchema = z.object({
  refresh: z.string().min(1, 'Refresh token is required'),
}).strict()

/**
 * Type exports for use in components and composables
 */
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type EmailTokenObtainPairInput = z.infer<typeof emailTokenObtainPairSchema>
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>
export type TokenRefreshInput = z.infer<typeof tokenRefreshSchema>
