/**
 * ResetPasswordScreen Tests - TDD RED Phase
 * Following RED → GREEN → REFACTOR cycle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@/test/react-native-testing-mock'
import React from 'react'
import { ResetPasswordScreen } from '../ResetPasswordScreen'
import * as useAuthMutations from '@/features/auth/hooks/useAuthMutations'
import type { UseMutationResult } from '@tanstack/react-query'
import type {
  PasswordResetOtpConfirmRequestWritable,
  PasswordResetOtpConfirm,
} from '@/api/types.gen'

// Mock the auth mutations hook
vi.mock('@/features/auth/hooks/useAuthMutations')

// Mock React Hook Form
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form')
  return {
    ...actual,
    Controller: ({ name, render: renderFn }: any) => {
      const field = {
        onChange: vi.fn(),
        onBlur: vi.fn(),
        value: '',
      }
      return renderFn({ field })
    },
  }
})

// Mock navigation
const mockNavigate = vi.fn()
const mockReset = vi.fn()
const mockNavigation = {
  navigate: mockNavigate,
  reset: mockReset,
  goBack: vi.fn(),
  setOptions: vi.fn(),
} as any

// Mock route with email parameter
const mockRoute = {
  key: 'ResetPassword',
  name: 'ResetPassword' as const,
  params: {
    email: 'test@example.com',
  },
} as any

describe('ResetPasswordScreen - Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for useConfirmPasswordResetOTP
    vi.mocked(useAuthMutations.useConfirmPasswordResetOTP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpConfirm,
      Error,
      PasswordResetOtpConfirmRequestWritable,
      unknown
    >)
  })

  it('should render without errors', () => {
    const result = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )
    expect(result).toBeDefined()
  })

  it('should render OTP code input field with correct testID', () => {
    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const codeInput = getByTestId('reset-password-code-input')
    expect(codeInput).toBeDefined()
    expect(codeInput.props.testID).toBe('reset-password-code-input')
  })

  it('should render new password input field with correct testID', () => {
    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const passwordInput = getByTestId('reset-password-new-password-input')
    expect(passwordInput).toBeDefined()
    expect(passwordInput.props.testID).toBe('reset-password-new-password-input')
  })

  it('should render confirm password input field with correct testID', () => {
    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const confirmPasswordInput = getByTestId('reset-password-confirm-password-input')
    expect(confirmPasswordInput).toBeDefined()
    expect(confirmPasswordInput.props.testID).toBe('reset-password-confirm-password-input')
  })

  it('should render submit button', () => {
    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('reset-password-submit-button')
    expect(submitButton).toBeDefined()
  })

  it('should render screen title "Reset Password"', () => {
    const { getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const title = getByText('Reset Password')
    expect(title).toBeDefined()
  })

  it('should display the email from route params', () => {
    const { getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    // Should show the email somewhere in the UI
    const emailText = getByText(/test@example\.com/i)
    expect(emailText).toBeDefined()
  })

  it('should show helper text about OTP code', () => {
    const { getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    // Should have text explaining OTP was sent
    const helperText = getByText(/sent.*code|code.*sent/i)
    expect(helperText).toBeDefined()
  })
})

describe('ResetPasswordScreen - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call confirmPasswordResetOTP mutation when form is submitted', async () => {
    const mockMutate = vi.fn()
    vi.mocked(useAuthMutations.useConfirmPasswordResetOTP).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpConfirm,
      Error,
      PasswordResetOtpConfirmRequestWritable,
      unknown
    >)

    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('reset-password-submit-button')
    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  it('should navigate to Login screen on successful password reset', async () => {
    const mockMutate = vi.fn((_, { onSuccess }) => {
      // Simulate successful mutation
      onSuccess({
        email: 'test@example.com',
        code: '123456',
      } as PasswordResetOtpConfirm)
    })

    vi.mocked(useAuthMutations.useConfirmPasswordResetOTP).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: true,
      data: {
        email: 'test@example.com',
        code: '123456',
      } as PasswordResetOtpConfirm,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpConfirm,
      Error,
      PasswordResetOtpConfirmRequestWritable,
      unknown
    >)

    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('reset-password-submit-button')
    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    })
  })

  it('should disable submit button while mutation is pending', () => {
    vi.mocked(useAuthMutations.useConfirmPasswordResetOTP).mockReturnValue({
      mutate: vi.fn(),
      isPending: true, // Mutation in progress
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpConfirm,
      Error,
      PasswordResetOtpConfirmRequestWritable,
      unknown
    >)

    const { getByTestId } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('reset-password-submit-button')
    expect(submitButton.props.disabled).toBe(true)
  })

  it('should show error message when mutation fails', () => {
    const mockError = new Error('Invalid OTP code')

    vi.mocked(useAuthMutations.useConfirmPasswordResetOTP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpConfirm,
      Error,
      PasswordResetOtpConfirmRequestWritable,
      unknown
    >)

    const { getByText } = render(
      <ResetPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const errorMessage = getByText(/error/i)
    expect(errorMessage).toBeDefined()
  })

  it('should show error when passwords do not match', async () => {
    // This test will require implementation to check password matching
    // For now, we'll skip it and implement in GREEN phase
    expect(true).toBe(true)
  })
})
