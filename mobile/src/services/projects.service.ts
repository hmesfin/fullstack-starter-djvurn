import { apiClient } from './api-client';
import { API_ENDPOINTS } from '@/config/api';
import type { ProjectRequest, Project } from '@/api/types.gen';

/**
 * Projects Service
 *
 * Handles all project-related API calls:
 * - List all projects
 * - Get single project
 * - Create project
 * - Update project
 * - Delete project
 */
export const projectsService = {
  /**
   * List all projects
   * @returns Array of projects
   */
  list: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>(API_ENDPOINTS.PROJECTS.LIST);
    return response.data;
  },

  /**
   * Get a single project by ID
   * @param id - Project UUID
   * @returns Project data
   */
  get: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(
      API_ENDPOINTS.PROJECTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Create a new project
   * @param data - Project data
   * @returns Created project
   */
  create: async (data: ProjectRequest): Promise<Project> => {
    const response = await apiClient.post<Project>(
      API_ENDPOINTS.PROJECTS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update an existing project
   * @param id - Project UUID
   * @param data - Updated project data
   * @returns Updated project
   */
  update: async (id: string, data: ProjectRequest): Promise<Project> => {
    const response = await apiClient.put<Project>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete a project
   * @param id - Project UUID
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DELETE(id));
  },
};
