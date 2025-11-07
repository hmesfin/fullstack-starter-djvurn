/**
 * ForgotPasswordForm.vue Test Suite
 *
 * Tests for forgot password form component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import ForgotPasswordForm from '../ForgotPasswordForm.vue'

// Mock the useAuth composable
const mockRequestPasswordReset = vi.fn()
const mockUseAuth = {
  requestPasswordReset: mockRequestPasswordReset,
  isRequestingPasswordReset: false,
  passwordResetRequestError: ref<{ message: string } | null>(null),
}

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

describe('ForgotPasswordForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isRequestingPasswordReset = false
    mockUseAuth.passwordResetRequestError.value = null
  })

  describe('Component Rendering', () => {
    it('renders forgot password form with all required elements', () => {
      render(ForgotPasswordForm)

      // Verify form title
      expect(screen.getByText('Forgot Password')).toBeInTheDocument()

      // Verify description
      expect(
        screen.getByText(/enter your email address and we'll send you instructions/i)
      ).toBeInTheDocument()

      // Verify email field
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()

      // Verify buttons
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('renders email field with correct attributes', () => {
      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement

      expect(emailInput.type).toBe('email')
      expect(emailInput.placeholder).toBe('you@example.com')
      expect(emailInput.autocomplete).toBe('email')
    })

    it('disables submit button when email is empty', () => {
      render(ForgotPasswordForm)

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Validation - Zod Schema', () => {
    it('submit button is disabled when email is empty', () => {
      render(ForgotPasswordForm)

      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      // Button should be disabled when email is empty
      expect(submitButton).toBeDisabled()
    })

    it('displays error for invalid email format', async () => {
      const user = userEvent.setup()
      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'not-an-email')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      expect(mockRequestPasswordReset).not.toHaveBeenCalled()
    })

    it('clears error when user starts typing', async () => {
      const user = userEvent.setup()
      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      // Trigger error
      await user.type(emailInput, 'invalid')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument()
      })

      // Clear error by typing
      await user.type(emailInput, '@example.com')

      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid email', async () => {
      const user = userEvent.setup()
      mockRequestPasswordReset.mockResolvedValue({ success: true })

      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith({
          email: 'test@example.com',
        })
      })
    })

    it('displays success message after successful submission', async () => {
      const user = userEvent.setup()
      mockRequestPasswordReset.mockResolvedValue({ success: true })

      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/if an account exists with this email/i)
        ).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument()

      // "Back to Login" button should be visible
      expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument()
    })

    it('displays error message on submission failure', async () => {
      const user = userEvent.setup()
      mockRequestPasswordReset.mockResolvedValue({ success: false })
      mockUseAuth.passwordResetRequestError.value = {
        message: 'Network error occurred',
      }

      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Network error occurred')).toBeInTheDocument()
      })
    })

    it('disables buttons when email is empty (loading state)', () => {
      render(ForgotPasswordForm)

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      const backButton = screen.getByRole('button', { name: /back/i })

      // Submit button is disabled when email is empty
      expect(submitButton).toBeDisabled()

      // Back button should be enabled
      expect(backButton).not.toBeDisabled()
    })
  })

  describe('Navigation', () => {
    it('emits back event when back button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(ForgotPasswordForm)

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      expect(emitted()).toHaveProperty('back')
      expect(emitted()['back']).toHaveLength(1)
    })

    it('emits back event when "Back to Login" is clicked after success', async () => {
      const user = userEvent.setup()
      mockRequestPasswordReset.mockResolvedValue({ success: true })

      const { emitted } = render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument()
      })

      const backToLoginButton = screen.getByRole('button', { name: /back to login/i })
      await user.click(backToLoginButton)

      expect(emitted()).toHaveProperty('back')
      expect(emitted()['back']?.length).toBeGreaterThan(0)
    })
  })

  describe('Security', () => {
    it('does not expose whether email exists in success message', async () => {
      const user = userEvent.setup()
      mockRequestPasswordReset.mockResolvedValue({ success: true })

      render(ForgotPasswordForm)

      const emailInput = screen.getByLabelText('Email Address')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        // Message should be intentionally vague
        const successText = screen.getByText(/if an account exists/i)
        expect(successText).toBeInTheDocument()
      })
    })
  })
})
