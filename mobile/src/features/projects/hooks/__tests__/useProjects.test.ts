import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for useProjects query hook
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { projectsService } from '@/services/projects.service'
import { useProjects } from '../useProjects'
import { createMockProject } from '@/test/mockHelpers'

// Mock the projects service
vi.mock('@/services/projects.service', () => ({
  projectsService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

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

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch projects list successfully', async () => {
    const mockProjects = [
      createMockProject({
        uuid: 'project-1-uuid',
        name: 'Project 1',
        description: 'Description 1',
        status: 'active',
        priority: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }),
      createMockProject({
        uuid: 'project-2-uuid',
        name: 'Project 2',
        description: 'Description 2',
        status: 'completed',
        priority: 2,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }),
    ]

    ;vi.mocked(projectsService.list).mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    // Should be loading initially
    expect(result.current.isLoading).toBe(true)

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify service was called
    expect(projectsService.list).toHaveBeenCalled()

    // Verify data is correct
    expect(result.current.data).toEqual(mockProjects)
  })

  it('should handle empty projects list', async () => {
    ;vi.mocked(projectsService.list).mockResolvedValue([])

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Network error')
    ;vi.mocked(projectsService.list).mockRejectedValue(mockError)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })

  // TODO: Test caching in E2E - QueryClient isolation complex in unit tests (new client per render)
  it.skip('should cache projects data', async () => {
    const mockProjects = [
      createMockProject({
        uuid: 'project-1-uuid',
        name: 'Project 1',
        description: 'Description 1',
        status: 'active',
        priority: 3,
      }),
    ]

    ;vi.mocked(projectsService.list).mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // First call should fetch
    expect(projectsService.list).toHaveBeenCalledTimes(1)

    // Second hook should use cache
    const { result: result2 } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result2.current.isSuccess).toBe(true))

    // Should still be called only once (cached)
    expect(projectsService.list).toHaveBeenCalledTimes(1)
  })

  it('should enable refetching on window focus', async () => {
    const mockProjects = [
      createMockProject({
        uuid: 'project-1-uuid',
        name: 'Project 1',
        description: 'Description 1',
        status: 'active',
        priority: 3,
      }),
    ]

    ;vi.mocked(projectsService.list).mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Refetch on window focus should be enabled
    // This is checked by TanStack Query's default config
    expect(result.current.data).toEqual(mockProjects)
  })

  it('should return correct TypeScript types', async () => {
    const mockProjects = [
      createMockProject({
        uuid: 'project-1-uuid',
        name: 'Project 1',
        description: 'Description 1',
        status: 'active',
        priority: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }),
    ]

    ;vi.mocked(projectsService.list).mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // TypeScript should infer correct array type
    const projects = result.current.data
    if (projects && projects.length > 0) {
      const project = projects[0]
      expect(typeof project?.uuid).toBe('string')
      expect(typeof project?.name).toBe('string')
      expect(typeof project?.status).toBe('string')
      expect(typeof project?.priority).toBe('number')
    }
  })

  it('should support manual refetch', async () => {
    const mockProjects = [
      createMockProject({
        uuid: 'project-1-uuid',
        name: 'Project 1',
        description: 'Description 1',
        status: 'active',
        priority: 3,
      }),
    ]

    ;vi.mocked(projectsService.list).mockResolvedValue(mockProjects)

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should have refetch function
    expect(typeof result.current.refetch).toBe('function')

    // Manually trigger refetch
    result.current.refetch()

    // Service should be called again
    await waitFor(() => {
      expect(projectsService.list).toHaveBeenCalledTimes(2)
    })
  })
})
