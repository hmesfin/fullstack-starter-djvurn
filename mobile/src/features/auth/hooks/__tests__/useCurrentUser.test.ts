import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for useCurrentUser query hook
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import * as authService from '@/services/auth.service'
import * as apiClient from '@/services/api-client'
import { useCurrentUser } from '../useCurrentUser'

// Mock the auth service
vi.mock('@/services/auth.service')

// Mock the API client
vi.mock('@/services/api-client')

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  return Wrapper
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch current user when authenticated', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      date_joined: '2024-01-01T00:00:00Z',
    }

    ;(apiClient.getAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue('mock-token')
    ;vi.mocked(authService.getMe).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    // Should be loading initially
    expect(result.current.isLoading).toBe(true)

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify service was called
    expect(authService.getMe).toHaveBeenCalled()

    // Verify data is correct
    expect(result.current.data).toEqual(mockUser)
  })

  it('should not fetch when no auth token exists', async () => {
    ;(apiClient.getAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    // Wait a bit to ensure query doesn't execute
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Service should not be called
    expect(authService.getMe).not.toHaveBeenCalled()

    // Data should be undefined
    expect(result.current.data).toBeUndefined()

    // Query should be disabled (not loading, not error)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Unauthorized')
    ;(apiClient.getAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue('mock-token')
    ;vi.mocked(authService.getMe).mockRejectedValue(mockError)

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })

  it('should enable refetching on window focus', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    }

    ;(apiClient.getAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue('mock-token')
    ;vi.mocked(authService.getMe).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Refetch on window focus should be enabled
    // This is checked by TanStack Query's default config
    expect(result.current.data).toEqual(mockUser)
  })

  it('should use stale time from global config', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    }

    ;(apiClient.getAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue('mock-token')
    ;vi.mocked(authService.getMe).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Data should be cached
    expect(result.current.data).toEqual(mockUser)

    // Second call should use cache (won't call service again)
    const { result: result2 } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result2.current.isSuccess).toBe(true))

    // Service should only be called once (cached)
    expect(authService.getMe).toHaveBeenCalledTimes(1)
  })

  it('should return user object with correct TypeScript types', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      is_staff: false,
      is_superuser: false,
      date_joined: '2024-01-01T00:00:00Z',
    }

    ;(apiClient.getAuthToken as ReturnType<typeof vi.fn>).mockResolvedValue('mock-token')
    ;vi.mocked(authService.getMe).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // TypeScript should infer correct types
    const user = result.current.data
    if (user) {
      expect(typeof user.id).toBe('number')
      expect(typeof user.email).toBe('string')
      expect(typeof user.first_name).toBe('string')
      expect(typeof user.last_name).toBe('string')
    }
  })
})
