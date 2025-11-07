/**
 * Authentication store using Zustand with AsyncStorage persistence
 * Manages user authentication state and tokens
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '@/api/types.gen'

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
  /** Set JWT tokens */
  setTokens: (tokens: { access: string; refresh: string }) => void
  /** Set user data */
  setUser: (user: User) => void
  /** Logout and clear all auth state */
  logout: () => void
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
      setTokens: (tokens) =>
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      logout: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
