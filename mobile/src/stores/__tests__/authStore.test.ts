import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for authentication store (Zustand + AsyncStorage)
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuthStore } from '../authStore'

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

    it('should persist tokens to AsyncStorage', async () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setTokens({
          access: 'mock-access-token',
          refresh: 'mock-refresh-token',
        })
      })

      // Wait for AsyncStorage to be updated
      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('auth-storage')
        expect(stored).toBeTruthy()
      })
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

      const mockUser = {
        uuid: 'user-uuid',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: '2024-01-01T00:00:00Z',
      }

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should persist user to AsyncStorage', async () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        uuid: 'user-uuid',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: '2024-01-01T00:00:00Z',
      }

      act(() => {
        result.current.setUser(mockUser)
      })

      // Wait for AsyncStorage to be updated
      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('auth-storage')
        expect(stored).toBeTruthy()
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed.state.user).toEqual(mockUser)
        }
      })
    })
  })

  describe('logout Action', () => {
    it('should clear user data', () => {
      const { result } = renderHook(() => useAuthStore())

      const mockUser = {
        uuid: 'user-uuid',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: '2024-01-01T00:00:00Z',
      }

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

    it('should clear persisted data from AsyncStorage', async () => {
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

      // Wait for AsyncStorage to be cleared
      await waitFor(async () => {
        const stored = await AsyncStorage.getItem('auth-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed.state.user).toBeNull()
          expect(parsed.state.accessToken).toBeNull()
          expect(parsed.state.refreshToken).toBeNull()
        }
      })
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

      const mockUser = {
        uuid: 'user-uuid',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: '2024-01-01T00:00:00Z',
      }

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
    it('should rehydrate state from AsyncStorage on initialization', async () => {
      // Set up initial state
      const mockState = {
        state: {
          user: {
            uuid: 'user-uuid',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
          },
          accessToken: 'stored-access-token',
          refreshToken: 'stored-refresh-token',
        },
        version: 0,
      }

      await AsyncStorage.setItem('auth-storage', JSON.stringify(mockState))

      // Create new store instance (simulating app restart)
      const { result } = renderHook(() => useAuthStore())

      // Wait for rehydration
      await waitFor(() => {
        expect(result.current.accessToken).toBe('stored-access-token')
      })

      expect(result.current.user?.email).toBe('test@example.com')
      expect(result.current.refreshToken).toBe('stored-refresh-token')
      expect(result.current.isAuthenticated).toBe(true)
    })
  })
})
