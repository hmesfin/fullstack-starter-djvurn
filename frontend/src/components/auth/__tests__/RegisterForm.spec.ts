/**
 * RegisterForm.vue Test Suite
 *
 * Tests for user registration form component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../RegisterForm.vue'

// Mock the useAuth composable
const mockRegister = vi.fn()
const mockUseAuth = {
  register: mockRegister,
  isRegistering: false,
  registerError: ref<{ message: string; details?: Record<string, string[]> | null } | null>(null),
}

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

describe('RegisterForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isRegistering = false
    mockUseAuth.registerError.value = null
  })

  describe('Component Rendering', () => {
    it('renders registration form with all required fields', () => {
      render(RegisterForm)

      // Verify form title
      expect(screen.getByText('Create Account')).toBeInTheDocument()

      // Verify all form fields are present
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()

      // Verify submit button
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('renders all input fields with correct types and placeholders', () => {
      render(RegisterForm)

      const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement
      const lastNameInput = screen.getByLabelText('Last Name') as HTMLInputElement
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

      expect(firstNameInput.type).toBe('text')
      expect(firstNameInput.placeholder).toBe('John')

      expect(lastNameInput.type).toBe('text')
      expect(lastNameInput.placeholder).toBe('Doe')

      expect(emailInput.type).toBe('email')
      expect(emailInput.placeholder).toBe('john@example.com')

      expect(passwordInput.type).toBe('password')
      expect(passwordInput.placeholder).toBe('••••••••')
    })

    it('renders sign in link for existing users', () => {
      render(RegisterForm)

      const signInLink = screen.getByText('Sign in')
      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Form Validation - Zod Schema', () => {
    it('displays error when first name is empty', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
      })

      // Should not call register API
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('displays error when last name is empty', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const firstNameInput = screen.getByLabelText('First Name')
      await user.type(firstNameInput, 'John')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('displays error when email is empty', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('displays error when email format is invalid', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('displays error when password is empty', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('displays all validation errors when all fields are empty', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
        expect(screen.getByText('Last name is required')).toBeInTheDocument()
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
      })

      expect(mockRegister).not.toHaveBeenCalled()
    })
  })

  describe('Field Error Clearing', () => {
    it('clears first name error when user starts typing', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument()
      })

      // Start typing in first name field
      const firstNameInput = screen.getByLabelText('First Name')
      await user.type(firstNameInput, 'J')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('First name is required')).not.toBeInTheDocument()
      })
    })

    it('clears email error when user starts typing', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'j')

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission - Success', () => {
    it('submits valid form data and emits success event with email', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({
        success: true,
        email: 'john@example.com',
      })

      const { emitted } = render(RegisterForm)

      // Fill in all fields with valid data
      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'SecurePassword123!')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Verify register was called with correct data
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'SecurePassword123!',
        })
      })

      // Verify success event was emitted
      await waitFor(() => {
        expect(emitted()).toHaveProperty('success')
        const successEvents = emitted()['success']
        expect(successEvents).toBeDefined()
        expect(successEvents?.[0]).toEqual(['john@example.com'])
      })
    })

    it('shows loading state during registration', async () => {
      mockUseAuth.isRegistering = true
      mockRegister.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
      )

      render(RegisterForm)

      const submitButton = screen.getByRole('button', { name: /creating account/i })

      // Button should be disabled
      expect(submitButton).toBeDisabled()

      // Button text should show loading state
      expect(submitButton).toHaveTextContent('Creating Account...')
    })
  })

  describe('Form Submission - API Errors', () => {
    it('displays field-specific errors from API response', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.registerError.value = {
        message: 'Registration failed',
        details: {
          email: ['This email is already registered'],
          password: ['Password is too weak'],
        },
      }

      render(RegisterForm)

      // Fill in form
      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'weak')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Verify API errors are displayed
      await waitFor(() => {
        expect(screen.getByText('This email is already registered')).toBeInTheDocument()
        expect(screen.getByText('Password is too weak')).toBeInTheDocument()
      })
    })

    it('displays general error message when API fails without field details', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.registerError.value = {
        message: 'Network error occurred',
        details: null,
      }

      render(RegisterForm)

      // Fill in form
      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'SecurePassword123!')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Verify general error is displayed
      await waitFor(() => {
        expect(screen.getByText('Network error occurred')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('associates labels with input fields correctly', () => {
      render(RegisterForm)

      const firstNameInput = screen.getByLabelText('First Name')
      const lastNameInput = screen.getByLabelText('Last Name')
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      expect(firstNameInput).toHaveAttribute('id', 'first_name')
      expect(lastNameInput).toHaveAttribute('id', 'last_name')
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('applies error styling to invalid fields', async () => {
      const user = userEvent.setup()
      render(RegisterForm)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        const firstNameInput = screen.getByLabelText('First Name')
        expect(firstNameInput).toHaveClass('border-destructive')
      })
    })

    it('has proper autocomplete attributes', () => {
      render(RegisterForm)

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('autocomplete', 'email')
      expect(passwordInput).toHaveAttribute('autocomplete', 'new-password')
    })

    it('prevents native form validation', () => {
      const { container } = render(RegisterForm)

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('novalidate')
    })
  })

  describe('User Interaction Flow', () => {
    it('completes full registration flow successfully', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce({
        success: true,
        email: 'newuser@example.com',
      })

      const { emitted } = render(RegisterForm)

      // User fills out the form
      await user.type(screen.getByLabelText('First Name'), 'Jane')
      await user.type(screen.getByLabelText('Last Name'), 'Smith')
      await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
      await user.type(screen.getByLabelText('Password'), 'MySecurePass123!')

      // User submits
      await user.click(screen.getByRole('button', { name: /create account/i }))

      // Verify API call
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledTimes(1)
        expect(mockRegister).toHaveBeenCalledWith({
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'newuser@example.com',
          password: 'MySecurePass123!',
        })
      })

      // Verify success event
      await waitFor(() => {
        expect(emitted()['success']).toBeTruthy()
        const successEvents = emitted()['success']
        expect(successEvents).toBeDefined()
        expect(successEvents?.[0]).toEqual(['newuser@example.com'])
      })
    })
  })
})
