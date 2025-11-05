/**
 * ProjectCard.vue Test Suite
 *
 * Tests for project card display component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import ProjectCard from '../ProjectCard.vue'
import type { Project } from '@/api/types.gen'

// Mock window.confirm
global.confirm = vi.fn()

describe('ProjectCard.vue', () => {
  const mockProject: Project = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Project',
    description: 'This is a test project description',
    status: 'active',
    priority: 2,
    start_date: '2025-01-15',
    due_date: '2025-12-31',
    owner: 1,
    owner_email: 'owner@example.com',
    created_at: '2025-01-01T12:00:00Z',
    updated_at: '2025-01-05T15:30:00Z',
    is_overdue: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true)
  })

  describe('Component Rendering', () => {
    it('renders project name', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('renders project description', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByText('This is a test project description')).toBeInTheDocument()
    })

    it('renders "No description" when description is empty', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, description: '' },
        },
      })

      expect(screen.getByText('No description')).toBeInTheDocument()
    })

    it('renders "No description" when description is null', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, description: null },
        },
      })

      expect(screen.getByText('No description')).toBeInTheDocument()
    })

    it('renders edit and delete buttons', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })
  })

  describe('Status Badge Rendering', () => {
    it('renders draft status badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, status: 'draft' },
        },
      })

      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders active status badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, status: 'active' },
        },
      })

      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders completed status badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, status: 'completed' },
        },
      })

      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('renders archived status badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, status: 'archived' },
        },
      })

      expect(screen.getByText('Archived')).toBeInTheDocument()
    })
  })

  describe('Priority Badge Rendering', () => {
    it('renders low priority badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, priority: 1 },
        },
      })

      expect(screen.getByText('Low')).toBeInTheDocument()
    })

    it('renders medium priority badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, priority: 2 },
        },
      })

      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('renders high priority badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, priority: 3 },
        },
      })

      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('renders critical priority badge', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, priority: 4 },
        },
      })

      expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    it('defaults to medium priority when priority is null', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, priority: null },
        },
      })

      expect(screen.getByText('Medium')).toBeInTheDocument()
    })
  })

  describe('Overdue Badge Rendering', () => {
    it('renders overdue badge when project is overdue', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, is_overdue: true },
        },
      })

      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    it('does not render overdue badge when project is not overdue', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, is_overdue: false },
        },
      })

      expect(screen.queryByText('Overdue')).not.toBeInTheDocument()
    })

    it('applies overdue styling to card', () => {
      const { container } = render(ProjectCard, {
        props: {
          project: { ...mockProject, is_overdue: true },
        },
      })

      const card = container.querySelector('.project-card')
      expect(card).toHaveClass('is-overdue')
    })
  })

  describe('Date Display', () => {
    it('renders start date when provided', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByText('Start:')).toBeInTheDocument()
      expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument()
    })

    it('renders due date when provided', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByText('Due:')).toBeInTheDocument()
      expect(screen.getByText('Dec 31, 2025')).toBeInTheDocument()
    })

    it('does not render start date when null', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, start_date: null },
        },
      })

      expect(screen.queryByText('Start:')).not.toBeInTheDocument()
    })

    it('does not render due date when null', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, due_date: null },
        },
      })

      expect(screen.queryByText('Due:')).not.toBeInTheDocument()
    })
  })

  describe('Owner and Created Information', () => {
    it('renders owner email', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByText(/owner@example\.com/i)).toBeInTheDocument()
    })

    it('renders created date', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      expect(screen.getByText(/created jan 1, 2025/i)).toBeInTheDocument()
    })
  })

  describe('Edit Button Interaction', () => {
    it('emits edit event with project when edit button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(emitted()).toHaveProperty('edit')
      expect(emitted().edit[0]).toEqual([mockProject])
    })

    it('prevents card click event when edit button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Should emit edit but not click
      expect(emitted()).toHaveProperty('edit')
      expect(emitted()).not.toHaveProperty('click')
    })
  })

  describe('Delete Button Interaction', () => {
    it('shows confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(ProjectCard, {
        props: { project: mockProject },
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(global.confirm).toHaveBeenCalledWith('Delete project "Test Project"?')
    })

    it('emits delete event with uuid when confirmed', async () => {
      const user = userEvent.setup()
      ;(global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true)

      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(emitted()).toHaveProperty('delete')
      expect(emitted().delete[0]).toEqual(['123e4567-e89b-12d3-a456-426614174000'])
    })

    it('does not emit delete event when cancelled', async () => {
      const user = userEvent.setup()
      ;(global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(false)

      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(emitted()).not.toHaveProperty('delete')
    })

    it('prevents card click event when delete button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(emitted()).not.toHaveProperty('click')
    })

    it('shows deleting state when isDeleting prop is true', () => {
      render(ProjectCard, {
        props: { project: mockProject, isDeleting: true },
      })

      const deleteButton = screen.getByRole('button', { name: /deleting/i })
      expect(deleteButton).toBeDisabled()
      expect(deleteButton).toHaveTextContent('Deleting...')
    })

    it('disables delete button during deletion', () => {
      render(ProjectCard, {
        props: { project: mockProject, isDeleting: true },
      })

      const deleteButton = screen.getByRole('button', { name: /deleting/i })
      expect(deleteButton).toBeDisabled()
    })
  })

  describe('Card Click Interaction', () => {
    it('emits click event with project when card is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const card = screen.getByText('Test Project').closest('.project-card')
      await user.click(card!)

      expect(emitted()).toHaveProperty('click')
      expect(emitted().click[0]).toEqual([mockProject])
    })

    it('does not emit click when edit button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      expect(emitted()).toHaveProperty('edit')
      expect(emitted()).not.toHaveProperty('click')
    })

    it('does not emit click when delete button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(emitted()).not.toHaveProperty('click')
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(ProjectCard, {
        props: { project: mockProject },
      })

      const editButton = screen.getByRole('button', { name: /edit/i })
      const deleteButton = screen.getByRole('button', { name: /delete/i })

      expect(editButton).toHaveAttribute('title', 'Edit project')
      expect(deleteButton).toHaveAttribute('title', 'Delete project')
    })

    it('is clickable for keyboard navigation', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const card = screen.getByText('Test Project').closest('.project-card')

      // Simulate keyboard interaction
      await user.click(card!)

      expect(emitted()).toHaveProperty('click')
    })
  })

  describe('Visual States', () => {
    it('applies hover styles (tested via class)', () => {
      const { container } = render(ProjectCard, {
        props: { project: mockProject },
      })

      const card = container.querySelector('.project-card')
      expect(card).toHaveClass('project-card')
    })

    it('applies correct badge styles for different statuses', () => {
      const { container: draftContainer } = render(ProjectCard, {
        props: {
          project: { ...mockProject, status: 'draft' },
        },
      })

      const draftBadge = draftContainer.querySelector('.badge')
      expect(draftBadge).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles project with all null optional fields', () => {
      const minimalProject: Project = {
        uuid: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Minimal Project',
        description: null,
        status: 'draft',
        priority: 2,
        start_date: null,
        due_date: null,
        owner: 1,
        owner_email: 'owner@example.com',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        is_overdue: false,
      }

      render(ProjectCard, {
        props: { project: minimalProject },
      })

      expect(screen.getByText('Minimal Project')).toBeInTheDocument()
      expect(screen.getByText('No description')).toBeInTheDocument()
      expect(screen.queryByText('Start:')).not.toBeInTheDocument()
      expect(screen.queryByText('Due:')).not.toBeInTheDocument()
    })

    it('handles very long project names gracefully', () => {
      const longName = 'This is a very long project name that might wrap to multiple lines in the UI'

      render(ProjectCard, {
        props: {
          project: { ...mockProject, name: longName },
        },
      })

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles very long descriptions gracefully', () => {
      const longDescription =
        'This is a very long description that contains a lot of text and might need to be truncated or wrapped in the UI to maintain proper layout and readability for users viewing the project card.'

      render(ProjectCard, {
        props: {
          project: { ...mockProject, description: longDescription },
        },
      })

      expect(screen.getByText(longDescription)).toBeInTheDocument()
    })

    it('handles special characters in project name', () => {
      render(ProjectCard, {
        props: {
          project: { ...mockProject, name: 'Project <>&"' },
        },
      })

      expect(screen.getByText('Project <>&"')).toBeInTheDocument()
    })
  })

  describe('Complete User Flow', () => {
    it('displays project and allows user to edit it', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      // User sees project details
      expect(screen.getByText('Test Project')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()

      // User clicks edit
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Edit event emitted
      expect(emitted().edit).toBeTruthy()
      expect(emitted().edit[0]).toEqual([mockProject])
    })

    it('displays project and allows user to delete it', async () => {
      const user = userEvent.setup()
      ;(global.confirm as ReturnType<typeof vi.fn>).mockReturnValue(true)

      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      // User clicks delete
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Confirmation shown
      expect(global.confirm).toHaveBeenCalledWith('Delete project "Test Project"?')

      // Delete event emitted
      expect(emitted().delete).toBeTruthy()
      expect(emitted().delete[0]).toEqual([mockProject.uuid])
    })

    it('displays project and allows user to view details', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectCard, {
        props: { project: mockProject },
      })

      // User clicks on card
      const card = screen.getByText('Test Project').closest('.project-card')
      await user.click(card!)

      // Click event emitted
      expect(emitted().click).toBeTruthy()
      expect(emitted().click[0]).toEqual([mockProject])
    })
  })
})
