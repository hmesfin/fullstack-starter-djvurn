/**
 * Projects Constants
 * Status and Priority mappings for UI
 */

import type { StatusEnum, PriorityEnum } from '@/api/types.gen'

/**
 * Status label mappings
 */
export const STATUS_LABELS: Record<StatusEnum, string> = {
  draft: 'Draft',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

/**
 * Status color mappings (for badges)
 */
export const STATUS_COLORS: Record<StatusEnum, string> = {
  draft: '#9e9e9e', // Gray
  active: '#2196f3', // Blue
  completed: '#4caf50', // Green
  archived: '#ff9800', // Orange
}

/**
 * Priority label mappings
 */
export const PRIORITY_LABELS: Record<PriorityEnum, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Urgent',
}

/**
 * Priority color mappings (for badges)
 */
export const PRIORITY_COLORS: Record<PriorityEnum, string> = {
  1: '#9e9e9e', // Gray
  2: '#ffeb3b', // Yellow
  3: '#ff9800', // Orange
  4: '#f44336', // Red
}
