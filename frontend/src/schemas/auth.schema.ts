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
 * Schema for password reset request.
 * Mirrors PasswordResetRequestRequest from types.gen.ts
 */
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
}).strict()

/**
 * Schema for password reset confirm request.
 * Mirrors PasswordResetConfirmRequest from types.gen.ts
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
}).strict()

/**
 * Type exports for use in components and composables
 */
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type EmailTokenObtainPairInput = z.infer<typeof emailTokenObtainPairSchema>
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>
export type TokenRefreshInput = z.infer<typeof tokenRefreshSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>
