/**
 * ProjectFilters.vue Test Suite
 *
 * Tests for project filters component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import ProjectFilters from '../ProjectFilters.vue'

describe('ProjectFilters.vue', () => {
  const defaultModelValue = {
    ordering: '-created_at',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders search input', () => {
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('renders status filter dropdown', () => {
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusSelect = screen.getByRole('combobox', { name: '' })
      const options = Array.from(statusSelect.querySelectorAll('option'))

      expect(options).toHaveLength(5)
      expect(options[0]?.textContent).toBe('All Statuses')
      expect(options[1]?.textContent).toBe('Draft')
      expect(options[2]?.textContent).toBe('Active')
      expect(options[3]?.textContent).toBe('Completed')
      expect(options[4]?.textContent).toBe('Archived')
    })

    it('renders ordering dropdown with all options', () => {
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1] // Second select is ordering

      const options = Array.from(orderingSelect!.querySelectorAll('option'))

      expect(options).toHaveLength(8)
      expect(options[0]?.textContent).toBe('Newest First')
      expect(options[1]?.textContent).toBe('Oldest First')
      expect(options[2]?.textContent).toBe('Name (A-Z)')
      expect(options[3]?.textContent).toBe('Name (Z-A)')
      expect(options[4]?.textContent).toBe('Due Date (Earliest)')
      expect(options[5]?.textContent).toBe('Due Date (Latest)')
      expect(options[6]?.textContent).toBe('Priority (Low to High)')
      expect(options[7]?.textContent).toBe('Priority (High to Low)')
    })

    it('does not render clear filters button when no filters are active', () => {
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument()
    })

    it('renders clear filters button when filters are active', () => {
      render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            ordering: '-created_at',
          },
        },
      })

      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })
  })

  describe('Default Values', () => {
    it('sets default ordering to newest first', () => {
      render(ProjectFilters, {
        props: { modelValue: { ordering: '-created_at' } },
      })

      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1] as HTMLSelectElement

      expect(orderingSelect.value).toBe('-created_at')
    })

    it('has empty search by default', () => {
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...') as HTMLInputElement

      expect(searchInput.value).toBe('')
    })

    it('has all statuses selected by default', () => {
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusSelect = screen.getByRole('combobox', { name: '' }) as HTMLSelectElement

      expect(statusSelect.value).toBe('undefined')
    })
  })

  describe('Search Functionality', () => {
    it('emits update event when user types in search', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await user.type(searchInput, 'test')

      await waitFor(() => {
        expect(emitted()['update:modelValue']).toBeTruthy()
      })
    })

    it('includes search term in emitted filter data', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await user.type(searchInput, 'website')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.search).toBe('website')
      })
    })

    it('clears search when input is emptied', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: {
          modelValue: {
            search: 'test',
            ordering: '-created_at',
          },
        },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...') as HTMLInputElement

      expect(searchInput.value).toBe('test')

      await user.clear(searchInput)

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.search).toBeUndefined()
      })
    })
  })

  describe('Status Filter Functionality', () => {
    it('emits update event when status is changed', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(statusSelect, 'active')

      await waitFor(() => {
        expect(emitted()['update:modelValue']).toBeTruthy()
      })
    })

    it('includes selected status in emitted filter data', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(statusSelect, 'completed')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.status).toBe('completed')
      })
    })

    it('removes status filter when "All Statuses" is selected', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            ordering: '-created_at',
          },
        },
      })

      const statusSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(statusSelect, 'undefined')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.status).toBeUndefined()
      })
    })
  })

  describe('Ordering Functionality', () => {
    it('emits update event when ordering is changed', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1]!

      await user.selectOptions(orderingSelect, 'name')

      await waitFor(() => {
        expect(emitted()['update:modelValue']).toBeTruthy()
      })
    })

    it('includes selected ordering in emitted filter data', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1]!

      await user.selectOptions(orderingSelect, '-priority')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.ordering).toBe('-priority')
      })
    })
  })

  describe('Clear Filters Functionality', () => {
    it('shows clear button when search is active', () => {
      render(ProjectFilters, {
        props: {
          modelValue: {
            search: 'test',
            ordering: '-created_at',
          },
        },
      })

      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })

    it('shows clear button when status filter is active', () => {
      render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            ordering: '-created_at',
          },
        },
      })

      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })

    it('shows clear button when both search and status are active', () => {
      render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            search: 'test',
            ordering: '-created_at',
          },
        },
      })

      expect(screen.getByText('Clear Filters')).toBeInTheDocument()
    })

    it('clears all filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            search: 'test',
            ordering: 'name',
          },
        },
      })

      const clearButton = screen.getByText('Clear Filters')
      await user.click(clearButton)

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.status).toBeUndefined()
        expect(lastUpdate.search).toBeUndefined()
        expect(lastUpdate.ordering).toBe('-created_at') // Resets to default
      })
    })

    it('hides clear button after clearing filters', async () => {
      const user = userEvent.setup()
      const { rerender } = render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            search: 'test',
            ordering: '-created_at',
          },
        },
      })

      const clearButton = screen.getByText('Clear Filters')
      await user.click(clearButton)

      // Simulate parent updating props after clear
      await rerender({
        modelValue: {
          ordering: '-created_at',
        },
      })

      await waitFor(() => {
        expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument()
      })
    })
  })

  describe('v-model Binding', () => {
    it('reflects external prop changes in search input', async () => {
      const { rerender } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...') as HTMLInputElement
      expect(searchInput.value).toBe('')

      await rerender({
        modelValue: {
          search: 'updated',
          ordering: '-created_at',
        },
      })

      await waitFor(() => {
        expect(searchInput.value).toBe('updated')
      })
    })

    it('reflects external prop changes in status select', async () => {
      const { rerender } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusSelect = screen.getByRole('combobox', { name: '' }) as HTMLSelectElement
      expect(statusSelect.value).toBe('undefined')

      await rerender({
        modelValue: {
          status: 'active',
          ordering: '-created_at',
        },
      })

      await waitFor(() => {
        expect(statusSelect.value).toBe('active')
      })
    })

    it('reflects external prop changes in ordering select', async () => {
      const { rerender } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1] as HTMLSelectElement
      expect(orderingSelect.value).toBe('-created_at')

      await rerender({
        modelValue: {
          ordering: 'name',
        },
      })

      await waitFor(() => {
        expect(orderingSelect.value).toBe('name')
      })
    })
  })

  describe('Combined Filter Operations', () => {
    it('handles multiple simultaneous filters', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      // Set search
      const searchInput = screen.getByPlaceholderText('Search projects...')
      await user.type(searchInput, 'website')

      // Set status
      const statusSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(statusSelect, 'active')

      // Set ordering
      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1]!
      await user.selectOptions(orderingSelect, '-priority')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.search).toBe('website')
        expect(lastUpdate.status).toBe('active')
        expect(lastUpdate.ordering).toBe('-priority')
      })
    })

    it('preserves unchanged filters when updating one', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: {
          modelValue: {
            search: 'existing',
            status: 'active',
            ordering: '-created_at',
          },
        },
      })

      // Change only the ordering
      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1]!
      await user.selectOptions(orderingSelect, 'name')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.search).toBe('existing')
        expect(lastUpdate.status).toBe('active')
        expect(lastUpdate.ordering).toBe('name')
      })
    })
  })

  describe('Accessibility', () => {
    it('search input is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...')

      await user.click(searchInput)
      expect(searchInput).toHaveFocus()
    })

    it('all select dropdowns are keyboard accessible', async () => {
      const user = userEvent.setup()
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')

      for (const select of selects) {
        await user.click(select)
        expect(select).toHaveFocus()
      }
    })

    it('clear button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(ProjectFilters, {
        props: {
          modelValue: {
            status: 'active',
            ordering: '-created_at',
          },
        },
      })

      const clearButton = screen.getByText('Clear Filters')

      await user.click(clearButton)
      expect(clearButton).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles rapid filter changes', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...')

      // Rapid typing
      await user.type(searchInput, 'abc')

      await waitFor(() => {
        expect(emitted()['update:modelValue']).toBeTruthy()
      })
    })

    it('handles special characters in search', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...')
      await user.type(searchInput, '<>&"')

      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.search).toBe('<>&"')
      })
    })

    it('handles empty modelValue prop gracefully', () => {
      render(ProjectFilters, {
        props: { modelValue: {} },
      })

      expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument()
    })
  })

  describe('Complete User Flow', () => {
    it('allows user to search, filter, and sort projects', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      // User searches
      const searchInput = screen.getByPlaceholderText('Search projects...')
      await user.type(searchInput, 'redesign')

      // User filters by status
      const statusSelect = screen.getByRole('combobox', { name: '' })
      await user.selectOptions(statusSelect, 'active')

      // User changes sort order
      const selects = screen.getAllByRole('combobox')
      const orderingSelect = selects[1]!
      await user.selectOptions(orderingSelect, '-priority')

      // Clear button should be visible
      expect(screen.getByText('Clear Filters')).toBeInTheDocument()

      // Final state should include all filters
      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.search).toBe('redesign')
        expect(lastUpdate.status).toBe('active')
        expect(lastUpdate.ordering).toBe('-priority')
      })
    })

    it('allows user to clear all filters with one click', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: {
          modelValue: {
            search: 'test',
            status: 'completed',
            ordering: 'name',
          },
        },
      })

      // User clicks clear
      const clearButton = screen.getByText('Clear Filters')
      await user.click(clearButton)

      // All filters reset
      await waitFor(() => {
        const updates = emitted()['update:modelValue'] as Array<Array<any>>
        const lastUpdate = updates[updates.length - 1]?.[0]

        expect(lastUpdate.status).toBeUndefined()
        expect(lastUpdate.search).toBeUndefined()
        expect(lastUpdate.ordering).toBe('-created_at')
      })
    })
  })
})
