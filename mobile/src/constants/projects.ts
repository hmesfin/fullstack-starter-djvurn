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
 * Status text color mappings (for badge text - ensures proper contrast)
 */
export const STATUS_TEXT_COLORS: Record<StatusEnum, string> = {
  draft: '#ffffff', // White on gray
  active: '#ffffff', // White on blue
  completed: '#ffffff', // White on green
  archived: '#ffffff', // White on orange
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
  2: '#fdd835', // Darker yellow for better contrast
  3: '#ff9800', // Orange
  4: '#f44336', // Red
}

/**
 * Priority text color mappings (for badge text - ensures proper contrast)
 */
export const PRIORITY_TEXT_COLORS: Record<PriorityEnum, string> = {
  1: '#ffffff', // White on gray
  2: '#000000', // Black on yellow (WCAG compliant)
  3: '#ffffff', // White on orange
  4: '#ffffff', // White on red
}
