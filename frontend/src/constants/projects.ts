/**
 * Project status and priority configuration constants
 *
 * Centralized source of truth for:
 * - Status/priority values and labels
 * - Badge color mappings
 * - Select options for forms
 */

export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
} as const

export const PROJECT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES]
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[keyof typeof PROJECT_PRIORITIES]

export interface StatusConfig {
  value: ProjectStatus
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface PriorityConfig {
  value: ProjectPriority
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

/**
 * Status configuration for labels and badge variants
 */
export const STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
  [PROJECT_STATUSES.PLANNING]: {
    value: PROJECT_STATUSES.PLANNING,
    label: 'Planning',
    variant: 'secondary',
  },
  [PROJECT_STATUSES.IN_PROGRESS]: {
    value: PROJECT_STATUSES.IN_PROGRESS,
    label: 'In Progress',
    variant: 'default',
  },
  [PROJECT_STATUSES.COMPLETED]: {
    value: PROJECT_STATUSES.COMPLETED,
    label: 'Completed',
    variant: 'outline',
  },
  [PROJECT_STATUSES.ON_HOLD]: {
    value: PROJECT_STATUSES.ON_HOLD,
    label: 'On Hold',
    variant: 'destructive',
  },
}

/**
 * Priority configuration for labels and badge variants
 */
export const PRIORITY_CONFIG: Record<ProjectPriority, PriorityConfig> = {
  [PROJECT_PRIORITIES.LOW]: {
    value: PROJECT_PRIORITIES.LOW,
    label: 'Low',
    variant: 'secondary',
  },
  [PROJECT_PRIORITIES.MEDIUM]: {
    value: PROJECT_PRIORITIES.MEDIUM,
    label: 'Medium',
    variant: 'default',
  },
  [PROJECT_PRIORITIES.HIGH]: {
    value: PROJECT_PRIORITIES.HIGH,
    label: 'High',
    variant: 'destructive',
  },
}

/**
 * Array of status options for select inputs
 */
export const STATUS_OPTIONS: StatusConfig[] = Object.values(STATUS_CONFIG)

/**
 * Array of priority options for select inputs
 */
export const PRIORITY_OPTIONS: PriorityConfig[] = Object.values(PRIORITY_CONFIG)

/**
 * Get status configuration by value
 */
export function getStatusConfig(status: ProjectStatus): StatusConfig {
  return STATUS_CONFIG[status]
}

/**
 * Get priority configuration by value
 */
export function getPriorityConfig(priority: ProjectPriority): PriorityConfig {
  return PRIORITY_CONFIG[priority]
}
