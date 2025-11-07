import { projectsService } from '../projects.service';
import { apiClient } from '../api-client';
import type { ProjectRequest, Project, StatusEnum, PriorityEnum } from '@/api/types.gen';

// Mock the API client
jest.mock('../api-client');

describe('projectsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch list of projects', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            uuid: 'uuid-1',
            title: 'Project 1',
            description: 'Description 1',
            status: 'in_progress',
            priority: 'high',
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: '2',
            uuid: 'uuid-2',
            title: 'Project 2',
            description: 'Description 2',
            status: 'completed',
            priority: 'medium',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
      };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await projectsService.list();

      expect(apiClient.get).toHaveBeenCalledWith('/api/projects/');
      expect(result).toEqual(mockResponse.data);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no projects exist', async () => {
      const mockResponse = { data: [] };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await projectsService.list();

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should fetch a single project by ID', async () => {
      const mockProject = {
        id: '1',
        uuid: 'uuid-1',
        title: 'Project 1',
        description: 'Description 1',
        status: 'in_progress',
        priority: 'high',
        created_at: '2024-01-01T00:00:00Z',
      };

      const mockResponse = { data: mockProject };

      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await projectsService.get('uuid-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/projects/uuid-1/');
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
      };

      (apiClient.get as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(projectsService.get('non-existent')).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const mockRequest: ProjectRequest = {
        name: 'New Project',
        description: 'New Description',
        status: 'draft' as StatusEnum,
        priority: 2 as PriorityEnum,
      };

      const mockResponse = {
        data: {
          id: '3',
          uuid: 'uuid-3',
          ...mockRequest,
          created_at: '2024-01-03T00:00:00Z',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await projectsService.create(mockRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/projects/', mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on validation failure', async () => {
      const mockRequest: ProjectRequest = {
        name: '', // Invalid: empty name
        description: 'Description',
        status: 'draft' as StatusEnum,
        priority: 1 as PriorityEnum,
      };

      const mockError = {
        response: {
          status: 400,
          data: { title: ['This field may not be blank.'] },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(projectsService.create(mockRequest)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    it('should update an existing project', async () => {
      const projectId = 'uuid-1';
      const mockRequest: ProjectRequest = {
        name: 'Updated Project',
        description: 'Updated Description',
        status: 'completed' as StatusEnum,
        priority: 4 as PriorityEnum,
      };

      const mockResponse = {
        data: {
          id: '1',
          uuid: projectId,
          ...mockRequest,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-04T00:00:00Z',
        },
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await projectsService.update(projectId, mockRequest);

      expect(apiClient.put).toHaveBeenCalledWith(`/api/projects/${projectId}/`, mockRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when updating non-existent project', async () => {
      const mockRequest: ProjectRequest = {
        name: 'Updated',
        description: 'Description',
        status: 'draft' as StatusEnum,
        priority: 1 as PriorityEnum,
      };

      const mockError = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
      };

      (apiClient.put as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(projectsService.update('non-existent', mockRequest)).rejects.toEqual(
        mockError
      );
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      const projectId = 'uuid-1';

      (apiClient.delete as jest.Mock).mockResolvedValueOnce({ status: 204 });

      await projectsService.delete(projectId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/api/projects/${projectId}/`);
    });

    it('should throw error when deleting non-existent project', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
      };

      (apiClient.delete as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(projectsService.delete('non-existent')).rejects.toEqual(mockError);
    });
  });
});
