/**
 * Query hook for fetching current authenticated user
 * Uses TanStack Query for caching and background refetching
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { getAuthToken } from '@/services/api-client'
import type { User } from '@/api/types.gen'

/**
 * Query key for current user
 */
export const CURRENT_USER_QUERY_KEY = ['auth', 'currentUser'] as const

/**
 * Hook to fetch current authenticated user
 * Only fetches when auth token exists
 * Automatically refetches on app focus and network reconnect
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { data: user, isLoading, error } = useCurrentUser()
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   if (!user) return <LoginPrompt />
 *
 *   return <UserProfile user={user} />
 * }
 * ```
 */
export function useCurrentUser(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async (): Promise<User> => {
      // Check for token before fetching
      const token = await getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const user = await authService.getMe()
      return user
    },
    // Retry only once on failure
    retry: 1,
  })
}
