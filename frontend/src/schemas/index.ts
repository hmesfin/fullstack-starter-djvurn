/**
 * Zod schemas for runtime validation.
 *
 * These schemas mirror the TypeScript types generated from the Django OpenAPI schema
 * and provide runtime validation for API requests and responses.
 *
 * Usage:
 * ```typescript
 * import { userRegistrationSchema } from '@/schemas'
 *
 * const result = userRegistrationSchema.safeParse(formData)
 * if (result.success) {
 *   // data is validated
 *   await apiAuthRegisterCreate({ client, body: result.data })
 * }
 * ```
 */

// Auth schemas
export {
  userRegistrationSchema,
  emailTokenObtainPairSchema,
  otpVerificationSchema,
  tokenRefreshSchema,
  type UserRegistrationInput,
  type EmailTokenObtainPairInput,
  type OtpVerificationInput,
  type TokenRefreshInput,
} from './auth.schema'

// User schemas
export {
  userRequestSchema,
  patchedUserRequestSchema,
  userResponseSchema,
  type UserRequestInput,
  type PatchedUserRequestInput,
  type UserResponse,
} from './user.schema'
