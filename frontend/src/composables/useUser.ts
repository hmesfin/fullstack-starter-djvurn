/**
 * User Profile Composable
 *
 * Provides user profile management methods (update profile, change password)
 * and integrates with TanStack Query for efficient data fetching and caching
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { apiClient } from '@/lib/api-client'
import { apiUsersMePartialUpdate, apiUsersChangePasswordCreate } from '@/api/sdk.gen'
import { patchedUserRequestSchema, passwordChangeRequestSchema } from '@/schemas'
import type { AxiosError } from 'axios'

export interface UserError {
  message: string
  field?: string
  details?: Record<string, string[]>
}

/**
 * Parse API error response into UserError format
 */
function parseError(error: unknown): UserError {
  const axiosError = error as AxiosError<{
    detail?: string
    [key: string]: string | string[] | undefined
  }>

  if (axiosError.response?.data) {
    const data = axiosError.response.data

    // Handle detail message
    if (typeof data.detail === 'string') {
      return { message: data.detail }
    }

    // Handle field-level errors
    const details: Record<string, string[]> = {}
    let firstError = 'An error occurred'

    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        details[key] = value as string[]
        if (!firstError || firstError === 'An error occurred') {
          firstError = value[0] || firstError
        }
      }
    }

    return {
      message: firstError,
      details: Object.keys(details).length > 0 ? details : undefined,
    }
  }

  return { message: 'An unexpected error occurred' }
}

export function useUser() {
  const queryClient = useQueryClient()

  /**
   * Update user profile mutation (with avatar support)
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (data: {
      first_name?: string
      last_name?: string
      email?: string
      avatar?: File
    }) => {
      // Validate data with Zod
      const validated = patchedUserRequestSchema.parse(data)

      // Create FormData for multipart upload (supports avatar)
      const formData = new FormData()
      if (validated.first_name) formData.append('first_name', validated.first_name)
      if (validated.last_name) formData.append('last_name', validated.last_name)
      if (validated.email) formData.append('email', validated.email)
      if (validated.avatar) formData.append('avatar', validated.avatar)

      const response = await apiUsersMePartialUpdate({
        client: apiClient,
        body: formData as unknown as Record<string, unknown>,
      })

      // Check for error property (SDK may return errors instead of throwing)
      if (response && 'error' in response && response.error) {
        throw response
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate user query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
    },
  })

  /**
   * Change password mutation
   */
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { old_password: string; new_password: string }) => {
      // Validate data with Zod
      const validated = passwordChangeRequestSchema.parse(data)

      const response = await apiUsersChangePasswordCreate({
        client: apiClient,
        body: validated,
      })

      // Check for error property (SDK may return errors instead of throwing)
      if (response && 'error' in response && response.error) {
        throw response
      }

      return response.data
    },
  })

  return {
    // Profile update
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    profileUpdateError: updateProfileMutation.error
      ? parseError(updateProfileMutation.error)
      : null,
    resetProfileUpdateError: () => updateProfileMutation.reset(),

    // Password change
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    passwordChangeError: changePasswordMutation.error
      ? parseError(changePasswordMutation.error)
      : null,
    resetPasswordChangeError: () => changePasswordMutation.reset(),
  }
}
