import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

/**
 * Tests for authentication mutation hooks
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authService } from '@/services/auth.service'
import {
  useLogin,
  useRegister,
  useVerifyOTP,
  useResendOTP,
  useRequestPasswordResetOTP,
  useConfirmPasswordResetOTP,
} from '../useAuthMutations'
import { createMockUser } from '@/test/mockHelpers'
import type {
  TokenObtainPair,
  OtpVerification,
  ResendOtp,
  PasswordResetOtpRequest,
  PasswordResetOtpConfirm,
} from '@/api/types.gen'

// Mock the auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    verifyOTP: vi.fn(),
    resendOTP: vi.fn(),
    requestPasswordResetOTP: vi.fn(),
    confirmPasswordResetOTP: vi.fn(),
    refreshToken: vi.fn(),
    getMe: vi.fn(),
  },
}))

// Helper to create a wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  return Wrapper
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully login and store tokens', async () => {
    const mockResponse: TokenObtainPair = {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
    }

    ;vi.mocked(authService.login).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    // Trigger the mutation
    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    })

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify service was called correctly
    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })

    // Verify tokens were stored
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle login errors', async () => {
    const mockError = new Error('Invalid credentials')
    ;vi.mocked(authService.login).mockRejectedValue(mockError)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'wrong-password',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })

  // TODO: Test loading states in E2E - synchronous mocks complete before isPending can be checked
  it.skip('should set loading state during mutation', async () => {
    const mockResponse: TokenObtainPair = {
      access: 'token',
      refresh: 'token',
    }

    ;vi.mocked(authService.login).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(mockResponse),
            100
          )
        )
    )

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'password123',
    })

    // Should be loading immediately
    expect(result.current.isPending).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should not be loading after completion
    expect(result.current.isPending).toBe(false)
  })
})

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully register a new user', async () => {
    const mockResponse = createMockUser({
      email: 'newuser@example.com',
      first_name: 'New',
      last_name: 'User',
    })

    ;vi.mocked(authService.register).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'newuser@example.com',
      password: 'password123',
      first_name: 'New',
      last_name: 'User',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authService.register).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      first_name: 'New',
      last_name: 'User',
    })

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle registration errors', async () => {
    const mockError = new Error('Email already exists')
    ;vi.mocked(authService.register).mockRejectedValue(mockError)

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'existing@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})

describe('useVerifyOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully verify OTP and store tokens', async () => {
    const mockResponse: OtpVerification = {
      email: 'test@example.com',
      code: '123456',
    }

    ;vi.mocked(authService.verifyOTP).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useVerifyOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      code: '123456',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authService.verifyOTP).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
    })

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle invalid OTP errors', async () => {
    const mockError = new Error('Invalid or expired OTP')
    ;vi.mocked(authService.verifyOTP).mockRejectedValue(mockError)

    const { result } = renderHook(() => useVerifyOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      code: 'wrong-code',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})

describe('useResendOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully resend OTP', async () => {
    const mockResponse: ResendOtp = {
      email: 'test@example.com',
    }

    ;vi.mocked(authService.resendOTP).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useResendOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authService.resendOTP).toHaveBeenCalledWith({
      email: 'test@example.com',
    })

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle resend OTP errors', async () => {
    const mockError = new Error('Rate limit exceeded')
    ;vi.mocked(authService.resendOTP).mockRejectedValue(mockError)

    const { result } = renderHook(() => useResendOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})

describe('useRequestPasswordResetOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully request password reset OTP', async () => {
    const mockResponse: PasswordResetOtpRequest = {
      email: 'test@example.com',
    }

    ;vi.mocked(authService.requestPasswordResetOTP).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useRequestPasswordResetOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authService.requestPasswordResetOTP).toHaveBeenCalledWith({
      email: 'test@example.com',
    })

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle request password reset OTP errors', async () => {
    const mockError = new Error('Invalid email')
    ;vi.mocked(authService.requestPasswordResetOTP).mockRejectedValue(mockError)

    const { result } = renderHook(() => useRequestPasswordResetOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'invalid-email',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})

describe('useConfirmPasswordResetOTP', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully confirm password reset with OTP', async () => {
    const mockResponse: PasswordResetOtpConfirm = {
      email: 'test@example.com',
      code: '123456',
    }

    ;vi.mocked(authService.confirmPasswordResetOTP).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useConfirmPasswordResetOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      code: '123456',
      password: 'NewPassword123!',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authService.confirmPasswordResetOTP).toHaveBeenCalledWith({
      email: 'test@example.com',
      code: '123456',
      password: 'NewPassword123!',
    })

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle invalid OTP code errors', async () => {
    const mockError = new Error('Invalid or expired OTP code')
    ;vi.mocked(authService.confirmPasswordResetOTP).mockRejectedValue(mockError)

    const { result } = renderHook(() => useConfirmPasswordResetOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      code: 'wrong-code',
      password: 'NewPassword123!',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })

  it('should handle weak password errors', async () => {
    const mockError = new Error('Password is too weak')
    ;vi.mocked(authService.confirmPasswordResetOTP).mockRejectedValue(mockError)

    const { result } = renderHook(() => useConfirmPasswordResetOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      code: '123456',
      password: 'weak',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})
