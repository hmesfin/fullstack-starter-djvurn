/**
 * Project mutation hooks (create, update, delete)
 * Uses TanStack Query for optimistic updates and cache management
 */

import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '@/services/projects.service'
import type {
  Project,
  ProjectRequest,
} from '@/api/types.gen'
import { PROJECTS_QUERY_KEY } from './useProjects'
import { projectQueryKey } from './useProject'

// Type for updating a project (uuid + partial data)
type ProjectUpdate = {
  uuid: string
  data: ProjectRequest
}

/**
 * Hook for creating a new project
 * Automatically invalidates projects list cache after successful creation
 *
 * @example
 * ```tsx
 * const createMutation = useCreateProject()
 *
 * createMutation.mutate({
 *   title: 'New Project',
 *   description: 'Description',
 *   status: 'active',
 *   priority: 'high',
 * })
 * ```
 */
export function useCreateProject(): UseMutationResult<
  Project,
  Error,
  ProjectRequest,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectRequest) => projectsService.create(data),
    onSuccess: () => {
      // Invalidate projects list to refetch with new project
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}

/**
 * Hook for updating an existing project
 * Automatically invalidates project detail and projects list cache after successful update
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateProject()
 *
 * updateMutation.mutate({
 *   id: 1,
 *   title: 'Updated Title',
 *   description: 'Updated Description',
 *   status: 'completed',
 *   priority: 'low',
 * })
 * ```
 */
export function useUpdateProject(): UseMutationResult<
  Project,
  Error,
  ProjectUpdate,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, data }: ProjectUpdate) => projectsService.update(uuid, data),
    onSuccess: (updatedProject) => {
      // Invalidate the specific project detail query
      queryClient.invalidateQueries({
        queryKey: projectQueryKey(updatedProject.uuid),
      })

      // Invalidate projects list to reflect updated project
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}

/**
 * Hook for deleting a project
 * Automatically invalidates projects list cache after successful deletion
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteProject()
 *
 * deleteMutation.mutate(projectId, {
 *   onSuccess: () => {
 *     navigation.goBack()
 *   },
 * })
 * ```
 */
export function useDeleteProject(): UseMutationResult<
  void,
  Error,
  string,
  unknown
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectUuid: string) => projectsService.delete(projectUuid),
    onSuccess: (_data, projectUuid) => {
      // Invalidate the specific project detail query
      queryClient.invalidateQueries({
        queryKey: projectQueryKey(projectUuid),
      })

      // Invalidate projects list to remove deleted project
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
    },
  })
}
