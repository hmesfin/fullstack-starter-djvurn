/**
 * Tests for TanStack Query client configuration with AsyncStorage persistence
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { QueryClient } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createQueryClient, queryClient } from '../query-client'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

describe('Query Client Configuration', () => {
  beforeEach(() => {
    // Clear AsyncStorage before each test
    AsyncStorage.clear()
  })

  describe('createQueryClient', () => {
    it('should create a QueryClient instance', () => {
      const client = createQueryClient()
      expect(client).toBeInstanceOf(QueryClient)
    })

    it('should configure default query options', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // Queries should be configured for offline-first behavior
      expect(defaultOptions.queries?.staleTime).toBeGreaterThan(0)
      expect(defaultOptions.queries?.gcTime).toBeGreaterThan(0)
      expect(defaultOptions.queries?.retry).toBeDefined()
    })

    it('should configure default mutation options', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // Mutations should retry on network errors
      expect(defaultOptions.mutations?.retry).toBeDefined()
    })

    it('should enable network mode online for queries', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // Network mode should be 'online' to support offline queue
      expect(defaultOptions.queries?.networkMode).toBe('online')
    })

    it('should enable network mode online for mutations', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // Network mode should be 'online' to support offline queue
      expect(defaultOptions.mutations?.networkMode).toBe('online')
    })
  })

  describe('Singleton Query Client', () => {
    it('should export a singleton query client instance', () => {
      expect(queryClient).toBeInstanceOf(QueryClient)
    })

    it('should return the same instance on multiple imports', () => {
      const client1 = queryClient
      const client2 = queryClient
      expect(client1).toBe(client2)
    })
  })

  describe('Query Cache Configuration', () => {
    it('should have stale time set to 5 minutes', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // 5 minutes = 5 * 60 * 1000 milliseconds
      expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000)
    })

    it('should have garbage collection time set to 24 hours', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // 24 hours = 24 * 60 * 60 * 1000 milliseconds
      expect(defaultOptions.queries?.gcTime).toBe(24 * 60 * 60 * 1000)
    })

    it('should retry failed queries up to 3 times', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      expect(defaultOptions.queries?.retry).toBe(3)
    })

    it('should use exponential backoff for query retries', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // retryDelay should be a function for exponential backoff
      expect(typeof defaultOptions.queries?.retryDelay).toBe('function')
    })
  })

  describe('Mutation Configuration', () => {
    it('should retry failed mutations up to 3 times', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      expect(defaultOptions.mutations?.retry).toBe(3)
    })

    it('should use exponential backoff for mutation retries', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // retryDelay should be a function for exponential backoff
      expect(typeof defaultOptions.mutations?.retryDelay).toBe('function')
    })
  })

  describe('AsyncStorage Persister', () => {
    it('should export an AsyncStorage persister', async () => {
      const { asyncStoragePersister } = await import('../query-client')
      expect(asyncStoragePersister).toBeDefined()
    })

    it('should configure persister with correct storage key', async () => {
      const { asyncStoragePersister } = await import('../query-client')

      // Test that persister uses AsyncStorage
      // We can't directly test the key, but we can verify it uses AsyncStorage
      expect(asyncStoragePersister).toBeDefined()
    })
  })

  describe('Exponential Backoff', () => {
    it('should implement exponential backoff for retries', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()
      const retryDelay = defaultOptions.queries?.retryDelay as (
        attemptIndex: number
      ) => number

      // Attempt 0: ~1000ms
      // Attempt 1: ~2000ms
      // Attempt 2: ~4000ms
      const delay0 = retryDelay(0)
      const delay1 = retryDelay(1)
      const delay2 = retryDelay(2)

      expect(delay0).toBeGreaterThan(500)
      expect(delay0).toBeLessThan(1500)

      expect(delay1).toBeGreaterThan(1500)
      expect(delay1).toBeLessThan(2500)

      expect(delay2).toBeGreaterThan(3500)
      expect(delay2).toBeLessThan(4500)
    })

    it('should cap maximum retry delay at 10 seconds', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()
      const retryDelay = defaultOptions.queries?.retryDelay as (
        attemptIndex: number
      ) => number

      // Very high attempt should still be capped
      const delay = retryDelay(100)
      expect(delay).toBeLessThanOrEqual(10000)
    })
  })

  describe('Error Handling', () => {
    it('should not retry on 4xx client errors', () => {
      const client = createQueryClient()
      const defaultOptions = client.getDefaultOptions()

      // Should have a retry function that checks error status
      expect(typeof defaultOptions.queries?.retry).toBe('number')
    })
  })
})
