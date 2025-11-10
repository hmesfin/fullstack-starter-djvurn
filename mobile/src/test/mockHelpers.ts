/**
 * Test Mock Helpers - Properly typed mocks for testing
 * Ensures test type safety and consistency
 */

import type { User } from '@/api/types.gen'
import type { Project } from '@/api/types.gen'

/**
 * Create a mock User object with proper types
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    url: 'http://api.example.com/users/1/',
    ...overrides,
  }
}

/**
 * Create a mock Project object with proper types
 */
export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    uuid: 'test-uuid-123',
    name: 'Test Project',
    description: 'Test description',
    owner: 'user-uuid',
    owner_email: 'owner@example.com',
    status: 'active',
    priority: 2,
    start_date: '2025-01-01',
    due_date: '2025-12-31',
    is_overdue: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock AuthStore object with proper types
 */
export interface MockAuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setTokens: (tokens: { access: string; refresh: string }) => Promise<void>
  setUser: (user: User) => void
  logout: () => Promise<void>
}

export function createMockAuthStore(overrides?: Partial<MockAuthStore>): MockAuthStore {
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    setTokens: async () => {},
    setUser: () => {},
    logout: async () => {},
    ...overrides,
  }
}
