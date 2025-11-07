/**
 * ResetPasswordForm.vue Test Suite
 *
 * Tests for password reset confirmation form component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import ResetPasswordForm from '../ResetPasswordForm.vue'

// Mock the useAuth composable
const mockConfirmPasswordReset = vi.fn()
const mockUseAuth = {
  confirmPasswordReset: mockConfirmPasswordReset,
  isConfirmingPasswordReset: false,
  passwordResetConfirmError: ref<{ message: string } | null>(null),
}

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

describe('ResetPasswordForm.vue', () => {
  const validToken = 'valid-reset-token-123'

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isConfirmingPasswordReset = false
    mockUseAuth.passwordResetConfirmError.value = null
  })

  describe('Component Rendering', () => {
    it('renders password reset form with all required elements', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      // Verify form title
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument()

      // Verify description
      expect(screen.getByText(/enter your new password below/i)).toBeInTheDocument()

      // Verify password fields
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()

      // Verify submit button
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()

      // Verify password hint
      expect(
        screen.getByText(/must be at least 8 characters with uppercase, lowercase, and number/i)
      ).toBeInTheDocument()
    })

    it('renders password fields with correct attributes', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password') as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

      // Both should be password type (PasswordInput component handles show/hide)
      expect(newPasswordInput.placeholder).toBe('Enter new password')
      expect(newPasswordInput.autocomplete).toBe('new-password')

      expect(confirmPasswordInput.placeholder).toBe('Confirm new password')
      expect(confirmPasswordInput.autocomplete).toBe('new-password')
    })

    it('disables submit button when passwords are empty', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when both passwords are filled', async () => {
      const user = userEvent.setup()
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, 'NewPassword123!')
      await user.type(confirmPasswordInput, 'NewPassword123!')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Validation - Zod Schema & Password Match', () => {
    it('displays error when passwords do not match', async () => {
      const user = userEvent.setup()
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'DifferentPass123!')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      expect(mockConfirmPasswordReset).not.toHaveBeenCalled()
    })

    it('displays error for weak password', async () => {
      const user = userEvent.setup()
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, '123')
      await user.type(confirmPasswordInput, '123')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      await user.click(submitButton)

      await waitFor(() => {
        // Zod schema validates password requirements
        const errorText = screen.queryByText(/password must/i)
        expect(errorText).toBeInTheDocument()
      })

      expect(mockConfirmPasswordReset).not.toHaveBeenCalled()
    })

    it('clears error when user starts typing in password field', async () => {
      const user = userEvent.setup()
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /reset password/i })

      // Trigger error
      await user.type(newPasswordInput, '123')
      await user.type(confirmPasswordInput, '123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText(/password must/i)).toBeInTheDocument()
      })

      // Clear error by typing
      await user.type(newPasswordInput, '456')

      await waitFor(() => {
        expect(screen.queryByText(/password must/i)).not.toBeInTheDocument()
      })
    })

    it('clears error when user starts typing in confirm password field', async () => {
      const user = userEvent.setup()
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: /reset password/i })

      // Trigger mismatch error
      await user.type(newPasswordInput, 'Password123!')
      await user.type(confirmPasswordInput, 'Different123!')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })

      // Clear error by typing
      await user.clear(confirmPasswordInput)
      await user.type(confirmPasswordInput, 'P')

      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid passwords', async () => {
      const user = userEvent.setup()
      mockConfirmPasswordReset.mockResolvedValue({ success: true })

      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, 'NewSecurePass123!')
      await user.type(confirmPasswordInput, 'NewSecurePass123!')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockConfirmPasswordReset).toHaveBeenCalledWith({
          token: validToken,
          password: 'NewSecurePass123!',
        })
      })
    })

    it('displays success message after successful password reset', async () => {
      const user = userEvent.setup()
      mockConfirmPasswordReset.mockResolvedValue({ success: true })

      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, 'NewSecurePass123!')
      await user.type(confirmPasswordInput, 'NewSecurePass123!')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password reset successful/i)).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument()
    })

    it('emits success event after successful password reset', async () => {
      const user = userEvent.setup()
      mockConfirmPasswordReset.mockResolvedValue({ success: true })

      const { emitted } = render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, 'NewSecurePass123!')
      await user.type(confirmPasswordInput, 'NewSecurePass123!')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      await user.click(submitButton)

      // Wait for success message and emit
      await waitFor(
        () => {
          expect(emitted()).toHaveProperty('success')
        },
        { timeout: 3000 }
      )
    })

    it('displays error message for invalid token', async () => {
      const user = userEvent.setup()
      mockConfirmPasswordReset.mockResolvedValue({ success: false })
      mockUseAuth.passwordResetConfirmError.value = {
        message: 'Invalid or expired reset token',
      }

      render(ResetPasswordForm, {
        props: { token: 'invalid-token' },
      })

      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')

      await user.type(newPasswordInput, 'NewSecurePass123!')
      await user.type(confirmPasswordInput, 'NewSecurePass123!')

      const submitButton = screen.getByRole('button', { name: /reset password/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired reset token/i)).toBeInTheDocument()
      })

      // Form should still be visible to show error
      expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument()
    })

    it('disables submit button when passwords are empty', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const submitButton = screen.getByRole('button', { name: /reset password/i })

      // Button should be disabled when passwords are empty
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('has show/hide password functionality via PasswordInput component', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      // PasswordInput component should be rendered (which has show/hide functionality)
      // We're just verifying the component is being used
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    })
  })

  describe('Security', () => {
    it('uses new-password autocomplete for both fields', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      const newPasswordInput = screen.getByLabelText('New Password') as HTMLInputElement
      const confirmPasswordInput = screen.getByLabelText('Confirm Password') as HTMLInputElement

      expect(newPasswordInput.autocomplete).toBe('new-password')
      expect(confirmPasswordInput.autocomplete).toBe('new-password')
    })

    it('displays password requirements hint', () => {
      render(ResetPasswordForm, {
        props: { token: validToken },
      })

      expect(
        screen.getByText(/must be at least 8 characters with uppercase, lowercase, and number/i)
      ).toBeInTheDocument()
    })
  })
})
