import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '../ThemeToggle.vue'

// Mock VueUse composable
const mockToggleDark = vi.fn()
const mockIsDark = ref(false)

vi.mock('@/composables/useTheme', () => ({
  useTheme: () => ({
    isDark: mockIsDark,
    toggleDark: mockToggleDark,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsDark.value = false
  })

  it('renders toggle button', () => {
    render(ThemeToggle)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label')
  })

  it('shows sun icon in light mode', () => {
    mockIsDark.value = false

    render(ThemeToggle)

    // Sun icon should be visible
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
  })

  it('shows moon icon in dark mode', () => {
    mockIsDark.value = true

    render(ThemeToggle)

    // Moon icon should be visible
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
  })

  it('calls toggleDark when clicked', async () => {
    render(ThemeToggle)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(mockToggleDark).toHaveBeenCalledOnce()
  })

  it('has proper accessibility attributes', () => {
    render(ThemeToggle)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
    expect(button).toHaveAttribute('type', 'button')
  })
})
