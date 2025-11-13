/**
 * Projects Composable
 *
 * Provides project CRUD operations using TanStack Query (vue-query)
 * with optimistic updates, caching, and automatic refetching
 */

import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  apiProjectsList,
  apiProjectsRetrieve,
  apiProjectsCreate,
  apiProjectsUpdate,
  apiProjectsPartialUpdate,
  apiProjectsDestroy,
} from '@/api/sdk.gen'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-client'
import type {
  Project,
  ProjectCreateRequest,
  ProjectRequest,
  PatchedProjectRequest,
  ApiProjectsListData,
} from '@/api/types.gen'
import type { AxiosError } from 'axios'

export const useProjects = (filters?: ApiProjectsListData['query']) => {
  const queryClient = useQueryClient()

  // List projects with filters
  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: async () => {
      const response = await apiProjectsList({
        client: apiClient,
        query: filters,
      })

      // The response has a data property with the actual response
      if (response.data) {
        return response.data
      }
      throw new Error('Failed to fetch projects')
    },
  })

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: ProjectCreateRequest) => {
      const response = await apiProjectsCreate({
        client: apiClient,
        body: projectData,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
    onError: (error: AxiosError) => {
      console.error('Failed to create project:', error)
    },
  })

  // Update project mutation (PATCH - partial update with optimistic updates)
  const updateProjectMutation = useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: PatchedProjectRequest }) => {
      const response = await apiProjectsPartialUpdate({
        client: apiClient,
        path: { uuid },
        body: data,
      })
      return response.data
    },
    // Optimistic update
    onMutate: async ({ uuid, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(uuid) })

      // Snapshot previous value
      const previousProject = queryClient.getQueryData<Project>(
        queryKeys.projects.detail(uuid)
      )

      // Optimistically update
      if (previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(uuid), {
          ...previousProject,
          ...data,
        })
      }

      return { previousProject }
    },
    onError: (_error, { uuid }, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(uuid), context.previousProject)
      }
      console.error('Failed to update project:', _error)
    },
    onSuccess: (data) => {
      if (!data) return

      // Update the specific project in cache with server response
      queryClient.setQueryData(queryKeys.projects.detail(data.uuid), data)

      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
  })

  // Full update mutation (PUT)
  const fullUpdateProjectMutation = useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: ProjectRequest }) => {
      const response = await apiProjectsUpdate({
        client: apiClient,
        path: { uuid },
        body: data,
      })
      return response.data
    },
    onSuccess: (data) => {
      if (!data) return

      // Update the specific project in cache
      queryClient.setQueryData(queryKeys.projects.detail(data.uuid), data)

      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
    onError: (error: AxiosError) => {
      console.error('Failed to update project:', error)
    },
  })

  // Delete project mutation (with optimistic updates)
  const deleteProjectMutation = useMutation({
    mutationFn: async (uuid: string) => {
      await apiProjectsDestroy({
        client: apiClient,
        path: { uuid },
      })
      return uuid
    },
    // Optimistic update
    onMutate: async (uuid) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.lists() })

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<Project[]>(
        queryKeys.projects.lists()
      )

      // Optimistically remove from list
      if (previousProjects) {
        queryClient.setQueryData(
          queryKeys.projects.lists(),
          previousProjects.filter((p) => p.uuid !== uuid)
        )
      }

      return { previousProjects }
    },
    onError: (_error, _uuid, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects.lists(), context.previousProjects)
      }
      console.error('Failed to delete project:', _error)
    },
    onSuccess: (uuid) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(uuid) })

      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
    },
  })

  // Type-safe computed properties
  const projects = computed<Project[]>(() => {
    const response = projectsResponse.value;
    if (!response) {
      return [];
    }
    // Check if it's paginated or not
    if (typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
      return response.results;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  });

  const totalCount = computed(() => {
    if (projectsResponse.value && 'count' in projectsResponse.value) {
      return projectsResponse.value.count || 0;
    }
    return projects.value.length;
  });

  const activeProjects = computed(() =>
    projects.value.filter(p => p.status === 'active')
  );

  const overdueProjects = computed(() =>
    projects.value.filter(p => p.is_overdue === true)
  );

  return {
    // Data
    projects,
    totalCount,
    activeProjects,
    overdueProjects,

    // Status
    isLoading,
    error,

    // Actions (with proper typing)
    createProject: (data: ProjectCreateRequest) => createProjectMutation.mutate(data),
    updateProject: (uuid: string, data: PatchedProjectRequest) =>
      updateProjectMutation.mutate({ uuid, data }),
    fullUpdateProject: (uuid: string, data: ProjectRequest) =>
      fullUpdateProjectMutation.mutate({ uuid, data }),
    deleteProject: (uuid: string) => deleteProjectMutation.mutate(uuid),
    refetch,

    // Mutation states
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isFullUpdating: fullUpdateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,

    // Mutations for advanced usage
    createProjectMutation,
    updateProjectMutation,
    fullUpdateProjectMutation,
    deleteProjectMutation,
  }
}

// Single project composable
export const useProject = (uuid: string) => {
  const {
    data: projectResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.projects.detail(uuid),
    queryFn: async () => {
      if (!uuid) return null

      const response = await apiProjectsRetrieve({
        client: apiClient,
        path: { uuid },
      })

      return response.data
    },
    enabled: !!uuid,
  })

  return {
    project: computed(() => projectResponse.value || null),
    isLoading,
    error,
    refetch,
  }
}
