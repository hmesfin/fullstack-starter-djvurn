/**
 * Authentication store using Zustand with AsyncStorage persistence
 * Manages user authentication state and tokens
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '@/api/types.gen'
import { setAuthToken, clearAuthToken } from '@/services/api-client'
import { queryClient } from '@/services/query-client'
import { CURRENT_USER_QUERY_KEY } from '@/features/auth/hooks/useCurrentUser'

/**
 * Authentication state interface
 */
interface AuthState {
  /** Current authenticated user */
  user: User | null
  /** JWT access token */
  accessToken: string | null
  /** JWT refresh token */
  refreshToken: string | null
  /** Computed: whether user is authenticated */
  isAuthenticated: boolean
}

/**
 * Authentication actions interface
 */
interface AuthActions {
  /** Set JWT tokens (also updates API client) */
  setTokens: (tokens: { access: string; refresh: string }) => Promise<void>
  /** Set user data */
  setUser: (user: User) => void
  /** Logout and clear all auth state (also clears API client) */
  logout: () => Promise<void>
}

/**
 * Authentication store type
 */
type AuthStore = AuthState & AuthActions

/**
 * Initial state
 */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
}

/**
 * Authentication store hook
 * Persists to AsyncStorage automatically
 *
 * @example
 * ```tsx
 * function LoginScreen() {
 *   const { setTokens, setUser, isAuthenticated } = useAuthStore()
 *
 *   const handleLogin = async (credentials) => {
 *     const response = await authService.login(credentials)
 *     setTokens({ access: response.access, refresh: response.refresh })
 *     setUser(response.user)
 *   }
 *
 *   if (isAuthenticated) {
 *     return <Navigate to="/home" />
 *   }
 *
 *   return <LoginForm onSubmit={handleLogin} />
 * }
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      ...initialState,

      // Actions
      setTokens: async (tokens) => {
        // Update Zustand store
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        })
        // Update API client (sets Authorization header + stores in AsyncStorage)
        await setAuthToken(tokens.access)
        // Invalidate current user query to force fresh fetch with new token
        queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      },

      setUser: (user) =>
        set({
          user,
        }),

      logout: async () => {
        // Clear Zustand store
        set({
          ...initialState,
        })
        // Clear API client (removes Authorization header + clears AsyncStorage)
        await clearAuthToken()
        // Clear TanStack Query cache for current user
        queryClient.removeQueries({ queryKey: CURRENT_USER_QUERY_KEY })
        // Clear all project queries as well (user-specific data)
        queryClient.removeQueries({ queryKey: ['projects'] })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
