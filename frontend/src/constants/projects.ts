/**
 * Project status and priority configuration constants
 *
 * Centralized source of truth for:
 * - Status/priority values and labels (matching API types)
 * - Badge color mappings
 * - Select options for forms
 *
 * Note: Values match the backend API enums:
 * - StatusEnum: 'draft' | 'active' | 'completed' | 'archived'
 * - PriorityEnum: 1 | 2 | 3 | 4
 */

// Status constants (matching API StatusEnum)
export const PROJECT_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

// Priority constants (matching API PriorityEnum)
export const PROJECT_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
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
  [PROJECT_STATUSES.DRAFT]: {
    value: PROJECT_STATUSES.DRAFT,
    label: 'Draft',
    variant: 'secondary',
  },
  [PROJECT_STATUSES.ACTIVE]: {
    value: PROJECT_STATUSES.ACTIVE,
    label: 'Active',
    variant: 'default',
  },
  [PROJECT_STATUSES.COMPLETED]: {
    value: PROJECT_STATUSES.COMPLETED,
    label: 'Completed',
    variant: 'outline',
  },
  [PROJECT_STATUSES.ARCHIVED]: {
    value: PROJECT_STATUSES.ARCHIVED,
    label: 'Archived',
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
  [PROJECT_PRIORITIES.CRITICAL]: {
    value: PROJECT_PRIORITIES.CRITICAL,
    label: 'Critical',
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
 * Get status configuration by value (with fallback to draft)
 */
export function getStatusConfig(status: ProjectStatus | undefined): StatusConfig {
  return STATUS_CONFIG[status || PROJECT_STATUSES.DRAFT]
}

/**
 * Get priority configuration by value (with fallback to medium)
 */
export function getPriorityConfig(priority: ProjectPriority | undefined): PriorityConfig {
  return PRIORITY_CONFIG[priority || PROJECT_PRIORITIES.MEDIUM]
}
