/**
 * Query hook for fetching projects list
 * Uses TanStack Query for caching, background refetching, and offline support
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { projectsService } from '@/services/projects.service'
import type { Project } from '@/api/types.gen'

/**
 * Query key for projects list
 */
export const PROJECTS_QUERY_KEY = ['projects', 'list'] as const

/**
 * Hook to fetch all projects
 * Automatically caches and refetches on app focus and network reconnect
 *
 * @example
 * ```tsx
 * function ProjectsListScreen() {
 *   const { data: projects, isLoading, error, refetch } = useProjects()
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <FlatList
 *       data={projects}
 *       renderItem={({ item }) => <ProjectCard project={item} />}
 *       refreshing={isLoading}
 *       onRefresh={refetch}
 *     />
 *   )
 * }
 * ```
 */
export function useProjects(): UseQueryResult<Project[], Error> {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async (): Promise<Project[]> => {
      const projects = await projectsService.list()
      return projects
    },
  })
}
