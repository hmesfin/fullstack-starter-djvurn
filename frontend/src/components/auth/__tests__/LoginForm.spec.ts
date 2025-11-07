/**
 * LoginForm.vue Test Suite
 *
 * Tests for user login form component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/vue'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm.vue'

// Mock the useAuth composable
const mockLogin = vi.fn()
const mockUseAuth = {
  login: mockLogin,
  isLoggingIn: false,
  loginError: ref<{ message: string; details?: Record<string, string[]> | null } | null>(null),
}

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

// Render helper with router stub
function renderWithStubs(component: any) {
  return render(component, {
    global: {
      stubs: {
        RouterLink: {
          template: '<a :href="href"><slot /></a>',
          props: ['to'],
          computed: {
            href(): string {
              if (typeof this.to === 'string') return this.to
              if (typeof this.to === 'object' && this.to.name) {
                // Convert route name to path
                const routeMap: Record<string, string> = {
                  'forgot-password': '/forgot-password',
                  'register': '/register',
                }
                return routeMap[this.to.name] || '#'
              }
              return '#'
            },
          },
        },
      },
    },
  })
}

describe('LoginForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isLoggingIn = false
    mockUseAuth.loginError.value = null
  })

  afterEach(() => {
    cleanup()
  })

  describe('Component Rendering', () => {
    it('renders login form with all required fields', () => {
      renderWithStubs(LoginForm)

      // Verify form title
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()

      // Verify form fields
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()

      // Verify submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('renders email and password fields with correct attributes', () => {
      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

      expect(emailInput.type).toBe('email')
      expect(emailInput.placeholder).toBe('john@example.com')
      expect(emailInput.autocomplete).toBe('email')

      expect(passwordInput.type).toBe('password')
      expect(passwordInput.placeholder).toBe('••••••••')
      expect(passwordInput.autocomplete).toBe('current-password')
    })

    it('renders remember me checkbox', () => {
      renderWithStubs(LoginForm)

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('renders forgot password link', () => {
      renderWithStubs(LoginForm)

      const forgotPasswordLink = screen.getByText('Forgot password?')
      expect(forgotPasswordLink).toBeInTheDocument()
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })

    it('renders sign up link for new users', () => {
      renderWithStubs(LoginForm)

      const signUpLink = screen.getByText('Sign up')
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Form Validation - Zod Schema', () => {
    it('displays error when email is empty', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('displays error when email format is invalid', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'not-an-email')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('displays error when password is empty', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('displays both validation errors when all fields are empty', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('Field Error Clearing', () => {
    it('clears email error when user starts typing', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 't')

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
      })
    })

    it('clears password error when user starts typing', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'p')

      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Remember Me Functionality', () => {
    it('toggles remember me checkbox when clicked', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('Form Submission - Success', () => {
    it('submits valid form data and emits success event', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({
        success: true,
      })

      const { emitted } = renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'MyPassword123!')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'MyPassword123!',
        })
      })

      await waitFor(() => {
        expect(emitted()).toHaveProperty('success')
        expect(emitted()['success']).toHaveLength(1)
      })
    })

    it('shows loading state during login', async () => {
      mockUseAuth.isLoggingIn = true

      renderWithStubs(LoginForm)

      const submitButton = screen.getByRole('button', { name: /signing in/i })

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Signing In...')
    })
  })

  describe('Form Submission - API Errors', () => {
    it('displays field-specific errors from API response', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.loginError.value = {
        message: 'Login failed',
        details: {
          email: ['Email not found'],
          password: ['Incorrect password'],
        },
      }

      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(emailInput, 'nonexistent@example.com')
      await user.type(passwordInput, 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument()
        expect(screen.getByText('Incorrect password')).toBeInTheDocument()
      })
    })

    it('displays general error message when API fails without field details', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.loginError.value = {
        message: 'Invalid credentials',
        details: null,
      }

      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('displays network error when API is unreachable', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.loginError.value = {
        message: 'Network error: Unable to connect to server',
        details: null,
      }

      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error: Unable to connect to server')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('associates labels with input fields correctly', () => {
      renderWithStubs(LoginForm)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('applies error styling to invalid fields', async () => {
      const user = userEvent.setup()
      renderWithStubs(LoginForm)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')

        expect(emailInput).toHaveClass('border-destructive')
        expect(passwordInput).toHaveClass('border-destructive')
      })
    })

    it('prevents native form validation', () => {
      const { container } = renderWithStubs(LoginForm)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('novalidate')
    })

    it('has accessible checkbox label', () => {
      renderWithStubs(LoginForm)

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i })
      expect(checkbox).toBeInTheDocument()
    })
  })

  describe('User Interaction Flow', () => {
    it('completes full login flow successfully', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce({
        success: true,
      })

      const { emitted } = renderWithStubs(LoginForm)

      // User fills in credentials
      await user.type(screen.getByLabelText('Email'), 'user@example.com')
      await user.type(screen.getByLabelText('Password'), 'SecurePassword123')

      // User checks remember me
      await user.click(screen.getByRole('checkbox', { name: /remember me/i }))

      // User submits form
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Verify API call
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1)
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'SecurePassword123',
        })
      })

      // Verify success event
      await waitFor(() => {
        expect(emitted()['success']).toBeTruthy()
        expect(emitted()['success']).toHaveLength(1)
      })
    })

    it('handles failed login and allows retry', async () => {
      const user = userEvent.setup()

      // First attempt fails
      mockLogin.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.loginError.value = {
        message: 'Invalid credentials',
        details: null,
      }

      renderWithStubs(LoginForm)

      await user.type(screen.getByLabelText('Email'), 'user@example.com')
      await user.type(screen.getByLabelText('Password'), 'WrongPassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Reset mock for second attempt
      mockUseAuth.loginError.value = null
      mockLogin.mockResolvedValueOnce({
        success: true,
      })

      // User corrects password
      const passwordInput = screen.getByLabelText('Password')
      await user.clear(passwordInput)
      await user.type(passwordInput, 'CorrectPassword')

      // Submit again
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Should succeed this time
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(2)
      })
    })
  })
})
