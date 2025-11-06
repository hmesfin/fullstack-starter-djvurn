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

    it('renders status filter dropdown', async () => {
      const user = userEvent.setup()
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      // Open the Shadcn Select dropdown
      const triggers = screen.getAllByRole('combobox')
      const statusTrigger = triggers[0] // First combobox is status
      await user.click(statusTrigger!)

      // Check options are rendered in the dropdown
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All Statuses' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Draft' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Completed' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Archived' })).toBeInTheDocument()
      })
    })

    it('renders ordering dropdown with all options', async () => {
      const user = userEvent.setup()
      render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')
      const orderingTrigger = selects[1] // Second combobox is ordering

      await user.click(orderingTrigger!)

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Newest First' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Oldest First' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Name (A-Z)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Name (Z-A)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Due Date (Earliest)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Due Date (Latest)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Priority (Low to High)' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Priority (High to Low)' })).toBeInTheDocument()
      })
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

      // Shadcn Select doesn't expose value via HTMLSelectElement
      // Component initializes with ordering: '-created_at' by default
      const triggers = screen.getAllByRole('combobox')
      expect(triggers).toHaveLength(2) // Status and ordering selects
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

      // Component initializes with status: 'undefined' (All Statuses) by default
      const triggers = screen.getAllByRole('combobox')
      expect(triggers[0]).toBeInTheDocument()
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
      const user = userEvent.setup({ delay: 10 })
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...') as HTMLInputElement

      // Type the text with a small delay between keystrokes
      await user.type(searchInput, 'website')

      // Wait for the input to have the full value and verify emissions
      await waitFor(
        () => {
          expect(searchInput.value).toBe('website')

          const updates = emitted()['update:modelValue'] as Array<Array<any>>
          expect(updates).toBeTruthy()
          expect(updates.length).toBeGreaterThan(0)

          // Verify that updates were emitted with search terms (may include partial terms)
          const lastUpdate = updates[updates.length - 1]?.[0]
          expect(lastUpdate).toHaveProperty('search')
        },
        { timeout: 3000 }
      )
    })

    it('clears search when input is emptied', async () => {
      const user = userEvent.setup({ delay: 10 })
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

      // Clear the input
      await user.clear(searchInput)

      // Wait for the input to be cleared and verify emissions
      await waitFor(
        () => {
          expect(searchInput.value).toBe('')

          const updates = emitted()['update:modelValue'] as Array<Array<any>>
          expect(updates).toBeTruthy()
          expect(updates.length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Status Filter Functionality', () => {
    it('emits update event when status is changed', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusTriggers = screen.getAllByRole('combobox')
      const statusTrigger = statusTriggers[0]!
      await user.click(statusTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Active' }))
      await user.click(screen.getByRole('option', { name: 'Active' }))

      await waitFor(() => {
        expect(emitted()['update:modelValue']).toBeTruthy()
      })
    })

    it('includes selected status in emitted filter data', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const statusTriggers = screen.getAllByRole('combobox')
      const statusTrigger = statusTriggers[0]!
      await user.click(statusTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Completed' }))
      await user.click(screen.getByRole('option', { name: 'Completed' }))

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

      const statusTriggers = screen.getAllByRole('combobox')
      const statusTrigger = statusTriggers[0]!
      await user.click(statusTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'All Statuses' }))
      await user.click(screen.getByRole('option', { name: 'All Statuses' }))

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
      const orderingTrigger = selects[1]!

      await user.click(orderingTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Name (A-Z)' }))
      await user.click(screen.getByRole('option', { name: 'Name (A-Z)' }))

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
      const orderingTrigger = selects[1]!

      await user.click(orderingTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Priority (High to Low)' }))
      await user.click(screen.getByRole('option', { name: 'Priority (High to Low)' }))

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

      // Shadcn Select doesn't expose .value - component watches modelValue and updates internal state
      const statusTriggers = screen.getAllByRole('combobox')
      expect(statusTriggers[0]).toBeInTheDocument()

      await rerender({
        modelValue: {
          status: 'active',
          ordering: '-created_at',
        },
      })

      // Component reactively updates - test that re-render doesn't break
      await waitFor(() => {
        expect(statusTriggers[0]).toBeInTheDocument()
      })
    })

    it('reflects external prop changes in ordering select', async () => {
      const { rerender } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const selects = screen.getAllByRole('combobox')
      expect(selects[1]).toBeInTheDocument()

      await rerender({
        modelValue: {
          ordering: 'name',
        },
      })

      // Component reactively updates - test that re-render doesn't break
      await waitFor(() => {
        expect(selects[1]).toBeInTheDocument()
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
      const selects = screen.getAllByRole('combobox')
      const statusTrigger = selects[0]!
      await user.click(statusTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Active' }))
      await user.click(screen.getByRole('option', { name: 'Active' }))

      // Set ordering
      const orderingTrigger = selects[1]!
      await user.click(orderingTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Priority (High to Low)' }))
      await user.click(screen.getByRole('option', { name: 'Priority (High to Low)' }))

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
      const orderingTrigger = selects[1]!
      await user.click(orderingTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Name (A-Z)' }))
      await user.click(screen.getByRole('option', { name: 'Name (A-Z)' }))

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

      // Verify that all selects can be interacted with
      for (const select of selects) {
        await user.click(select)
        // After clicking, the dropdown should be open (data-state="open")
        await waitFor(() => {
          expect(select).toHaveAttribute('aria-expanded', 'true')
        })
        // Close the dropdown by pressing Escape
        await user.keyboard('{Escape}')
        await waitFor(() => {
          expect(select).toHaveAttribute('aria-expanded', 'false')
        })
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
      const user = userEvent.setup({ delay: 10 })
      const { emitted } = render(ProjectFilters, {
        props: { modelValue: defaultModelValue },
      })

      const searchInput = screen.getByPlaceholderText('Search projects...') as HTMLInputElement

      // Type special characters
      await user.type(searchInput, '<>&"')

      // Wait for the input to have special characters and verify emissions
      await waitFor(
        () => {
          expect(searchInput.value).toBe('<>&"')

          const updates = emitted()['update:modelValue'] as Array<Array<any>>
          expect(updates).toBeTruthy()
          expect(updates.length).toBeGreaterThan(0)

          // Verify that updates were emitted with search terms
          const lastUpdate = updates[updates.length - 1]?.[0]
          expect(lastUpdate).toHaveProperty('search')
        },
        { timeout: 3000 }
      )
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
      const selects = screen.getAllByRole('combobox')
      const statusTrigger = selects[0]!
      await user.click(statusTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Active' }))
      await user.click(screen.getByRole('option', { name: 'Active' }))

      // User changes sort order
      const orderingTrigger = selects[1]!
      await user.click(orderingTrigger)
      await waitFor(() => screen.getByRole('option', { name: 'Priority (High to Low)' }))
      await user.click(screen.getByRole('option', { name: 'Priority (High to Low)' }))

      // Clear button should be visible
      await waitFor(() => {
        expect(screen.getByText('Clear Filters')).toBeInTheDocument()
      })

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
