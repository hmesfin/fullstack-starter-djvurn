/**
 * Token Storage Tests
 *
 * Tests for JWT token storage utilities in localStorage
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  setTokens,
  getTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
  hasTokens,
} from '../token-storage'

describe('Token Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('setTokens', () => {
    it('should store both access and refresh tokens', () => {
      const tokens = {
        access: 'access-token-123',
        refresh: 'refresh-token-456',
      }

      setTokens(tokens)

      expect(localStorage.getItem('auth_access_token')).toBe('access-token-123')
      expect(localStorage.getItem('auth_refresh_token')).toBe('refresh-token-456')
    })
  })

  describe('getTokens', () => {
    it('should return token pair when both tokens exist', () => {
      localStorage.setItem('auth_access_token', 'access-token-123')
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      const tokens = getTokens()

      expect(tokens).toEqual({
        access: 'access-token-123',
        refresh: 'refresh-token-456',
      })
    })

    it('should return null when access token is missing', () => {
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      const tokens = getTokens()

      expect(tokens).toBeNull()
    })

    it('should return null when refresh token is missing', () => {
      localStorage.setItem('auth_access_token', 'access-token-123')

      const tokens = getTokens()

      expect(tokens).toBeNull()
    })

    it('should return null when both tokens are missing', () => {
      const tokens = getTokens()

      expect(tokens).toBeNull()
    })
  })

  describe('getAccessToken', () => {
    it('should return access token when it exists', () => {
      localStorage.setItem('auth_access_token', 'access-token-123')

      const token = getAccessToken()

      expect(token).toBe('access-token-123')
    })

    it('should return null when access token does not exist', () => {
      const token = getAccessToken()

      expect(token).toBeNull()
    })
  })

  describe('getRefreshToken', () => {
    it('should return refresh token when it exists', () => {
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      const token = getRefreshToken()

      expect(token).toBe('refresh-token-456')
    })

    it('should return null when refresh token does not exist', () => {
      const token = getRefreshToken()

      expect(token).toBeNull()
    })
  })

  describe('setAccessToken', () => {
    it('should update only the access token', () => {
      localStorage.setItem('auth_access_token', 'old-access-token')
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      setAccessToken('new-access-token')

      expect(localStorage.getItem('auth_access_token')).toBe('new-access-token')
      expect(localStorage.getItem('auth_refresh_token')).toBe('refresh-token-456')
    })
  })

  describe('clearTokens', () => {
    it('should remove both tokens from storage', () => {
      localStorage.setItem('auth_access_token', 'access-token-123')
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      clearTokens()

      expect(localStorage.getItem('auth_access_token')).toBeNull()
      expect(localStorage.getItem('auth_refresh_token')).toBeNull()
    })

    it('should not throw error when tokens do not exist', () => {
      expect(() => clearTokens()).not.toThrow()
    })
  })

  describe('hasTokens', () => {
    it('should return true when both tokens exist', () => {
      localStorage.setItem('auth_access_token', 'access-token-123')
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      expect(hasTokens()).toBe(true)
    })

    it('should return false when access token is missing', () => {
      localStorage.setItem('auth_refresh_token', 'refresh-token-456')

      expect(hasTokens()).toBe(false)
    })

    it('should return false when refresh token is missing', () => {
      localStorage.setItem('auth_access_token', 'access-token-123')

      expect(hasTokens()).toBe(false)
    })

    it('should return false when both tokens are missing', () => {
      expect(hasTokens()).toBe(false)
    })
  })
})
