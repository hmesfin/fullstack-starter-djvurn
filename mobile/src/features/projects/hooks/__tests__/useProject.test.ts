/**
 * Tests for useProject query hook (single project)
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import * as projectsService from '@/services/projects.service'
import { useProject } from '../useProject'

// Mock the projects service
jest.mock('@/services/projects.service')

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

describe('useProject', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch single project by ID successfully', async () => {
    const mockProject = {
      id: 1,
      uuid: 'project-1-uuid',
      title: 'Project 1',
      description: 'Description 1',
      status: 'active',
      priority: 'high',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    ;(projectsService.getProject as jest.Mock).mockResolvedValue(mockProject)

    const { result } = renderHook(() => useProject(1), {
      wrapper: createWrapper(),
    })

    // Should be loading initially
    expect(result.current.isLoading).toBe(true)

    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify service was called with correct ID
    expect(projectsService.getProject).toHaveBeenCalledWith(1)

    // Verify data is correct
    expect(result.current.data).toEqual(mockProject)
  })

  it('should handle project not found error', async () => {
    const mockError = new Error('Project not found')
    ;(projectsService.getProject as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useProject(999), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })

  it('should cache project data by ID', async () => {
    const mockProject = {
      id: 1,
      uuid: 'project-1-uuid',
      title: 'Project 1',
      description: 'Description 1',
      status: 'active',
      priority: 'high',
    }

    ;(projectsService.getProject as jest.Mock).mockResolvedValue(mockProject)

    const { result } = renderHook(() => useProject(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // First call should fetch
    expect(projectsService.getProject).toHaveBeenCalledTimes(1)

    // Second hook for same ID should use cache
    const { result: result2 } = renderHook(() => useProject(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result2.current.isSuccess).toBe(true))

    // Should still be called only once (cached)
    expect(projectsService.getProject).toHaveBeenCalledTimes(1)
  })

  it('should fetch different projects separately', async () => {
    const mockProject1 = {
      id: 1,
      uuid: 'project-1-uuid',
      title: 'Project 1',
      description: 'Description 1',
      status: 'active',
      priority: 'high',
    }

    const mockProject2 = {
      id: 2,
      uuid: 'project-2-uuid',
      title: 'Project 2',
      description: 'Description 2',
      status: 'completed',
      priority: 'low',
    }

    ;(projectsService.getProject as jest.Mock)
      .mockResolvedValueOnce(mockProject1)
      .mockResolvedValueOnce(mockProject2)

    // Fetch project 1
    const { result: result1 } = renderHook(() => useProject(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result1.current.isSuccess).toBe(true))

    // Fetch project 2
    const { result: result2 } = renderHook(() => useProject(2), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result2.current.isSuccess).toBe(true))

    // Should call service twice with different IDs
    expect(projectsService.getProject).toHaveBeenCalledTimes(2)
    expect(projectsService.getProject).toHaveBeenNthCalledWith(1, 1)
    expect(projectsService.getProject).toHaveBeenNthCalledWith(2, 2)

    // Data should be different
    expect(result1.current.data).toEqual(mockProject1)
    expect(result2.current.data).toEqual(mockProject2)
  })

  it('should return correct TypeScript types', async () => {
    const mockProject = {
      id: 1,
      uuid: 'project-1-uuid',
      title: 'Project 1',
      description: 'Description 1',
      status: 'active',
      priority: 'high',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    ;(projectsService.getProject as jest.Mock).mockResolvedValue(mockProject)

    const { result } = renderHook(() => useProject(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // TypeScript should infer correct project type
    const project = result.current.data
    if (project) {
      expect(typeof project.id).toBe('number')
      expect(typeof project.uuid).toBe('string')
      expect(typeof project.title).toBe('string')
      expect(typeof project.status).toBe('string')
      expect(typeof project.priority).toBe('string')
    }
  })

  it('should support manual refetch', async () => {
    const mockProject = {
      id: 1,
      uuid: 'project-1-uuid',
      title: 'Project 1',
      description: 'Description 1',
      status: 'active',
      priority: 'high',
    }

    ;(projectsService.getProject as jest.Mock).mockResolvedValue(mockProject)

    const { result } = renderHook(() => useProject(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should have refetch function
    expect(typeof result.current.refetch).toBe('function')

    // Manually trigger refetch
    result.current.refetch()

    // Service should be called again
    await waitFor(() => {
      expect(projectsService.getProject).toHaveBeenCalledTimes(2)
    })
  })
})
