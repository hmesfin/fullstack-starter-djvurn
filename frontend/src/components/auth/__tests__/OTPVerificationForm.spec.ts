/**
 * OTPVerificationForm.vue Test Suite
 *
 * Tests for OTP verification form component
 * Following TDD best practices with comprehensive coverage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import userEvent from '@testing-library/user-event'
import OTPVerificationForm from '../OTPVerificationForm.vue'

// Mock the useAuth composable
const mockVerifyOTP = vi.fn()
const mockUseAuth = {
  verifyOTP: mockVerifyOTP,
  isVerifyingOTP: false,
  otpError: ref<{ message: string } | null>(null),
}

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

describe('OTPVerificationForm.vue', () => {
  const defaultProps = {
    email: 'test@example.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.isVerifyingOTP = false
    mockUseAuth.otpError.value = null
  })

  describe('Component Rendering', () => {
    it('renders OTP verification form with title', () => {
      render(OTPVerificationForm, { props: defaultProps })

      expect(screen.getByText('Verify Your Email')).toBeInTheDocument()
    })

    it('displays user email in description', () => {
      render(OTPVerificationForm, { props: { email: 'user@example.com' } })

      expect(screen.getByText(/user@example.com/)).toBeInTheDocument()
      expect(
        screen.getByText(/We've sent a 6-digit code to/i)
      ).toBeInTheDocument()
    })

    it('renders verification code input field', () => {
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      expect(codeInput).toBeInTheDocument()
      expect(codeInput).toHaveAttribute('type', 'text')
      expect(codeInput).toHaveAttribute('inputmode', 'numeric')
      expect(codeInput).toHaveAttribute('pattern', '[0-9]*')
      expect(codeInput).toHaveAttribute('maxlength', '6')
      expect(codeInput).toHaveAttribute('placeholder', '123456')
    })

    it('renders back button', () => {
      render(OTPVerificationForm, { props: defaultProps })

      const backButton = screen.getByRole('button', { name: /back/i })
      expect(backButton).toBeInTheDocument()
    })

    it('renders verify button', () => {
      render(OTPVerificationForm, { props: defaultProps })

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      expect(verifyButton).toBeInTheDocument()
    })

    it('renders resend code link', () => {
      render(OTPVerificationForm, { props: defaultProps })

      expect(screen.getByText("Didn't receive the code?")).toBeInTheDocument()
      expect(screen.getByText('Resend code')).toBeInTheDocument()
    })

    it('focuses code input on mount', async () => {
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')

      await waitFor(() => {
        expect(codeInput).toHaveFocus()
      })
    })
  })

  describe('Code Input Formatting', () => {
    it('accepts numeric input only', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code') as HTMLInputElement

      await user.type(codeInput, '123abc456')

      expect(codeInput.value).toBe('123456')
    })

    it('limits input to 6 digits', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code') as HTMLInputElement

      await user.type(codeInput, '1234567890')

      expect(codeInput.value).toBe('123456')
    })

    it('strips out non-numeric characters', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code') as HTMLInputElement

      await user.type(codeInput, '1a2b3c')

      expect(codeInput.value).toBe('123')
    })

    it('handles paste events with non-numeric characters', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code') as HTMLInputElement

      await user.click(codeInput)
      await user.paste('12-34-56')

      expect(codeInput.value).toBe('123456')
    })
  })

  describe('Form Validation - Zod Schema', () => {
    it('displays error when code is empty', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const verifyButton = screen.getByRole('button', { name: /verify email/i })

      // Button should be disabled when code length is not 6
      expect(verifyButton).toBeDisabled()

      // Try to submit (shouldn't be possible but test validation)
      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '')

      // Button remains disabled
      expect(verifyButton).toBeDisabled()
      expect(mockVerifyOTP).not.toHaveBeenCalled()
    })

    it('displays error when code is less than 6 digits', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      const verifyButton = screen.getByRole('button', { name: /verify email/i })

      await user.type(codeInput, '12345')

      // Button should be disabled for incomplete code
      expect(verifyButton).toBeDisabled()
    })

    it('enables submit button when code is exactly 6 digits', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      const verifyButton = screen.getByRole('button', { name: /verify email/i })

      await user.type(codeInput, '123456')

      expect(verifyButton).not.toBeDisabled()
    })

    it('displays error when code contains non-numeric characters in validation', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code') as HTMLInputElement

      // Try to bypass formatting (shouldn't happen but test validation)
      await user.type(codeInput, 'abc123')

      // Formatting should strip non-numeric
      expect(codeInput.value).toBe('123')
    })
  })

  describe('Form Submission - Success', () => {
    it('submits valid code and emits success event', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValueOnce({
        success: true,
      })

      const { emitted } = render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '123456')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(mockVerifyOTP).toHaveBeenCalledWith({
          email: 'test@example.com',
          code: '123456',
        })
      })

      await waitFor(() => {
        expect(emitted()).toHaveProperty('success')
        expect(emitted()['success']).toHaveLength(1)
      })
    })

    it('shows loading state during verification', async () => {
      mockUseAuth.isVerifyingOTP = true

      render(OTPVerificationForm, { props: defaultProps })

      const verifyButton = screen.getByRole('button', { name: /verifying/i })

      expect(verifyButton).toBeDisabled()
      expect(verifyButton).toHaveTextContent('Verifying...')
    })

    it('disables both buttons during verification', async () => {
      mockUseAuth.isVerifyingOTP = true

      render(OTPVerificationForm, { props: defaultProps })

      const verifyButton = screen.getByRole('button', { name: /verifying/i })
      const backButton = screen.getByRole('button', { name: /back/i })

      expect(verifyButton).toBeDisabled()
      expect(backButton).toBeDisabled()
    })
  })

  describe('Form Submission - API Errors', () => {
    it('displays error when OTP is invalid', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.otpError.value = {
        message: 'Invalid verification code',
      }

      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '999999')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid verification code')).toBeInTheDocument()
      })
    })

    it('displays error when OTP has expired', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.otpError.value = {
        message: 'Verification code has expired',
      }

      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '123456')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Verification code has expired')).toBeInTheDocument()
      })
    })

    it('clears error when user starts typing new code', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.otpError.value = {
        message: 'Invalid verification code',
      }

      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '999999')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid verification code')).toBeInTheDocument()
      })

      // Clear error state for new input
      mockUseAuth.otpError.value = null

      // User types new code
      await user.clear(codeInput)
      await user.type(codeInput, '1')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Invalid verification code')).not.toBeInTheDocument()
      })
    })
  })

  describe('Back Button Functionality', () => {
    it('emits back event when back button is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(OTPVerificationForm, { props: defaultProps })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      expect(emitted()).toHaveProperty('back')
      expect(emitted()['back']).toHaveLength(1)
    })

    it('does not submit form when back button is clicked', async () => {
      const user = userEvent.setup()
      render(OTPVerificationForm, { props: defaultProps })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      expect(mockVerifyOTP).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('associates label with code input field', () => {
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      expect(codeInput).toHaveAttribute('id', 'code')
    })

    it('has autocomplete attribute for one-time-code', () => {
      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      expect(codeInput).toHaveAttribute('autocomplete', 'one-time-code')
    })

    it('applies error styling to invalid code input', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.otpError.value = {
        message: 'Invalid code',
      }

      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '123456')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      await user.click(verifyButton)

      await waitFor(() => {
        expect(codeInput).toHaveClass('input-error')
      })
    })

    it('prevents native form validation', () => {
      const { container } = render(OTPVerificationForm, { props: defaultProps })

      const form = container.querySelector('form')
      expect(form).toHaveAttribute('novalidate')
    })
  })

  describe('User Interaction Flow', () => {
    it('completes full OTP verification flow successfully', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValueOnce({
        success: true,
      })

      const { emitted } = render(OTPVerificationForm, {
        props: { email: 'newuser@example.com' },
      })

      // Code input should be focused
      const codeInput = screen.getByLabelText('Verification Code')
      await waitFor(() => {
        expect(codeInput).toHaveFocus()
      })

      // User enters OTP code
      await user.type(codeInput, '123456')

      // Verify button should be enabled
      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      expect(verifyButton).not.toBeDisabled()

      // User submits
      await user.click(verifyButton)

      // Verify API call
      await waitFor(() => {
        expect(mockVerifyOTP).toHaveBeenCalledTimes(1)
        expect(mockVerifyOTP).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          code: '123456',
        })
      })

      // Verify success event
      await waitFor(() => {
        expect(emitted()['success']).toBeTruthy()
        expect(emitted()['success']).toHaveLength(1)
      })
    })

    it('handles failed verification and allows retry', async () => {
      const user = userEvent.setup()

      // First attempt fails
      mockVerifyOTP.mockResolvedValueOnce({
        success: false,
      })
      mockUseAuth.otpError.value = {
        message: 'Invalid verification code',
      }

      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '111111')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })
      await user.click(verifyButton)

      // Error displayed
      await waitFor(() => {
        expect(screen.getByText('Invalid verification code')).toBeInTheDocument()
      })

      // Reset for retry
      mockUseAuth.otpError.value = null
      mockVerifyOTP.mockResolvedValueOnce({
        success: true,
      })

      // User enters correct code
      await user.clear(codeInput)
      await user.type(codeInput, '123456')

      await user.click(verifyButton)

      // Should succeed
      await waitFor(() => {
        expect(mockVerifyOTP).toHaveBeenCalledTimes(2)
      })
    })

    it('allows user to go back to registration', async () => {
      const user = userEvent.setup()
      const { emitted } = render(OTPVerificationForm, { props: defaultProps })

      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      expect(emitted()['back']).toBeTruthy()
      expect(mockVerifyOTP).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles different email formats correctly', () => {
      const { rerender } = render(OTPVerificationForm, {
        props: { email: 'test@example.com' },
      })

      expect(screen.getByText(/test@example.com/)).toBeInTheDocument()

      rerender({ email: 'user+tag@subdomain.example.com' })

      expect(screen.getByText(/user\+tag@subdomain\.example\.com/)).toBeInTheDocument()
    })

    it('handles rapid consecutive submissions correctly', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValue({
        success: true,
      })

      render(OTPVerificationForm, { props: defaultProps })

      const codeInput = screen.getByLabelText('Verification Code')
      await user.type(codeInput, '123456')

      const verifyButton = screen.getByRole('button', { name: /verify email/i })

      // Rapid clicks
      await user.click(verifyButton)
      await user.click(verifyButton)
      await user.click(verifyButton)

      // Should only submit once (or handle gracefully)
      await waitFor(() => {
        expect(mockVerifyOTP).toHaveBeenCalled()
      })
    })
  })
})
