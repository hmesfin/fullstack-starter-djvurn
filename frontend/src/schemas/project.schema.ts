/**
 * Project Zod Validation Schemas
 *
 * Runtime validation for project-related API requests
 */

import { z } from 'zod'

/**
 * Status enum matching Django model
 */
export const statusEnum = z.enum(['draft', 'active', 'completed', 'archived'], {
  errorMap: () => ({ message: 'Invalid status' }),
})

/**
 * Priority enum matching Django model
 * 1 = Low, 2 = Medium, 3 = High, 4 = Critical
 */
export const priorityEnum = z.union(
  [z.literal(1), z.literal(2), z.literal(3), z.literal(4)],
  {
    errorMap: () => ({ message: 'Priority must be 1 (Low), 2 (Medium), 3 (High), or 4 (Critical)' }),
  }
)

/**
 * Date validation helper (YYYY-MM-DD format or ISO string)
 */
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, 'Date must be in YYYY-MM-DD format')
  .nullable()
  .optional()

/**
 * Schema for creating a new project
 */
export const projectCreateSchema = z
  .object({
    name: z.string().min(1, 'Project name is required').max(255, 'Name is too long'),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    start_date: dateStringSchema,
    due_date: dateStringSchema,
  })
  .strict()
  .refine(
    (data) => {
      // Ensure due_date is after start_date if both are provided
      if (data.start_date && data.due_date) {
        return new Date(data.due_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: 'Due date must be after start date',
      path: ['due_date'],
    }
  )

/**
 * Schema for updating a project (full update - PUT)
 */
export const projectUpdateSchema = z
  .object({
    name: z.string().min(1, 'Project name is required').max(255, 'Name is too long'),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    start_date: dateStringSchema,
    due_date: dateStringSchema,
  })
  .strict()
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return new Date(data.due_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: 'Due date must be after start date',
      path: ['due_date'],
    }
  )

/**
 * Schema for partial project updates (PATCH)
 */
export const projectPatchSchema = z
  .object({
    name: z.string().min(1, 'Project name is required').max(255, 'Name is too long').optional(),
    description: z.string().optional(),
    status: statusEnum.optional(),
    priority: priorityEnum.optional(),
    start_date: dateStringSchema,
    due_date: dateStringSchema,
  })
  .strict()
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return new Date(data.due_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: 'Due date must be after start date',
      path: ['due_date'],
    }
  )

/**
 * Schema for project list filters
 */
export const projectFiltersSchema = z
  .object({
    status: statusEnum.optional(),
    search: z.string().optional(),
    ordering: z.string().optional(),
  })
  .strict()

// Export types
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
export type ProjectPatchInput = z.infer<typeof projectPatchSchema>
export type ProjectFiltersInput = z.infer<typeof projectFiltersSchema>
export type StatusEnum = z.infer<typeof statusEnum>
export type PriorityEnum = z.infer<typeof priorityEnum>

// Legacy export for backward compatibility
export const ProjectSchema = projectCreateSchema
export type ProjectFormData = ProjectCreateInput
