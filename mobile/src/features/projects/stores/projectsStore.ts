/**
 * ProjectsStore - Zustand Store for Projects (GREEN phase - TDD)
 * Local state management for projects list + filters
 */

import { create } from 'zustand'
import type { Project, StatusEnum, PriorityEnum } from '@/api/types.gen'

/**
 * Filters interface for projects
 */
export interface ProjectsFilters {
  status: StatusEnum | null
  priority: PriorityEnum | null
  search: string
}

/**
 * Projects store state interface
 */
export interface ProjectsState {
  // State
  projects: Project[]
  filters: ProjectsFilters

  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (uuid: string, updates: Partial<Project>) => void
  deleteProject: (uuid: string) => void
  setFilters: (filters: Partial<ProjectsFilters>) => void
  clearFilters: () => void
  reset: () => void

  // Computed/Selectors
  filteredProjects: Project[]
}

/**
 * Initial state
 */
const initialState = {
  projects: [],
  filters: {
    status: null,
    priority: null,
    search: '',
  },
}

/**
 * Apply filters to projects list
 */
function applyFilters(projects: Project[], filters: ProjectsFilters): Project[] {
  let filtered = projects

  // Filter by status
  if (filters.status !== null) {
    filtered = filtered.filter((project) => project.status === filters.status)
  }

  // Filter by priority
  if (filters.priority !== null) {
    filtered = filtered.filter((project) => project.priority === filters.priority)
  }

  // Filter by search (name or description, case-insensitive)
  if (filters.search.trim() !== '') {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter((project) => {
      const nameMatch = project.name.toLowerCase().includes(searchLower)
      const descMatch = project.description?.toLowerCase().includes(searchLower) ?? false
      return nameMatch || descMatch
    })
  }

  return filtered
}

/**
 * Projects store
 */
export const useProjectsStore = create<ProjectsState>((set, get) => ({
  ...initialState,
  filteredProjects: [],

  /**
   * Set projects list (replaces existing)
   */
  setProjects: (projects: Project[]): void => {
    set((state) => ({
      projects,
      filteredProjects: applyFilters(projects, state.filters),
    }))
  },

  /**
   * Add a new project (prepends to beginning - most recent first)
   */
  addProject: (project: Project): void => {
    set((state) => {
      const newProjects = [project, ...state.projects]
      return {
        projects: newProjects,
        filteredProjects: applyFilters(newProjects, state.filters),
      }
    })
  },

  /**
   * Update existing project by uuid
   */
  updateProject: (uuid: string, updates: Partial<Project>): void => {
    set((state) => {
      const newProjects = state.projects.map((project) =>
        project.uuid === uuid ? { ...project, ...updates } : project
      )
      return {
        projects: newProjects,
        filteredProjects: applyFilters(newProjects, state.filters),
      }
    })
  },

  /**
   * Delete project by uuid
   */
  deleteProject: (uuid: string): void => {
    set((state) => {
      const newProjects = state.projects.filter((project) => project.uuid !== uuid)
      return {
        projects: newProjects,
        filteredProjects: applyFilters(newProjects, state.filters),
      }
    })
  },

  /**
   * Set filters (partial update)
   */
  setFilters: (filters: Partial<ProjectsFilters>): void => {
    set((state) => {
      const newFilters = { ...state.filters, ...filters }
      return {
        filters: newFilters,
        filteredProjects: applyFilters(state.projects, newFilters),
      }
    })
  },

  /**
   * Clear all filters
   */
  clearFilters: (): void => {
    set((state) => ({
      filters: { ...initialState.filters },
      filteredProjects: applyFilters(state.projects, initialState.filters),
    }))
  },

  /**
   * Reset store to initial state
   */
  reset: (): void => {
    set({
      ...initialState,
      filteredProjects: [],
    })
  },
}))
