import { z } from 'zod'

/**
 * Schema for password change request.
 * Validates old_password and new_password with minimum length requirement.
 */
export const passwordChangeRequestSchema = z.object({
  old_password: z.string().min(1, 'Old password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
}).strict()

/**
 * Type export for use in components and composables
 */
export type PasswordChangeRequestInput = z.infer<typeof passwordChangeRequestSchema>
