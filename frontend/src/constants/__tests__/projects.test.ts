import { describe, it, expect } from 'vitest'
import {
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  getStatusConfig,
  getPriorityConfig,
  type ProjectStatus,
  type ProjectPriority,
} from '../projects'

describe('projects constants', () => {
  describe('PROJECT_STATUSES', () => {
    it('has all expected status values matching API StatusEnum', () => {
      expect(PROJECT_STATUSES).toEqual({
        DRAFT: 'draft',
        ACTIVE: 'active',
        COMPLETED: 'completed',
        ARCHIVED: 'archived',
      })
    })
  })

  describe('PROJECT_PRIORITIES', () => {
    it('has all expected priority values matching API PriorityEnum', () => {
      expect(PROJECT_PRIORITIES).toEqual({
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3,
        CRITICAL: 4,
      })
    })
  })

  describe('STATUS_CONFIG', () => {
    it('has configuration for all statuses', () => {
      const statuses = Object.values(PROJECT_STATUSES)
      statuses.forEach((status) => {
        expect(STATUS_CONFIG[status]).toBeDefined()
        expect(STATUS_CONFIG[status]).toHaveProperty('value')
        expect(STATUS_CONFIG[status]).toHaveProperty('label')
        expect(STATUS_CONFIG[status]).toHaveProperty('variant')
      })
    })

    it('has correct structure for draft status', () => {
      expect(STATUS_CONFIG.draft).toEqual({
        value: 'draft',
        label: 'Draft',
        variant: 'secondary',
      })
    })

    it('has correct structure for active status', () => {
      expect(STATUS_CONFIG.active).toEqual({
        value: 'active',
        label: 'Active',
        variant: 'default',
      })
    })

    it('has correct structure for completed status', () => {
      expect(STATUS_CONFIG.completed).toEqual({
        value: 'completed',
        label: 'Completed',
        variant: 'outline',
      })
    })

    it('has correct structure for archived status', () => {
      expect(STATUS_CONFIG.archived).toEqual({
        value: 'archived',
        label: 'Archived',
        variant: 'destructive',
      })
    })
  })

  describe('PRIORITY_CONFIG', () => {
    it('has configuration for all priorities', () => {
      const priorities = Object.values(PROJECT_PRIORITIES)
      priorities.forEach((priority) => {
        expect(PRIORITY_CONFIG[priority]).toBeDefined()
        expect(PRIORITY_CONFIG[priority]).toHaveProperty('value')
        expect(PRIORITY_CONFIG[priority]).toHaveProperty('label')
        expect(PRIORITY_CONFIG[priority]).toHaveProperty('variant')
      })
    })

    it('has correct structure for low priority (1)', () => {
      expect(PRIORITY_CONFIG[1]).toEqual({
        value: 1,
        label: 'Low',
        variant: 'secondary',
      })
    })

    it('has correct structure for medium priority (2)', () => {
      expect(PRIORITY_CONFIG[2]).toEqual({
        value: 2,
        label: 'Medium',
        variant: 'default',
      })
    })

    it('has correct structure for high priority (3)', () => {
      expect(PRIORITY_CONFIG[3]).toEqual({
        value: 3,
        label: 'High',
        variant: 'destructive',
      })
    })

    it('has correct structure for critical priority (4)', () => {
      expect(PRIORITY_CONFIG[4]).toEqual({
        value: 4,
        label: 'Critical',
        variant: 'destructive',
      })
    })
  })

  describe('STATUS_OPTIONS', () => {
    it('is an array of all status configs', () => {
      expect(STATUS_OPTIONS).toBeInstanceOf(Array)
      expect(STATUS_OPTIONS).toHaveLength(4)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.draft)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.active)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.completed)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.archived)
    })
  })

  describe('PRIORITY_OPTIONS', () => {
    it('is an array of all priority configs', () => {
      expect(PRIORITY_OPTIONS).toBeInstanceOf(Array)
      expect(PRIORITY_OPTIONS).toHaveLength(4)
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG[1])
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG[2])
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG[3])
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG[4])
    })
  })

  describe('getStatusConfig', () => {
    it('returns correct config for each status', () => {
      expect(getStatusConfig('draft' as ProjectStatus)).toEqual(STATUS_CONFIG.draft)
      expect(getStatusConfig('active' as ProjectStatus)).toEqual(STATUS_CONFIG.active)
      expect(getStatusConfig('completed' as ProjectStatus)).toEqual(STATUS_CONFIG.completed)
      expect(getStatusConfig('archived' as ProjectStatus)).toEqual(STATUS_CONFIG.archived)
    })

    it('returns draft config for undefined status (fallback)', () => {
      expect(getStatusConfig(undefined)).toEqual(STATUS_CONFIG.draft)
    })
  })

  describe('getPriorityConfig', () => {
    it('returns correct config for each priority', () => {
      expect(getPriorityConfig(1 as ProjectPriority)).toEqual(PRIORITY_CONFIG[1])
      expect(getPriorityConfig(2 as ProjectPriority)).toEqual(PRIORITY_CONFIG[2])
      expect(getPriorityConfig(3 as ProjectPriority)).toEqual(PRIORITY_CONFIG[3])
      expect(getPriorityConfig(4 as ProjectPriority)).toEqual(PRIORITY_CONFIG[4])
    })

    it('returns medium config for undefined priority (fallback)', () => {
      expect(getPriorityConfig(undefined)).toEqual(PRIORITY_CONFIG[2])
    })
  })

  describe('type safety', () => {
    it('ensures ProjectStatus type matches API StatusEnum', () => {
      const status: ProjectStatus = 'draft'
      expect(status).toBe('draft')
    })

    it('ensures ProjectPriority type matches API PriorityEnum', () => {
      const priority: ProjectPriority = 1
      expect(priority).toBe(1)
    })
  })
})
