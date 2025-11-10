/**
 * ProjectsStore Tests (RED phase - TDD)
 * Write tests FIRST, implementation SECOND
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProjectsStore } from '../projectsStore'
import type { Project } from '@/api/types.gen'

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}))

// Mock Zustand persist middleware (synchronous for tests)
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware')
  return {
    ...actual,
    persist: vi.fn((config: any) => config),
  }
})

describe('ProjectsStore - Initial State', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should have empty projects array initially', () => {
    const { result } = renderHook(() => useProjectsStore())
    expect(result.current.projects).toEqual([])
  })

  it('should have null status filter initially', () => {
    const { result } = renderHook(() => useProjectsStore())
    expect(result.current.filters.status).toBeNull()
  })

  it('should have null priority filter initially', () => {
    const { result } = renderHook(() => useProjectsStore())
    expect(result.current.filters.priority).toBeNull()
  })

  it('should have empty search string initially', () => {
    const { result } = renderHook(() => useProjectsStore())
    expect(result.current.filters.search).toBe('')
  })
})

describe('ProjectsStore - setProjects Action', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should set projects array', () => {
    const { result } = renderHook(() => useProjectsStore())

    const mockProjects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Test Project 1',
        description: 'Description 1',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: '2025-01-01',
        due_date: '2025-12-31',
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Test Project 2',
        description: 'Description 2',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(mockProjects)
    })

    expect(result.current.projects).toEqual(mockProjects)
    expect(result.current.projects).toHaveLength(2)
  })

  it('should replace existing projects', () => {
    const { result } = renderHook(() => useProjectsStore())

    const firstBatch: Project[] = [
      {
        uuid: 'project-1',
        name: 'Old Project',
        description: 'Old description',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(firstBatch)
    })
    expect(result.current.projects).toHaveLength(1)

    const secondBatch: Project[] = [
      {
        uuid: 'project-2',
        name: 'New Project',
        description: 'New description',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(secondBatch)
    })

    expect(result.current.projects).toEqual(secondBatch)
    expect(result.current.projects).toHaveLength(1)
    expect(result.current.projects[0]?.uuid).toBe('project-2')
  })
})

describe('ProjectsStore - addProject Action', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should add a new project to empty list', () => {
    const { result } = renderHook(() => useProjectsStore())

    const newProject: Project = {
      uuid: 'project-1',
      name: 'New Project',
      description: 'Description',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'draft',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.addProject(newProject)
    })

    expect(result.current.projects).toHaveLength(1)
    expect(result.current.projects[0]).toEqual(newProject)
  })

  it('should add project to existing list', () => {
    const { result } = renderHook(() => useProjectsStore())

    const existingProject: Project = {
      uuid: 'project-1',
      name: 'Existing Project',
      description: 'Existing',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([existingProject])
    })

    const newProject: Project = {
      uuid: 'project-2',
      name: 'New Project',
      description: 'New',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'draft',
      priority: 1,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    }

    act(() => {
      result.current.addProject(newProject)
    })

    expect(result.current.projects).toHaveLength(2)
    expect(result.current.projects[0]).toEqual(newProject) // New project added at beginning
    expect(result.current.projects[1]).toEqual(existingProject)
  })

  it('should add project at beginning of list (most recent first)', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project1: Project = {
      uuid: 'project-1',
      name: 'Project 1',
      description: '',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    const project2: Project = {
      uuid: 'project-2',
      name: 'Project 2',
      description: '',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'draft',
      priority: 1,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    }

    act(() => {
      result.current.addProject(project1)
      result.current.addProject(project2)
    })

    expect(result.current.projects[0]?.uuid).toBe('project-2') // Most recent first
    expect(result.current.projects[1]?.uuid).toBe('project-1')
  })
})

describe('ProjectsStore - updateProject Action', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should update existing project by uuid', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project: Project = {
      uuid: 'project-1',
      name: 'Original Name',
      description: 'Original Description',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'draft',
      priority: 1,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([project])
    })

    act(() => {
      result.current.updateProject('project-1', {
        name: 'Updated Name',
        description: 'Updated Description',
        status: 'active',
      })
    })

    expect(result.current.projects[0]?.name).toBe('Updated Name')
    expect(result.current.projects[0]?.description).toBe('Updated Description')
    expect(result.current.projects[0]?.status).toBe('active')
    expect(result.current.projects[0]?.uuid).toBe('project-1') // UUID unchanged
    expect(result.current.projects[0]?.priority).toBe(1) // Other fields unchanged
  })

  it('should not affect other projects', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Project 1',
        description: 'Description 1',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Project 2',
        description: 'Description 2',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
    })

    act(() => {
      result.current.updateProject('project-1', { name: 'Updated Project 1' })
    })

    expect(result.current.projects[0]?.name).toBe('Updated Project 1')
    expect(result.current.projects[1]?.name).toBe('Project 2') // Unchanged
  })

  it('should do nothing if project uuid not found', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project: Project = {
      uuid: 'project-1',
      name: 'Project 1',
      description: 'Description 1',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([project])
    })

    act(() => {
      result.current.updateProject('nonexistent-uuid', { name: 'Updated Name' })
    })

    expect(result.current.projects[0]?.name).toBe('Project 1') // Unchanged
    expect(result.current.projects).toHaveLength(1)
  })
})

describe('ProjectsStore - deleteProject Action', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should remove project by uuid', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project: Project = {
      uuid: 'project-1',
      name: 'Project to Delete',
      description: 'Will be deleted',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([project])
    })
    expect(result.current.projects).toHaveLength(1)

    act(() => {
      result.current.deleteProject('project-1')
    })

    expect(result.current.projects).toHaveLength(0)
  })

  it('should only remove specified project', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Project 1',
        description: 'Keep this',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Project 2',
        description: 'Delete this',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
      {
        uuid: 'project-3',
        name: 'Project 3',
        description: 'Keep this too',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'completed',
        priority: 3,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
    })

    act(() => {
      result.current.deleteProject('project-2')
    })

    expect(result.current.projects).toHaveLength(2)
    expect(result.current.projects.find((p) => p.uuid === 'project-1')).toBeDefined()
    expect(result.current.projects.find((p) => p.uuid === 'project-2')).toBeUndefined()
    expect(result.current.projects.find((p) => p.uuid === 'project-3')).toBeDefined()
  })

  it('should do nothing if project uuid not found', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project: Project = {
      uuid: 'project-1',
      name: 'Project 1',
      description: 'Description',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([project])
    })

    act(() => {
      result.current.deleteProject('nonexistent-uuid')
    })

    expect(result.current.projects).toHaveLength(1)
    expect(result.current.projects[0]).toEqual(project)
  })
})

describe('ProjectsStore - setFilters Action', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should set status filter', () => {
    const { result } = renderHook(() => useProjectsStore())

    act(() => {
      result.current.setFilters({ status: 'active' })
    })

    expect(result.current.filters.status).toBe('active')
  })

  it('should set priority filter', () => {
    const { result } = renderHook(() => useProjectsStore())

    act(() => {
      result.current.setFilters({ priority: 3 })
    })

    expect(result.current.filters.priority).toBe(3)
  })

  it('should set search string', () => {
    const { result } = renderHook(() => useProjectsStore())

    act(() => {
      result.current.setFilters({ search: 'test query' })
    })

    expect(result.current.filters.search).toBe('test query')
  })

  it('should update only specified filter fields', () => {
    const { result } = renderHook(() => useProjectsStore())

    act(() => {
      result.current.setFilters({ status: 'draft', priority: 2 })
    })
    expect(result.current.filters.status).toBe('draft')
    expect(result.current.filters.priority).toBe(2)

    act(() => {
      result.current.setFilters({ search: 'test' })
    })

    expect(result.current.filters.status).toBe('draft') // Unchanged
    expect(result.current.filters.priority).toBe(2) // Unchanged
    expect(result.current.filters.search).toBe('test')
  })
})

describe('ProjectsStore - clearFilters Action', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should reset all filters to default', () => {
    const { result } = renderHook(() => useProjectsStore())

    act(() => {
      result.current.setFilters({
        status: 'active',
        priority: 3,
        search: 'test query',
      })
    })
    expect(result.current.filters.status).toBe('active')
    expect(result.current.filters.priority).toBe(3)
    expect(result.current.filters.search).toBe('test query')

    act(() => {
      result.current.clearFilters()
    })

    expect(result.current.filters.status).toBeNull()
    expect(result.current.filters.priority).toBeNull()
    expect(result.current.filters.search).toBe('')
  })
})

describe('ProjectsStore - filteredProjects Selector', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useProjectsStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should return all projects when no filters applied', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Project 1',
        description: 'Description 1',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Project 2',
        description: 'Description 2',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
    })

    expect(result.current.filteredProjects).toEqual(projects)
    expect(result.current.filteredProjects).toHaveLength(2)
  })

  it('should filter by status', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Active Project',
        description: '',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Draft Project',
        description: '',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
      {
        uuid: 'project-3',
        name: 'Completed Project',
        description: '',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'completed',
        priority: 3,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
      result.current.setFilters({ status: 'active' })
    })

    expect(result.current.filteredProjects).toHaveLength(1)
    expect(result.current.filteredProjects[0]?.status).toBe('active')
  })

  it('should filter by priority', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Low Priority',
        description: '',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 1,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'High Priority',
        description: '',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 3,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
      result.current.setFilters({ priority: 3 })
    })

    expect(result.current.filteredProjects).toHaveLength(1)
    expect(result.current.filteredProjects[0]?.priority).toBe(3)
  })

  it('should filter by search query (name)', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Mobile App Development',
        description: 'Building iOS app',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Backend API',
        description: 'REST API development',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
      result.current.setFilters({ search: 'mobile' })
    })

    expect(result.current.filteredProjects).toHaveLength(1)
    expect(result.current.filteredProjects[0]?.name).toContain('Mobile')
  })

  it('should filter by search query (description)', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Project 1',
        description: 'Building iOS app',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Project 2',
        description: 'REST API development',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
      result.current.setFilters({ search: 'API' })
    })

    expect(result.current.filteredProjects).toHaveLength(1)
    expect(result.current.filteredProjects[0]?.description).toContain('API')
  })

  it('should apply multiple filters together (AND logic)', () => {
    const { result } = renderHook(() => useProjectsStore())

    const projects: Project[] = [
      {
        uuid: 'project-1',
        name: 'Mobile App',
        description: 'iOS development',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 3,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        uuid: 'project-2',
        name: 'Mobile Game',
        description: 'Game development',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'draft',
        priority: 3,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
      },
      {
        uuid: 'project-3',
        name: 'Backend API',
        description: 'REST API',
        owner: 'user-1',
        owner_email: 'user1@example.com',
        status: 'active',
        priority: 2,
        start_date: null,
        due_date: null,
        is_overdue: false,
        created_at: '2025-01-03T00:00:00Z',
        updated_at: '2025-01-03T00:00:00Z',
      },
    ]

    act(() => {
      result.current.setProjects(projects)
      result.current.setFilters({
        status: 'active',
        priority: 3,
        search: 'mobile',
      })
    })

    // Should match: status=active AND priority=3 AND name/desc contains "mobile"
    expect(result.current.filteredProjects).toHaveLength(1)
    expect(result.current.filteredProjects[0]?.uuid).toBe('project-1')
  })

  it('should be case-insensitive for search', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project: Project = {
      uuid: 'project-1',
      name: 'Mobile App Development',
      description: 'Building iOS app',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([project])
      result.current.setFilters({ search: 'MOBILE' })
    })

    expect(result.current.filteredProjects).toHaveLength(1)
  })
})

describe('ProjectsStore - reset Action', () => {
  it('should reset store to initial state', () => {
    const { result } = renderHook(() => useProjectsStore())

    const project: Project = {
      uuid: 'project-1',
      name: 'Test Project',
      description: 'Test',
      owner: 'user-1',
      owner_email: 'user1@example.com',
      status: 'active',
      priority: 2,
      start_date: null,
      due_date: null,
      is_overdue: false,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    }

    act(() => {
      result.current.setProjects([project])
      result.current.setFilters({ status: 'active', priority: 3, search: 'test' })
    })

    expect(result.current.projects).toHaveLength(1)
    expect(result.current.filters.status).toBe('active')

    act(() => {
      result.current.reset()
    })

    expect(result.current.projects).toEqual([])
    expect(result.current.filters.status).toBeNull()
    expect(result.current.filters.priority).toBeNull()
    expect(result.current.filters.search).toBe('')
  })
})
