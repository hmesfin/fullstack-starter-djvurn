/**
 * Hook for accessing authentication state and actions
 * Provides convenient access to the auth store
 */

import { useAuthStore } from '@/stores/authStore'

/**
 * Hook to access authentication state and actions
 * This is a convenience wrapper around the auth store
 *
 * @example
 * ```tsx
 * function ProfileScreen() {
 *   const { user, isAuthenticated, logout } = useAuth()
 *
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />
 *   }
 *
 *   return (
 *     <View>
 *       <Text>Welcome, {user?.first_name}!</Text>
 *       <Button onPress={logout}>Logout</Button>
 *     </View>
 *   )
 * }
 * ```
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    setTokens,
    setUser,
    logout,
  }
}
