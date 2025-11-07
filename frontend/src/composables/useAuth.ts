/**
 * Authentication Composable
 *
 * Provides authentication methods (register, login, logout, verify OTP)
 * and integrates with the auth store for global state
 */

import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { apiClient } from '@/lib/api-client'
import { setTokens, hasTokens } from '@/lib/token-storage'
import {
  apiAuthRegisterCreate,
  apiAuthVerifyOtpCreate,
  apiAuthResendOtpCreate,
  apiAuthTokenCreate,
  apiUsersMeRetrieve,
} from '@/api/sdk.gen'
import type {
  UserRegistrationRequestWritable,
  OtpVerificationRequest,
  ResendOtpRequest,
  EmailTokenObtainPairRequest,
} from '@/api/types.gen'
import type { AxiosError } from 'axios'

export interface AuthError {
  message: string
  field?: string
  details?: Record<string, string[]>
}

export function useAuth() {
  const authStore = useAuthStore()

  // Local loading states (separate from store loading for granular control)
  const isRegistering = ref(false)
  const isVerifyingOTP = ref(false)
  const isResendingOTP = ref(false)
  const isLoggingIn = ref(false)
  const isFetchingUser = ref(false)

  // Error states
  const registerError = ref<AuthError | null>(null)
  const otpError = ref<AuthError | null>(null)
  const resendOTPError = ref<AuthError | null>(null)
  const loginError = ref<AuthError | null>(null)
  const userError = ref<AuthError | null>(null)

  /**
   * Parse API error response into AuthError format
   */
  function parseError(error: unknown): AuthError {
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
          details[key] = value
          if (!firstError || firstError === 'An error occurred') {
            firstError = value[0] ?? 'An error occurred'
          }
        } else if (typeof value === 'string') {
          details[key] = [value]
          if (!firstError || firstError === 'An error occurred') {
            firstError = value
          }
        }
      }

      return {
        message: firstError,
        details: Object.keys(details).length > 0 ? details : undefined,
      }
    }

    return {
      message: axiosError.message || 'An unexpected error occurred',
    }
  }

  /**
   * Register a new user and send OTP email
   */
  async function register(
    credentials: UserRegistrationRequestWritable
  ): Promise<{ success: boolean; email?: string }> {
    registerError.value = null
    isRegistering.value = true

    try {
      const response = await apiAuthRegisterCreate({
        client: apiClient,
        body: credentials,
      })

      // Check if the SDK returned an error object instead of throwing it
      if (response && 'error' in response && response.error) {
        throw response // Throw the entire response which is an AxiosError
      }

      return { success: true, email: response.data?.email }
    } catch (error) {
      registerError.value = parseError(error)
      return { success: false }
    } finally {
      isRegistering.value = false
    }
  }

  /**
   * Verify email with OTP code
   */
  async function verifyOTP(
    verification: OtpVerificationRequest
  ): Promise<{ success: boolean }> {
    otpError.value = null
    isVerifyingOTP.value = true

    try {
      const response = await apiAuthVerifyOtpCreate({
        client: apiClient,
        body: verification,
      })

      // Check if the SDK returned an error object instead of throwing it
      if (response && 'error' in response && response.error) {
        throw response // Throw the entire response which is an AxiosError
      }

      return { success: true }
    } catch (error) {
      otpError.value = parseError(error)
      return { success: false }
    } finally {
      isVerifyingOTP.value = false
    }
  }

  /**
   * Resend OTP code to email
   */
  async function resendOTP(
    request: ResendOtpRequest
  ): Promise<{ success: boolean; message?: string }> {
    resendOTPError.value = null
    isResendingOTP.value = true

    try {
      const response = await apiAuthResendOtpCreate({
        client: apiClient,
        body: request,
      })

      // Check if the SDK returned an error object instead of throwing it
      if (response && 'error' in response && response.error) {
        throw response // Throw the entire response which is an AxiosError
      }

      return {
        success: true,
        message: (response.data as any)?.message || 'Verification code sent to your email.'
      }
    } catch (error) {
      resendOTPError.value = parseError(error)
      return { success: false }
    } finally {
      isResendingOTP.value = false
    }
  }

  /**
   * Login with email and password, store JWT tokens
   */
  async function login(
    credentials: EmailTokenObtainPairRequest
  ): Promise<{ success: boolean }> {
    loginError.value = null
    isLoggingIn.value = true
    authStore.setLoading(true)

    try {
      const response = await apiAuthTokenCreate({
        client: apiClient,
        body: credentials,
      })

      // Check if the SDK returned an error object instead of throwing it
      if (response && 'error' in response && response.error) {
        throw response // Throw the entire response which is an AxiosError
      }

      const { data } = response

      if (!data || !('access' in data) || !('refresh' in data)) {
        throw new Error('No tokens received from server')
      }

      // Store tokens
      setTokens({
        access: data.access as string,
        refresh: data.refresh as string,
      })

      authStore.isAuthenticated = true

      // Fetch user data
      await fetchCurrentUser()

      return { success: true }
    } catch (error) {
      loginError.value = parseError(error)
      authStore.clearUser()
      return { success: false }
    } finally {
      isLoggingIn.value = false
      authStore.setLoading(false)
    }
  }

  /**
   * Fetch current authenticated user data
   */
  async function fetchCurrentUser(): Promise<{ success: boolean }> {
    userError.value = null
    isFetchingUser.value = true

    try {
      const { data } = await apiUsersMeRetrieve({
        client: apiClient,
      })

      if (!data) {
        throw new Error('No user data received')
      }

      authStore.setUser(data)
      return { success: true }
    } catch (error) {
      userError.value = parseError(error)
      return { success: false }
    } finally {
      isFetchingUser.value = false
    }
  }

  /**
   * Logout user and clear tokens
   */
  function logout(): void {
    authStore.logout()
  }

  /**
   * Initialize auth on app load (check if tokens exist and fetch user)
   */
  async function initAuth(): Promise<void> {
    if (!hasTokens()) {
      authStore.clearUser()
      return
    }

    authStore.setLoading(true)

    try {
      await fetchCurrentUser()
    } catch (error) {
      // If fetching user fails, clear tokens
      authStore.logout()
    } finally {
      authStore.setLoading(false)
    }
  }

  return {
    // State from store
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    userName: authStore.userName,
    userInitials: authStore.userInitials,

    // Loading states
    isRegistering,
    isVerifyingOTP,
    isResendingOTP,
    isLoggingIn,
    isFetchingUser,
    isLoading: authStore.isLoading,

    // Error states
    registerError,
    otpError,
    resendOTPError,
    loginError,
    userError,

    // Methods
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    fetchCurrentUser,
    initAuth,
  }
}
