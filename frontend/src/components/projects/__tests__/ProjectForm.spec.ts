/**
 * ProjectForm.vue Test Suite
 *
 * Tests for project creation/editing form component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import ProjectForm from '../ProjectForm.vue'
import type { Project } from '@/api/types.gen'

describe('ProjectForm.vue', () => {
  const mockProject: Project = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Project',
    description: 'Test Description',
    status: 'active',
    priority: 3,
    start_date: '2025-01-01',
    due_date: '2025-12-31',
    owner: '123e4567-e89b-12d3-a456-426614174001',
    owner_email: 'owner@example.com',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    is_overdue: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering - Create Mode', () => {
    it('renders create form with correct title', () => {
      render(ProjectForm)

      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      render(ProjectForm)

      expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument()
    })

    it('renders submit and cancel buttons', () => {
      render(ProjectForm)

      expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('shows required indicator on project name field', () => {
      render(ProjectForm)

      const nameLabel = screen.getByText(/project name/i)
      expect(nameLabel.parentElement?.textContent).toContain('*')
    })

    it('renders with default values for new project', () => {
      render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i) as HTMLInputElement
      const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement

      expect(nameInput.value).toBe('')
      expect(statusSelect.value).toBe('draft')
      expect(prioritySelect.value).toBe('2') // Medium
    })
  })

  describe('Component Rendering - Edit Mode', () => {
    it('renders edit form with correct title', () => {
      render(ProjectForm, {
        props: { project: mockProject },
      })

      expect(screen.getByText('Edit Project')).toBeInTheDocument()
    })

    it('populates form fields with project data', async () => {
      render(ProjectForm, {
        props: { project: mockProject },
      })

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/project name/i) as HTMLInputElement
        const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement
        const statusSelect = screen.getByLabelText(/status/i) as HTMLSelectElement
        const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement
        const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement
        const dueDateInput = screen.getByLabelText(/due date/i) as HTMLInputElement

        expect(nameInput.value).toBe('Test Project')
        expect(descriptionInput.value).toBe('Test Description')
        expect(statusSelect.value).toBe('active')
        expect(prioritySelect.value).toBe('3')
        expect(startDateInput.value).toBe('2025-01-01')
        expect(dueDateInput.value).toBe('2025-12-31')
      })
    })

    it('renders update button in edit mode', () => {
      render(ProjectForm, {
        props: { project: mockProject },
      })

      expect(screen.getByRole('button', { name: /update project/i })).toBeInTheDocument()
    })
  })

  describe('Form Field Options', () => {
    it('renders all status options', () => {
      render(ProjectForm)

      const statusSelect = screen.getByLabelText(/status/i)
      const options = Array.from(statusSelect.querySelectorAll('option'))

      expect(options).toHaveLength(4)
      expect(options[0]?.textContent).toBe('Draft')
      expect(options[1]?.textContent).toBe('Active')
      expect(options[2]?.textContent).toBe('Completed')
      expect(options[3]?.textContent).toBe('Archived')
    })

    it('renders all priority options', () => {
      render(ProjectForm)

      const prioritySelect = screen.getByLabelText(/priority/i)
      const options = Array.from(prioritySelect.querySelectorAll('option'))

      expect(options).toHaveLength(4)
      expect(options[0]?.textContent).toBe('Low')
      expect(options[1]?.textContent).toBe('Medium')
      expect(options[2]?.textContent).toBe('High')
      expect(options[3]?.textContent).toBe('Critical')
    })
  })

  describe('Form Validation - Zod Schema', () => {
    it('displays error when project name is empty', async () => {
      const user = userEvent.setup()
      render(ProjectForm)

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument()
      })
    })

    it('accepts valid project name', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'New Project')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Project name is required')).not.toBeInTheDocument()
        expect(emitted()).toHaveProperty('submit')
      })
    })

    it('validates due date is after start date', async () => {
      const user = userEvent.setup()
      render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      const startDateInput = screen.getByLabelText(/start date/i)
      const dueDateInput = screen.getByLabelText(/due date/i)

      await user.type(nameInput, 'Test Project')
      await user.type(startDateInput, '2025-12-31')
      await user.type(dueDateInput, '2025-01-01')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Due date must be after start date')).toBeInTheDocument()
      })
    })

    it('accepts due date equal to start date', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      const startDateInput = screen.getByLabelText(/start date/i)
      const dueDateInput = screen.getByLabelText(/due date/i)

      await user.type(nameInput, 'Test Project')
      await user.type(startDateInput, '2025-06-15')
      await user.type(dueDateInput, '2025-06-15')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Due date must be after start date')).not.toBeInTheDocument()
        expect(emitted()).toHaveProperty('submit')
      })
    })

    it('accepts project without dates', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'Test Project')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('submit')
      })
    })

    it('validates start date without due date', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      const startDateInput = screen.getByLabelText(/start date/i)

      await user.type(nameInput, 'Test Project')
      await user.type(startDateInput, '2025-01-01')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('submit')
      })
    })
  })

  describe('Field Error Clearing', () => {
    it('clears name error when user starts typing', async () => {
      const user = userEvent.setup()
      render(ProjectForm)

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument()
      })

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'N')

      await waitFor(() => {
        expect(screen.queryByText('Project name is required')).not.toBeInTheDocument()
      })
    })

    it('clears date validation error when dates are corrected', async () => {
      const user = userEvent.setup()
      render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      const startDateInput = screen.getByLabelText(/start date/i)
      const dueDateInput = screen.getByLabelText(/due date/i)

      await user.type(nameInput, 'Test')
      await user.type(startDateInput, '2025-12-31')
      await user.type(dueDateInput, '2025-01-01')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Due date must be after start date')).toBeInTheDocument()
      })

      // Fix the due date
      await user.clear(dueDateInput)
      await user.type(dueDateInput, '2026-01-01')

      await waitFor(() => {
        expect(screen.queryByText('Due date must be after start date')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission - Create Mode', () => {
    it('emits submit event with valid data', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      const descriptionInput = screen.getByLabelText(/description/i)

      await user.type(nameInput, 'New Project')
      await user.type(descriptionInput, 'Project description')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('submit')
        const submitEvents = emitted()['submit']
        expect(submitEvents).toBeTruthy()
        expect(Array.isArray(submitEvents)).toBe(true)
        expect(submitEvents![0]).toBeTruthy()
        const submitData = (submitEvents as unknown[][])[0]![0] as Record<string, unknown>

        expect(submitData['name']).toBe('New Project')
        expect(submitData['description']).toBe('Project description')
        expect(submitData['status']).toBe('draft')
        expect(submitData['priority']).toBe(2)
      })
    })

    it('emits submit event with all fields populated', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      await user.type(screen.getByLabelText(/project name/i), 'Complete Project')
      await user.type(screen.getByLabelText(/description/i), 'Full description')
      await user.selectOptions(screen.getByLabelText(/status/i), 'active')
      await user.selectOptions(screen.getByLabelText(/priority/i), '3')
      await user.type(screen.getByLabelText(/start date/i), '2025-01-15')
      await user.type(screen.getByLabelText(/due date/i), '2025-12-15')

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        const submitEvents = emitted()['submit']
        expect(submitEvents).toBeTruthy()
        expect(Array.isArray(submitEvents)).toBe(true)
        expect(submitEvents![0]).toBeTruthy()
        const submitData = (submitEvents as unknown[][])[0]![0] as Record<string, unknown>

        expect(submitData['name']).toBe('Complete Project')
        expect(submitData['description']).toBe('Full description')
        expect(submitData['status']).toBe('active')
        expect(submitData['priority']).toBe(3)
        expect(submitData['start_date']).toBe('2025-01-15')
        expect(submitData['due_date']).toBe('2025-12-15')
      })
    })
  })

  describe('Form Submission - Edit Mode', () => {
    it('emits submit event with updated data', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm, {
        props: { project: mockProject },
      })

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/project name/i) as HTMLInputElement
        expect(nameInput.value).toBe('Test Project')
      })

      const nameInput = screen.getByLabelText(/project name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Project Name')

      const submitButton = screen.getByRole('button', { name: /update project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('submit')
        const submitEvents = emitted()['submit']
        expect(submitEvents).toBeTruthy()
        expect(Array.isArray(submitEvents)).toBe(true)
        expect(submitEvents![0]).toBeTruthy()
        const submitData = (submitEvents as unknown[][])[0]![0] as Record<string, unknown>

        expect(submitData['name']).toBe('Updated Project Name')
      })
    })

    it('validates updated dates correctly', async () => {
      const user = userEvent.setup()
      render(ProjectForm, {
        props: { project: mockProject },
      })

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/project name/i) as HTMLInputElement
        expect(nameInput.value).toBe('Test Project')
      })

      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.clear(dueDateInput)
      await user.type(dueDateInput, '2024-01-01') // Before start date

      const submitButton = screen.getByRole('button', { name: /update project/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Due date must be after start date')).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Functionality', () => {
    it('emits cancel event when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(emitted()).toHaveProperty('cancel')
      expect(emitted()['cancel']).toHaveLength(1)
    })

    it('does not submit form when cancel is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      const nameInput = screen.getByLabelText(/project name/i)
      await user.type(nameInput, 'Test Project')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(emitted()).not.toHaveProperty('submit')
    })
  })

  describe('Loading State', () => {
    it('disables buttons when loading', () => {
      render(ProjectForm, {
        props: { isLoading: true },
      })

      const submitButton = screen.getByRole('button', { name: /creating/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('shows creating text in create mode when loading', () => {
      render(ProjectForm, {
        props: { isLoading: true },
      })

      expect(screen.getByText('Creating...')).toBeInTheDocument()
    })

    it('shows updating text in edit mode when loading', () => {
      render(ProjectForm, {
        props: { project: mockProject, isLoading: true },
      })

      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('associates all labels with inputs correctly', () => {
      render(ProjectForm)

      expect(screen.getByLabelText(/project name/i)).toHaveAttribute('id', 'name')
      expect(screen.getByLabelText(/description/i)).toHaveAttribute('id', 'description')
      expect(screen.getByLabelText(/status/i)).toHaveAttribute('id', 'status')
      expect(screen.getByLabelText(/priority/i)).toHaveAttribute('id', 'priority')
      expect(screen.getByLabelText(/start date/i)).toHaveAttribute('id', 'start_date')
      expect(screen.getByLabelText(/due date/i)).toHaveAttribute('id', 'due_date')
    })

    it('applies error styling to invalid fields', async () => {
      const user = userEvent.setup()
      render(ProjectForm)

      const submitButton = screen.getByRole('button', { name: /create project/i })
      await user.click(submitButton)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/project name/i)
        expect(nameInput).toHaveClass('input-error')
      })
    })

    it('prevents native form validation', () => {
      const { container } = render(ProjectForm)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('novalidate')
    })

    it('has proper input types for date fields', () => {
      render(ProjectForm)

      const startDateInput = screen.getByLabelText(/start date/i)
      const dueDateInput = screen.getByLabelText(/due date/i)

      expect(startDateInput).toHaveAttribute('type', 'date')
      expect(dueDateInput).toHaveAttribute('type', 'date')
    })
  })

  describe('User Interaction Flow', () => {
    it('completes full project creation flow', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      // Fill in form
      await user.type(screen.getByLabelText(/project name/i), 'Website Redesign')
      await user.type(
        screen.getByLabelText(/description/i),
        'Redesign company website with modern UI'
      )
      await user.selectOptions(screen.getByLabelText(/status/i), 'active')
      await user.selectOptions(screen.getByLabelText(/priority/i), '3') // High
      await user.type(screen.getByLabelText(/start date/i), '2025-02-01')
      await user.type(screen.getByLabelText(/due date/i), '2025-06-30')

      // Submit
      await user.click(screen.getByRole('button', { name: /create project/i }))

      // Verify submission
      await waitFor(() => {
        const submitEvents = emitted()['submit']
        expect(submitEvents).toBeTruthy()
        expect(Array.isArray(submitEvents)).toBe(true)
        expect(submitEvents![0]).toBeTruthy()
        const data = (submitEvents as unknown[][])[0]![0] as Record<string, unknown>

        expect(data['name']).toBe('Website Redesign')
        expect(data['description']).toBe('Redesign company website with modern UI')
        expect(data['status']).toBe('active')
        expect(data['priority']).toBe(3)
        expect(data['start_date']).toBe('2025-02-01')
        expect(data['due_date']).toBe('2025-06-30')
      })
    })

    it('handles validation errors and allows correction', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectForm)

      // Submit without name
      await user.click(screen.getByRole('button', { name: /create project/i }))

      // Error shown
      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument()
      })

      // Correct error
      await user.type(screen.getByLabelText(/project name/i), 'Fixed Project')
      await user.click(screen.getByRole('button', { name: /create project/i }))

      // Should submit successfully
      await waitFor(() => {
        expect(emitted()['submit']).toBeTruthy()
      })
    })
  })
})
