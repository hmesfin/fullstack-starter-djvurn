import { z } from 'zod'

/**
 * Schema for user update request (full update).
 * Mirrors UserRequest from types.gen.ts
 */
export const userRequestSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
}).strict()

/**
 * Schema for partial user update request.
 * Mirrors PatchedUserRequest from types.gen.ts
 */
export const patchedUserRequestSchema = z.object({
  first_name: z.string().min(1, 'First name cannot be empty').optional(),
  last_name: z.string().min(1, 'Last name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
}).strict()

/**
 * Schema for user response data.
 * Mirrors User from types.gen.ts
 */
export const userResponseSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
}).strict()

/**
 * Type exports for use in components and composables
 */
export type UserRequestInput = z.infer<typeof userRequestSchema>
export type PatchedUserRequestInput = z.infer<typeof patchedUserRequestSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
