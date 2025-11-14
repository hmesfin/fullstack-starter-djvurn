/**
 * ForgotPasswordScreen Tests - TDD RED Phase
 * Following RED → GREEN → REFACTOR cycle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@/test/react-native-testing-mock'
import React from 'react'
import { ForgotPasswordScreen } from '../ForgotPasswordScreen'
import * as useAuthMutations from '@/features/auth/hooks/useAuthMutations'
import type { UseMutationResult } from '@tanstack/react-query'
import type {
  PasswordResetOtpRequestRequest,
  PasswordResetOtpRequest,
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
const mockNavigation = {
  navigate: mockNavigate,
  goBack: vi.fn(),
  setOptions: vi.fn(),
} as any

// Mock route
const mockRoute = {
  key: 'ForgotPassword',
  name: 'ForgotPassword' as const,
  params: undefined,
} as any

describe('ForgotPasswordScreen - Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for useRequestPasswordResetOTP
    vi.mocked(useAuthMutations.useRequestPasswordResetOTP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpRequest,
      Error,
      PasswordResetOtpRequestRequest,
      unknown
    >)
  })

  it('should render without errors', () => {
    const result = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )
    expect(result).toBeDefined()
  })

  it('should render email input field with correct testID', () => {
    const { getByTestId } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const emailInput = getByTestId('forgot-password-email-input')
    expect(emailInput).toBeDefined()
    expect(emailInput.props.testID).toBe('forgot-password-email-input')
  })

  it('should render submit button', () => {
    const { getByTestId } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('forgot-password-submit-button')
    expect(submitButton).toBeDefined()
  })

  it('should render screen title "Forgot Password"', () => {
    const { getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const title = getByText('Forgot Password')
    expect(title).toBeDefined()
  })

  it('should show helper text explaining the process', () => {
    const { getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    // Should have some descriptive text
    const helperText = getByText(/enter your email/i)
    expect(helperText).toBeDefined()
  })
})

describe('ForgotPasswordScreen - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call requestPasswordResetOTP mutation with email when form is submitted', async () => {
    const mockMutate = vi.fn()
    vi.mocked(useAuthMutations.useRequestPasswordResetOTP).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpRequest,
      Error,
      PasswordResetOtpRequestRequest,
      unknown
    >)

    const { getByTestId } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('forgot-password-submit-button')
    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  it('should navigate to ResetPassword screen on successful OTP request', async () => {
    const mockMutate = vi.fn((_, { onSuccess }) => {
      // Simulate successful mutation
      onSuccess({ email: 'test@example.com' } as PasswordResetOtpRequest)
    })

    vi.mocked(useAuthMutations.useRequestPasswordResetOTP).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: true,
      data: { email: 'test@example.com' } as PasswordResetOtpRequest,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpRequest,
      Error,
      PasswordResetOtpRequestRequest,
      unknown
    >)

    const { getByTestId } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('forgot-password-submit-button')
    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('ResetPassword', {
        email: expect.any(String),
      })
    })
  })

  it('should disable submit button while mutation is pending', () => {
    vi.mocked(useAuthMutations.useRequestPasswordResetOTP).mockReturnValue({
      mutate: vi.fn(),
      isPending: true, // Mutation in progress
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpRequest,
      Error,
      PasswordResetOtpRequestRequest,
      unknown
    >)

    const { getByTestId } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const submitButton = getByTestId('forgot-password-submit-button')
    expect(submitButton.props.disabled).toBe(true)
  })

  it('should show error message when mutation fails', () => {
    const mockError = new Error('Invalid email')

    vi.mocked(useAuthMutations.useRequestPasswordResetOTP).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: true,
      error: mockError,
      isSuccess: false,
      data: undefined,
      reset: vi.fn(),
    } as unknown as UseMutationResult<
      PasswordResetOtpRequest,
      Error,
      PasswordResetOtpRequestRequest,
      unknown
    >)

    const { getByText } = render(
      <ForgotPasswordScreen navigation={mockNavigation} route={mockRoute} />
    )

    const errorMessage = getByText(/error/i)
    expect(errorMessage).toBeDefined()
  })
})
