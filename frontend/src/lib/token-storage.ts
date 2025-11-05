/**
 * Token Storage Utilities
 *
 * Manages JWT access and refresh tokens in localStorage with type safety.
 */

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'

export interface TokenPair {
  access: string
  refresh: string
}

/**
 * Store JWT token pair in localStorage
 */
export function setTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

/**
 * Retrieve JWT token pair from localStorage
 */
export function getTokens(): TokenPair | null {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)

  if (!access || !refresh) {
    return null
  }

  return { access, refresh }
}

/**
 * Get only the access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Get only the refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Update only the access token (used after refresh)
 */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * Clear all tokens from storage (logout)
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Check if user has valid tokens in storage
 */
export function hasTokens(): boolean {
  return getTokens() !== null
}
