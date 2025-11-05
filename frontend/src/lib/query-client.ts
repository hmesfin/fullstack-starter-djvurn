/**
 * TanStack Query Client Configuration
 *
 * Centralized configuration for vue-query with sensible defaults
 */

import { QueryClient } from '@tanstack/vue-query'

/**
 * Create and configure the global Query Client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: true,

      // Retry failed requests (exponential backoff)
      retry: 1,

      // Cache time: how long unused/inactive data stays in cache
      gcTime: 1000 * 60 * 5, // 5 minutes

      // Stale time: how long data is considered fresh
      staleTime: 1000 * 60, // 1 minute

      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

/**
 * Query Keys Factory
 * Centralized query key management for type safety and consistency
 */
export const queryKeys = {
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (uuid: string) => [...queryKeys.projects.details(), uuid] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    me: () => [...queryKeys.users.all, 'me'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
} as const
