import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for authentication store (Zustand + AsyncStorage)
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import { createMockUser } from '@/test/mockHelpers'

describe('Auth Store', () => {
  beforeEach(async () => {
    // Clear AsyncStorage and reset store before each test
    await AsyncStorage.clear()
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.logout()
    })
  })

  describe('Initial State', () => {
    it('should have no user initially', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.user).toBeNull()
    })

    it('should have no access token initially', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.accessToken).toBeNull()
    })

    it('should have no refresh token initially', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.refreshToken).toBeNull()
    })

    it('should not be authenticated initially', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('setTokens Action', () => {
    it('should set access and refresh tokens', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      expect(result.current.accessToken).toBe('mock-access-token')
      expect(result.current.refreshToken).toBe('mock-refresh-token')
    })

    it('should set tokens in state (persistence mocked in tests)', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      // Test in-memory state (persist middleware is mocked as no-op)
      expect(result.current.accessToken).toBe('mock-access-token')
      expect(result.current.refreshToken).toBe('mock-refresh-token')
    })

    it('should mark user as authenticated when tokens are set', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('setUser Action', () => {
    it('should set user data', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = createMockUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      })

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should set user in state (persistence mocked in tests)', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = createMockUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      })

      act(() => {
        result.current.setUser(mockUser)
      })

      // Test in-memory state (persist middleware is mocked as no-op)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  describe('logout Action', () => {
    it('should clear user data', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = createMockUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      })

      act(() => {
        result.current.setUser(mockUser)
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe('mock-access-token')

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
    })

    it('should mark user as not authenticated', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      expect(result.current.isAuthenticated).toBe(true)

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should clear state after logout (persistence mocked in tests)', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      act(() => {
        result.current.logout()
      })

      // Test in-memory state (persist middleware is mocked as no-op)
      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
    })
  })

  describe('isAuthenticated Computed', () => {
    it('should return false when no access token', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should return true when access token exists', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should return false after logout even if user exists', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = createMockUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      })

      act(() => {
        result.current.setUser(mockUser)
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      act(() => {
        result.current.logout()
      })

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Persistence', () => {
    it('should maintain state in memory (rehydration mocked in tests)', () => {
      // Persistence is handled by Zustand persist middleware
      // In tests, persist is mocked as no-op for synchronous testing
      // This test verifies store state management works correctly
      const { result } = renderHook(() => useAuthStore())

      const mockUser = createMockUser({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      })

      act(() => {
        result.current.setUser(mockUser)
        result.current.setTokens({
          access: 'stored-access-token',
          refresh: 'stored-refresh-token',
        })
      })

      // Verify state is set correctly
      expect(result.current.accessToken).toBe('stored-access-token')
      expect(result.current.user?.email).toBe('test@example.com')
      expect(result.current.refreshToken).toBe('stored-refresh-token')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })
})
