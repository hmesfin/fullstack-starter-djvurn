/**
 * API Client Configuration
 *
 * Configures axios client with JWT authentication, automatic token refresh,
 * and request/response interceptors for the Django backend.
 */

import { createClient, createConfig } from '@/api/client'
import type { ClientOptions } from '@/api/types.gen'
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './token-storage'

// Backend API base URL
const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:8000'

/**
 * Flag to prevent multiple simultaneous token refresh requests
 */
let isRefreshing = false

/**
 * Queue of requests waiting for token refresh to complete
 */
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

/**
 * Process all queued requests after token refresh
 */
function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })

  failedQueue = []
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = (await response.json()) as { access: string }
    const newAccessToken = data.access
    setAccessToken(newAccessToken)

    return newAccessToken
  } catch (error) {
    // Refresh failed - clear all tokens
    clearTokens()
    throw error
  }
}

// Configure the client
const config = createConfig<ClientOptions>({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create configured client
export const apiClient = createClient(config)

/**
 * Request interceptor: Add JWT token to all requests
 */
apiClient.instance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const token = getAccessToken()

    // Add Authorization header if token exists and not already set
    if (token && request.headers && !request.headers.Authorization) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }

    return request
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor: Handle 401 errors and refresh tokens automatically
 */
apiClient.instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid refreshing token for auth endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/api/auth/')
      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`)
            }
            return apiClient.instance.request(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      // Mark as retrying
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh the token
        const newAccessToken = await refreshAccessToken()

        // Process queued requests
        processQueue(null, newAccessToken)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
        }
        return apiClient.instance.request(originalRequest)
      } catch (refreshError) {
        // Refresh failed - reject all queued requests
        processQueue(refreshError as Error, null)
        clearTokens()

        // Redirect to login - use window.location to avoid circular dependency with router
        // The router will handle this redirect properly
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // For all other errors, reject
    return Promise.reject(error)
  }
)

/**
 * Export for testing or manual token refresh
 */
export { refreshAccessToken }
