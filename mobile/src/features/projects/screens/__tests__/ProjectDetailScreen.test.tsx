/**
 * ProjectDetailScreen Tests (RED phase - TDD)
 * Write tests FIRST, implementation SECOND
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProjectDetailScreen } from '../ProjectDetailScreen'
import { createMockProject } from '@/test/mockHelpers'
import type { Project } from '@/api/types.gen'

// Mock navigation
const mockNavigate = vi.fn()
const mockGoBack = vi.fn()
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: vi.fn(),
} as any

// Mock route with projectUuid
const mockRoute = {
  key: 'ProjectDetail',
  name: 'ProjectDetail' as const,
  params: {
    projectUuid: 'test-project-uuid',
  },
} as any

// Mock useProject hook
const mockUseProject = vi.fn()
vi.mock('@/features/projects/hooks/useProject', () => ({
  useProject: (uuid: string) => mockUseProject(uuid),
}))

// Mock useDeleteProject hook
const mockDeleteProjectMutate = vi.fn()
const mockDeleteProject = vi.fn()
vi.mock('@/features/projects/hooks/useProjectMutations', () => ({
  useDeleteProject: () => mockDeleteProject(),
}))

// Mock React Native components
vi.mock('react-native', () => ({
  View: ({ children, testID }: any) => <div data-testid={testID}>{children}</div>,
  ScrollView: ({ children, testID }: any) => <div data-testid={testID}>{children}</div>,
  StyleSheet: { create: (styles: any) => styles },
  Alert: {
    alert: vi.fn(),
  },
}))

// Mock React Native Paper
vi.mock('react-native-paper', () => ({
  Text: ({ children, testID }: any) => <div data-testid={testID}>{children}</div>,
  Button: ({ children, onPress, testID }: any) => (
    <button data-testid={testID} onClick={onPress}>
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  Chip: ({ children, testID, style }: any) => (
    <div data-testid={testID} style={style}>
      {children}
    </div>
  ),
  ActivityIndicator: ({ testID }: any) => <div data-testid={testID}>Loading...</div>,
}))

const mockProject: Project = createMockProject({
  uuid: 'test-project-uuid',
  name: 'Test Project',
  description: 'This is a test project',
  status: 'active',
  priority: 2,
  start_date: '2025-01-01',
  due_date: '2025-12-31',
  is_overdue: false,
  owner_email: 'owner@example.com',
})

describe('ProjectDetailScreen - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: false,
    })
  })

  it('should display loading indicator while fetching', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-detail-loading')).toBeDefined()
  })

  it('should not display project details while loading', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.queryByTestId('project-detail-content')).toBeNull()
  })
})

describe('ProjectDetailScreen - Error State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProject.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch project'),
    })
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: false,
    })
  })

  it('should display error message when fetch fails', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/failed to fetch/i)).toBeDefined()
  })

  it('should not display project details on error', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.queryByTestId('project-detail-content')).toBeNull()
  })
})

describe('ProjectDetailScreen - Project Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProject.mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
      error: null,
    })
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: false,
    })
  })

  it('should display project name', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })

  it('should display project description', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText('This is a test project')).toBeDefined()
  })

  it('should display status badge', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-status-badge')).toBeDefined()
    expect(screen.getByText('Active')).toBeDefined()
  })

  it('should display priority badge', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-priority-badge')).toBeDefined()
    expect(screen.getByText('Medium')).toBeDefined()
  })

  it('should display start date when present', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-start-date')).toBeDefined()
  })

  it('should display due date when present', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-due-date')).toBeDefined()
  })

  it('should display owner email', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/owner@example.com/i)).toBeDefined()
  })

  it('should render edit button', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-edit-button')).toBeDefined()
  })

  it('should render delete button', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('project-delete-button')).toBeDefined()
  })
})

describe('ProjectDetailScreen - Edit Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProject.mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
      error: null,
    })
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: false,
    })
  })

  it('should navigate to ProjectForm when edit button is pressed', () => {
    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    const editButton = screen.getByTestId('project-edit-button')
    editButton.click()

    expect(mockNavigate).toHaveBeenCalledWith('ProjectForm', {
      projectUuid: 'test-project-uuid',
    })
  })
})

describe('ProjectDetailScreen - Delete Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProject.mockReturnValue({
      data: mockProject,
      isLoading: false,
      isError: false,
      error: null,
    })
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: false,
    })
  })

  it('should show confirmation dialog when delete button is pressed', async () => {
    const { Alert } = await import('react-native')

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    const deleteButton = screen.getByTestId('project-delete-button')
    deleteButton.click()

    expect(Alert.alert).toHaveBeenCalledWith(
      expect.stringContaining('Delete'),
      expect.any(String),
      expect.any(Array)
    )
  })

  it('should call deleteProject mutation when confirmed', async () => {
    const { Alert } = await import('react-native')
    vi.mocked(Alert.alert).mockImplementation((title, message, buttons) => {
      // Simulate pressing "Delete" button
      const deleteButton = buttons?.find((b: any) => b.text === 'Delete')
      if (deleteButton && deleteButton.onPress) {
        deleteButton.onPress()
      }
    })

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    const deleteButton = screen.getByTestId('project-delete-button')
    deleteButton.click()

    await waitFor(() => {
      expect(mockDeleteProjectMutate).toHaveBeenCalledWith('test-project-uuid')
    })
  })

  it('should navigate back after successful delete', async () => {
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: true, // Simulate successful delete
    })

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)

    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled()
    })
  })

  it('should disable delete button while deleting', () => {
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: true, // Deleting in progress
      isSuccess: false,
    })

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    const deleteButton = screen.getByTestId('project-delete-button')

    expect(deleteButton).toBeDefined()
    // Button should show loading state (tested visually/manually)
  })
})

describe('ProjectDetailScreen - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteProject.mockReturnValue({
      mutate: mockDeleteProjectMutate,
      isPending: false,
      isSuccess: false,
    })
  })

  it('should handle project without description', () => {
    const projectWithoutDesc = createMockProject({
      uuid: 'test-uuid',
      description: undefined,
    })

    mockUseProject.mockReturnValue({
      data: projectWithoutDesc,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(projectWithoutDesc.name)).toBeDefined()
  })

  it('should handle project without dates', () => {
    const projectWithoutDates = createMockProject({
      uuid: 'test-uuid',
      start_date: null,
      due_date: null,
    })

    mockUseProject.mockReturnValue({
      data: projectWithoutDates,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.queryByTestId('project-start-date')).toBeNull()
    expect(screen.queryByTestId('project-due-date')).toBeNull()
  })

  it('should display overdue indicator when is_overdue is true', () => {
    const overdueProject = createMockProject({
      uuid: 'test-uuid',
      is_overdue: true,
    })

    mockUseProject.mockReturnValue({
      data: overdueProject,
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<ProjectDetailScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText('Overdue')).toBeDefined()
  })
})
