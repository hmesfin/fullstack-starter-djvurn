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
    it('has all expected status values', () => {
      expect(PROJECT_STATUSES).toEqual({
        PLANNING: 'planning',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        ON_HOLD: 'on_hold',
      })
    })
  })

  describe('PROJECT_PRIORITIES', () => {
    it('has all expected priority values', () => {
      expect(PROJECT_PRIORITIES).toEqual({
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high',
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

    it('has correct structure for planning status', () => {
      expect(STATUS_CONFIG.planning).toEqual({
        value: 'planning',
        label: 'Planning',
        variant: 'secondary',
      })
    })

    it('has correct structure for in_progress status', () => {
      expect(STATUS_CONFIG.in_progress).toEqual({
        value: 'in_progress',
        label: 'In Progress',
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

    it('has correct structure for on_hold status', () => {
      expect(STATUS_CONFIG.on_hold).toEqual({
        value: 'on_hold',
        label: 'On Hold',
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

    it('has correct structure for low priority', () => {
      expect(PRIORITY_CONFIG.low).toEqual({
        value: 'low',
        label: 'Low',
        variant: 'secondary',
      })
    })

    it('has correct structure for medium priority', () => {
      expect(PRIORITY_CONFIG.medium).toEqual({
        value: 'medium',
        label: 'Medium',
        variant: 'default',
      })
    })

    it('has correct structure for high priority', () => {
      expect(PRIORITY_CONFIG.high).toEqual({
        value: 'high',
        label: 'High',
        variant: 'destructive',
      })
    })
  })

  describe('STATUS_OPTIONS', () => {
    it('is an array of all status configs', () => {
      expect(STATUS_OPTIONS).toBeInstanceOf(Array)
      expect(STATUS_OPTIONS).toHaveLength(4)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.planning)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.in_progress)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.completed)
      expect(STATUS_OPTIONS).toContainEqual(STATUS_CONFIG.on_hold)
    })
  })

  describe('PRIORITY_OPTIONS', () => {
    it('is an array of all priority configs', () => {
      expect(PRIORITY_OPTIONS).toBeInstanceOf(Array)
      expect(PRIORITY_OPTIONS).toHaveLength(3)
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG.low)
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG.medium)
      expect(PRIORITY_OPTIONS).toContainEqual(PRIORITY_CONFIG.high)
    })
  })

  describe('getStatusConfig', () => {
    it('returns correct config for each status', () => {
      expect(getStatusConfig('planning' as ProjectStatus)).toEqual(STATUS_CONFIG.planning)
      expect(getStatusConfig('in_progress' as ProjectStatus)).toEqual(STATUS_CONFIG.in_progress)
      expect(getStatusConfig('completed' as ProjectStatus)).toEqual(STATUS_CONFIG.completed)
      expect(getStatusConfig('on_hold' as ProjectStatus)).toEqual(STATUS_CONFIG.on_hold)
    })
  })

  describe('getPriorityConfig', () => {
    it('returns correct config for each priority', () => {
      expect(getPriorityConfig('low' as ProjectPriority)).toEqual(PRIORITY_CONFIG.low)
      expect(getPriorityConfig('medium' as ProjectPriority)).toEqual(PRIORITY_CONFIG.medium)
      expect(getPriorityConfig('high' as ProjectPriority)).toEqual(PRIORITY_CONFIG.high)
    })
  })

  describe('type safety', () => {
    it('ensures ProjectStatus type is correct', () => {
      const status: ProjectStatus = 'planning'
      expect(status).toBe('planning')
    })

    it('ensures ProjectPriority type is correct', () => {
      const priority: ProjectPriority = 'low'
      expect(priority).toBe('low')
    })
  })
})
