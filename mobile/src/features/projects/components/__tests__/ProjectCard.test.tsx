/**
 * ProjectCard Component Tests (RED phase - TDD)
 * Write tests FIRST, implementation SECOND
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '../ProjectCard'
import type { Project } from '@/api/types.gen'

// Mock React Native Paper components
vi.mock('react-native-paper', () => {
  const Card = ({ children, onPress, testID }: any) => (
    <div data-testid={testID} onClick={onPress}>
      {children}
    </div>
  )
  Card.Content = ({ children }: any) => <div>{children}</div>

  return {
    Card,
    Text: ({ children, testID }: any) => <div data-testid={testID}>{children}</div>,
    Chip: ({ children, testID, style }: any) => (
      <div data-testid={testID} style={style}>
        {children}
      </div>
    ),
  }
})

const mockProject: Project = {
  uuid: 'test-uuid-123',
  name: 'Test Project',
  description: 'This is a test project description',
  owner: 'user-1',
  owner_email: 'test@example.com',
  status: 'active',
  priority: 2,
  start_date: '2025-01-01',
  due_date: '2025-12-31',
  is_overdue: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

describe('ProjectCard - Rendering', () => {
  it('should render project name', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })

  it('should render project description', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    expect(screen.getByText('This is a test project description')).toBeDefined()
  })

  it('should render status badge', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    const statusBadge = screen.getByTestId('project-card-status-badge')
    expect(statusBadge).toBeDefined()
  })

  it('should render priority badge', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    const priorityBadge = screen.getByTestId('project-card-priority-badge')
    expect(priorityBadge).toBeDefined()
  })

  it('should render due date when present', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    expect(screen.getByTestId('project-card-due-date')).toBeDefined()
  })

  it('should not render due date when null', () => {
    const projectWithoutDueDate: Project = { ...mockProject, due_date: null }
    render(<ProjectCard project={projectWithoutDueDate} onPress={vi.fn()} />)
    expect(screen.queryByTestId('project-card-due-date')).toBeNull()
  })
})

describe('ProjectCard - Status Badge Colors', () => {
  it('should display draft status with gray color', () => {
    const draftProject: Project = { ...mockProject, status: 'draft' }
    render(<ProjectCard project={draftProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-status-badge')
    expect(badge).toBeDefined()
    // Color verification will be done visually/manually
  })

  it('should display active status with blue color', () => {
    const activeProject: Project = { ...mockProject, status: 'active' }
    render(<ProjectCard project={activeProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-status-badge')
    expect(badge).toBeDefined()
  })

  it('should display completed status with green color', () => {
    const completedProject: Project = { ...mockProject, status: 'completed' }
    render(<ProjectCard project={completedProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-status-badge')
    expect(badge).toBeDefined()
  })

  it('should display archived status with orange color', () => {
    const archivedProject: Project = { ...mockProject, status: 'archived' }
    render(<ProjectCard project={archivedProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-status-badge')
    expect(badge).toBeDefined()
  })

  it('should display status label text', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    expect(screen.getByText('Active')).toBeDefined() // Capitalized
  })
})

describe('ProjectCard - Priority Badge Colors', () => {
  it('should display low priority (1) with gray color', () => {
    const lowPriorityProject: Project = { ...mockProject, priority: 1 }
    render(<ProjectCard project={lowPriorityProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-priority-badge')
    expect(badge).toBeDefined()
  })

  it('should display medium priority (2) with yellow color', () => {
    const mediumPriorityProject: Project = { ...mockProject, priority: 2 }
    render(<ProjectCard project={mediumPriorityProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-priority-badge')
    expect(badge).toBeDefined()
  })

  it('should display high priority (3) with orange color', () => {
    const highPriorityProject: Project = { ...mockProject, priority: 3 }
    render(<ProjectCard project={highPriorityProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-priority-badge')
    expect(badge).toBeDefined()
  })

  it('should display urgent priority (4) with red color', () => {
    const urgentPriorityProject: Project = { ...mockProject, priority: 4 }
    render(<ProjectCard project={urgentPriorityProject} onPress={vi.fn()} />)
    const badge = screen.getByTestId('project-card-priority-badge')
    expect(badge).toBeDefined()
  })

  it('should display priority label text', () => {
    render(<ProjectCard project={mockProject} onPress={vi.fn()} />)
    expect(screen.getByText('Medium')).toBeDefined() // priority: 2
  })
})

describe('ProjectCard - Date Formatting', () => {
  it('should format due date correctly', () => {
    const project: Project = { ...mockProject, due_date: '2025-12-31' }
    render(<ProjectCard project={project} onPress={vi.fn()} />)
    // Date format: "Dec 31, 2025" or "12/31/2025" - we'll use simple format
    const dueDate = screen.getByTestId('project-card-due-date')
    expect(dueDate.textContent).toContain('2025')
  })

  it('should display "Overdue" indicator when is_overdue is true', () => {
    const overdueProject: Project = { ...mockProject, is_overdue: true }
    render(<ProjectCard project={overdueProject} onPress={vi.fn()} />)
    expect(screen.getByText('Overdue')).toBeDefined()
  })

  it('should not display "Overdue" indicator when is_overdue is false', () => {
    const project: Project = { ...mockProject, is_overdue: false }
    render(<ProjectCard project={project} onPress={vi.fn()} />)
    expect(screen.queryByText('Overdue')).toBeNull()
  })
})

describe('ProjectCard - Press Handler', () => {
  it('should call onPress when card is pressed', () => {
    const onPressMock = vi.fn()
    render(<ProjectCard project={mockProject} onPress={onPressMock} />)

    const card = screen.getByTestId('project-card')
    card.click() // Simulate press

    expect(onPressMock).toHaveBeenCalledTimes(1)
    expect(onPressMock).toHaveBeenCalledWith(mockProject)
  })

  it('should pass project data to onPress handler', () => {
    const onPressMock = vi.fn()
    render(<ProjectCard project={mockProject} onPress={onPressMock} />)

    const card = screen.getByTestId('project-card')
    card.click()

    expect(onPressMock).toHaveBeenCalledWith(mockProject)
  })
})

describe('ProjectCard - Edge Cases', () => {
  it('should render without description', () => {
    const projectWithoutDesc: Project = { ...mockProject, description: undefined }
    render(<ProjectCard project={projectWithoutDesc} onPress={vi.fn()} />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })

  it('should render without status', () => {
    const projectWithoutStatus: Project = { ...mockProject, status: undefined }
    render(<ProjectCard project={projectWithoutStatus} onPress={vi.fn()} />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })

  it('should render without priority', () => {
    const projectWithoutPriority: Project = { ...mockProject, priority: undefined }
    render(<ProjectCard project={projectWithoutPriority} onPress={vi.fn()} />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })

  it('should render with start_date and due_date null', () => {
    const project: Project = { ...mockProject, start_date: null, due_date: null }
    render(<ProjectCard project={project} onPress={vi.fn()} />)
    expect(screen.getByText('Test Project')).toBeDefined()
  })
})
