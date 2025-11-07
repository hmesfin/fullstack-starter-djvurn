/**
 * TanStack Query client configuration with AsyncStorage persistence
 * Implements offline-first architecture with automatic cache persistence
 */

import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Exponential backoff retry delay function
 * @param attemptIndex - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds, capped at 10 seconds
 */
function exponentialBackoff(attemptIndex: number): number {
  const baseDelay = 1000 // 1 second
  const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), 10000)
  return delay
}

/**
 * Creates a new QueryClient instance with offline-first configuration
 * @returns Configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Garbage collection time: Cache persists for 24 hours
        gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime)

        // Retry failed queries up to 3 times
        retry: 3,

        // Exponential backoff for retries
        retryDelay: exponentialBackoff,

        // Network mode: 'online' allows offline queue to work
        networkMode: 'online',

        // Refetch on window focus (good for mobile when app returns to foreground)
        refetchOnWindowFocus: true,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Refetch on mount if data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry failed mutations up to 3 times
        retry: 3,

        // Exponential backoff for retries
        retryDelay: exponentialBackoff,

        // Network mode: 'online' allows offline queue to work
        networkMode: 'online',
      },
    },
  })
}

/**
 * AsyncStorage persister for TanStack Query
 * Persists query cache to AsyncStorage for offline support
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
  throttleTime: 1000, // Throttle writes to 1 second
})

/**
 * Singleton query client instance
 * Use this instance throughout the app
 */
export const queryClient = createQueryClient()
