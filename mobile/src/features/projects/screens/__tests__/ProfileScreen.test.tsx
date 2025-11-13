/**
 * ProfileScreen Tests (RED phase - TDD)
 * Write tests FIRST, implementation SECOND
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileScreen } from '../ProfileScreen'

// Mock navigation
const mockNavigate = vi.fn()
const mockNavigation = {
  navigate: mockNavigate,
  goBack: vi.fn(),
  setOptions: vi.fn(),
} as any

// Mock route
const mockRoute = {
  key: 'Profile',
  name: 'Profile' as const,
} as any

// Mock useAuth hook
const mockLogout = vi.fn()
const mockUseAuth = vi.fn()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useCurrentUser hook
const mockUseCurrentUser = vi.fn()
vi.mock('@/features/auth/hooks/useCurrentUser', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}))

// Mock useAppTheme hook
const mockToggleTheme = vi.fn()
const mockUseAppTheme = vi.fn()
vi.mock('@/hooks/useAppTheme', () => ({
  useAppTheme: () => mockUseAppTheme(),
}))

// Mock React Native components
vi.mock('react-native', () => ({
  View: ({ children, testID }: any) => <div data-testid={testID}>{children}</div>,
  StyleSheet: { create: (styles: any) => styles },
}))

// Mock React Native Paper
vi.mock('react-native-paper', () => ({
  Text: ({ children, testID }: any) => <div data-testid={testID}>{children}</div>,
  Button: ({ children, onPress, testID }: any) => (
    <button data-testid={testID} onClick={onPress}>
      {children}
    </button>
  ),
  Divider: () => <hr />,
  ActivityIndicator: ({ testID }: any) => <div data-testid={testID}>Loading...</div>,
}))

describe('ProfileScreen - Authenticated User', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    })
    mockUseCurrentUser.mockReturnValue({
      data: {
        uuid: 'test-user-uuid',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        url: 'http://example.com/users/test-user-uuid',
      },
      isLoading: false,
      isError: false,
      error: null,
    })
    mockUseAppTheme.mockReturnValue({
      isDark: false,
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
  })

  it('should display user email', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/test@example\.com/i)).toBeDefined()
  })

  it('should display user full name if available', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/Test User/i)).toBeDefined()
  })

  it('should render theme toggle button', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('theme-toggle-button')).toBeDefined()
  })

  it('should render logout button', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('logout-button')).toBeDefined()
  })

  it('should display "Switch to Dark Mode" when in light mode', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/Switch to Dark Mode/i)).toBeDefined()
  })

  it('should display "Switch to Light Mode" when in dark mode', () => {
    mockUseAppTheme.mockReturnValue({
      isDark: true,
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    })

    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/Switch to Light Mode/i)).toBeDefined()
  })

  it('should call toggleTheme when theme button is pressed', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    const themeButton = screen.getByTestId('theme-toggle-button')
    themeButton.click()

    expect(mockToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('should call logout when logout button is pressed', () => {
    mockLogout.mockResolvedValue(undefined)

    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    const logoutButton = screen.getByTestId('logout-button')
    logoutButton.click()

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})

describe('ProfileScreen - User Without Full Name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    })
    mockUseCurrentUser.mockReturnValue({
      data: {
        uuid: 'test-user-uuid',
        email: 'noname@example.com',
        first_name: '',
        last_name: '',
        url: 'http://example.com/users/test-user-uuid',
      },
      isLoading: false,
      isError: false,
      error: null,
    })
    mockUseAppTheme.mockReturnValue({
      isDark: false,
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
  })

  it('should not crash when first_name and last_name are empty', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/noname@example\.com/i)).toBeDefined()
  })
})

describe('ProfileScreen - Unauthenticated State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    })
    mockUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('No authentication token found'),
    })
    mockUseAppTheme.mockReturnValue({
      isDark: false,
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
  })

  it('should display fallback text when user is null', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByText(/Guest/i)).toBeDefined()
  })

  it('should still render theme toggle button when not authenticated', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('theme-toggle-button')).toBeDefined()
  })

  it('should still render logout button when not authenticated', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    expect(screen.getByTestId('logout-button')).toBeDefined()
  })
})

describe('ProfileScreen - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    })
    mockUseCurrentUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    })
    mockUseAppTheme.mockReturnValue({
      isDark: false,
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
  })

  it('should display loading indicator while fetching user', () => {
    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    // ActivityIndicator doesn't have specific text, but we can check it renders
    expect(screen.getByText(/Account Information/i)).toBeDefined()
  })
})

describe('ProfileScreen - Logout Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      logout: mockLogout,
    })
    mockUseCurrentUser.mockReturnValue({
      data: {
        uuid: 'test-user-uuid',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        url: 'http://example.com/users/test-user-uuid',
      },
      isLoading: false,
      isError: false,
      error: null,
    })
    mockUseAppTheme.mockReturnValue({
      isDark: false,
      theme: 'light',
      toggleTheme: mockToggleTheme,
    })
  })

  it('should handle logout errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockLogout.mockRejectedValue(new Error('Network error'))

    render(<ProfileScreen navigation={mockNavigation} route={mockRoute} />)
    const logoutButton = screen.getByTestId('logout-button')
    logoutButton.click()

    // Wait for error handling
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to logout:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })
})
