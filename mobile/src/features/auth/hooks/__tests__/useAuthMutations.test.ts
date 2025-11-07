/**
 * Tests for authentication mutation hooks
 * Following TDD: RED phase - these tests will fail until implementation exists
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as authService from '@/services/auth.service'
import { useLogin, useRegister, useVerifyOTP, useResendOTP } from '../useAuthMutations'

// Mock the auth service
jest.mock('@/services/auth.service')

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

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
    jest.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully login and store tokens', async () => {
    const mockResponse = {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      },
    }

    ;(authService.login as jest.Mock).mockResolvedValue(mockResponse)

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
    ;(authService.login as jest.Mock).mockRejectedValue(mockError)

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

  it('should set loading state during mutation', async () => {
    ;(authService.login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                access: 'token',
                refresh: 'token',
                user: { id: 1, email: 'test@example.com' },
              }),
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
    jest.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully register a new user', async () => {
    const mockResponse = {
      email: 'newuser@example.com',
      message: 'OTP sent to your email',
    }

    ;(authService.register as jest.Mock).mockResolvedValue(mockResponse)

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
    ;(authService.register as jest.Mock).mockRejectedValue(mockError)

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
    jest.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully verify OTP and store tokens', async () => {
    const mockResponse = {
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      },
    }

    ;(authService.verifyOTP as jest.Mock).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useVerifyOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      otp_code: '123456',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(authService.verifyOTP).toHaveBeenCalledWith({
      email: 'test@example.com',
      otp_code: '123456',
    })

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle invalid OTP errors', async () => {
    const mockError = new Error('Invalid or expired OTP')
    ;(authService.verifyOTP as jest.Mock).mockRejectedValue(mockError)

    const { result } = renderHook(() => useVerifyOTP(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      otp_code: 'wrong-code',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(mockError)
  })
})

describe('useResendOTP', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    AsyncStorage.clear()
  })

  it('should successfully resend OTP', async () => {
    const mockResponse = {
      message: 'OTP sent successfully',
    }

    ;(authService.resendOTP as jest.Mock).mockResolvedValue(mockResponse)

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
    ;(authService.resendOTP as jest.Mock).mockRejectedValue(mockError)

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
