import { describe, it, expect } from 'vitest'
import {
  userRegistrationSchema,
  emailTokenObtainPairSchema,
  otpVerificationSchema,
  tokenRefreshSchema,
} from '../auth.schema'

describe('userRegistrationSchema', () => {
  it('validates correct registration data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe',
    }

    const result = userRegistrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe',
    }

    const result = userRegistrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('email')
    }
  })

  it('rejects empty password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
      first_name: 'John',
      last_name: 'Doe',
    }

    const result = userRegistrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('password')
    }
  })

  it('rejects missing first_name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      last_name: 'Doe',
    }

    const result = userRegistrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('first_name')
    }
  })

  it('rejects missing last_name', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
    }

    const result = userRegistrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('last_name')
    }
  })

  it('rejects extra fields', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe',
      extra_field: 'should not be here',
    }

    const result = userRegistrationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('emailTokenObtainPairSchema', () => {
  it('validates correct login credentials', () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    }

    const result = emailTokenObtainPairSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'SecurePass123!',
    }

    const result = emailTokenObtainPairSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('email')
    }
  })

  it('rejects missing password', () => {
    const invalidData = {
      email: 'test@example.com',
    }

    const result = emailTokenObtainPairSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('password')
    }
  })

  it('rejects extra fields', () => {
    const invalidData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      extra_field: 'should not be here',
    }

    const result = emailTokenObtainPairSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('otpVerificationSchema', () => {
  it('validates correct OTP verification data', () => {
    const validData = {
      email: 'test@example.com',
      code: '123456',
    }

    const result = otpVerificationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      code: '123456',
    }

    const result = otpVerificationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('email')
    }
  })

  it('rejects non-6-digit code', () => {
    const invalidData = {
      email: 'test@example.com',
      code: '12345',
    }

    const result = otpVerificationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('code')
    }
  })

  it('rejects non-numeric code', () => {
    const invalidData = {
      email: 'test@example.com',
      code: 'ABC123',
    }

    const result = otpVerificationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('code')
    }
  })

  it('rejects extra fields', () => {
    const invalidData = {
      email: 'test@example.com',
      code: '123456',
      extra_field: 'should not be here',
    }

    const result = otpVerificationSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('tokenRefreshSchema', () => {
  it('validates correct token refresh data', () => {
    const validData = {
      refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    }

    const result = tokenRefreshSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects empty refresh token', () => {
    const invalidData = {
      refresh: '',
    }

    const result = tokenRefreshSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('refresh')
    }
  })

  it('rejects missing refresh token', () => {
    const invalidData = {}

    const result = tokenRefreshSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('refresh')
    }
  })

  it('rejects extra fields', () => {
    const invalidData = {
      refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      extra_field: 'should not be here',
    }

    const result = tokenRefreshSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
