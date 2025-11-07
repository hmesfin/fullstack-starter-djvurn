/**
 * Query hook for fetching a single project by ID
 * Uses TanStack Query for caching and offline support
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { projectsService } from '@/services/projects.service'
import type { Project } from '@/api/types.gen'

/**
 * Query key factory for single project
 * @param projectUuid - Project UUID
 * @returns Query key tuple
 */
export function projectQueryKey(projectUuid: string): readonly ['projects', 'detail', string] {
  return ['projects', 'detail', projectUuid] as const
}

/**
 * Hook to fetch a single project by UUID
 * Automatically caches and refetches on app focus and network reconnect
 *
 * @param projectUuid - UUID of the project to fetch
 *
 * @example
 * ```tsx
 * function ProjectDetailScreen({ route }) {
 *   const projectUuid = route.params.projectUuid
 *   const { data: project, isLoading, error } = useProject(projectUuid)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   if (!project) return <NotFoundMessage />
 *
 *   return <ProjectDetails project={project} />
 * }
 * ```
 */
export function useProject(projectUuid: string): UseQueryResult<Project, Error> {
  return useQuery({
    queryKey: projectQueryKey(projectUuid),
    queryFn: async (): Promise<Project> => {
      const project = await projectsService.get(projectUuid)
      return project
    },
  })
}
