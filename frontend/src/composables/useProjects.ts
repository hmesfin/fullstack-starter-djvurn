// frontend/src/composables/useProjects.ts
import { computed } from 'vue';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  projectsList,
  projectsRetrieve,
  projectsCreate,
  projectsPartialUpdate,
  projectsDestroy
} from '@/api/sdk.gen';
import { apiClient } from '@/lib/api-client';
import type {
  Project,
  ProjectCreateRequest,
  PatchedProjectRequest,
  ProjectsListData
} from '@/api/types.gen';

export const useProjects = (filters?: ProjectsListData['query']) => {
  const queryClient = useQueryClient();

  // List projects with filters
  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const response = await projectsList({
        client: apiClient,
        query: filters,
      });

      // The response has a data property with the actual response
      if (response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch projects');
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: ProjectCreateRequest) => {
      const response = await projectsCreate({
        client: apiClient,
        body: projectData,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: PatchedProjectRequest }) => {
      const response = await projectsPartialUpdate({
        client: apiClient,
        path: { uuid },
        body: data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const response = await projectsDestroy({
        client: apiClient,
        path: { uuid },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

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
    deleteProject: (uuid: string) => deleteProjectMutation.mutate(uuid),
    refetch,

    // Mutation states
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};

// Single project composable
export const useProject = (uuid: string) => {
  const {
    data: projectResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project', uuid],
    queryFn: async () => {
      if (!uuid) return null;

      const response = await projectsRetrieve({
        client: apiClient,
        path: { uuid },
      });

      return response.data;
    },
    enabled: !!uuid,
  });

  return {
    project: computed(() => projectResponse.value || null),
    isLoading,
    error,
  };
};
