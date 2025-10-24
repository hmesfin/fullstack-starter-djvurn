import { describe, it, expect } from 'vitest'
import {
  userRequestSchema,
  patchedUserRequestSchema,
  userResponseSchema,
} from '../user.schema'

describe('userRequestSchema', () => {
  it('validates correct user request data', () => {
    const validData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    }

    const result = userRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'not-an-email',
    }

    const result = userRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('email')
    }
  })

  it('rejects empty first_name', () => {
    const invalidData = {
      first_name: '',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    }

    const result = userRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('first_name')
    }
  })

  it('rejects empty last_name', () => {
    const invalidData = {
      first_name: 'John',
      last_name: '',
      email: 'john.doe@example.com',
    }

    const result = userRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('last_name')
    }
  })

  it('rejects missing required fields', () => {
    const invalidData = {
      first_name: 'John',
    }

    const result = userRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects extra fields', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      extra_field: 'should not be here',
    }

    const result = userRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('patchedUserRequestSchema', () => {
  it('validates partial update with only first_name', () => {
    const validData = {
      first_name: 'John',
    }

    const result = patchedUserRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('validates partial update with only last_name', () => {
    const validData = {
      last_name: 'Doe',
    }

    const result = patchedUserRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('validates partial update with only email', () => {
    const validData = {
      email: 'john.doe@example.com',
    }

    const result = patchedUserRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('validates partial update with all fields', () => {
    const validData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
    }

    const result = patchedUserRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('validates empty object (no updates)', () => {
    const validData = {}

    const result = patchedUserRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
    }

    const result = patchedUserRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('email')
    }
  })

  it('rejects empty first_name if provided', () => {
    const invalidData = {
      first_name: '',
    }

    const result = patchedUserRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('first_name')
    }
  })

  it('rejects empty last_name if provided', () => {
    const invalidData = {
      last_name: '',
    }

    const result = patchedUserRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('last_name')
    }
  })

  it('rejects extra fields', () => {
    const invalidData = {
      first_name: 'John',
      extra_field: 'should not be here',
    }

    const result = patchedUserRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('userResponseSchema', () => {
  it('validates correct user response data', () => {
    const validData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      url: 'http://localhost:8000/api/users/123e4567-e89b-12d3-a456-426614174000/',
    }

    const result = userResponseSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'not-an-email',
      url: 'http://localhost:8000/api/users/123e4567-e89b-12d3-a456-426614174000/',
    }

    const result = userResponseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('email')
    }
  })

  it('rejects invalid URL format', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      url: 'not-a-url',
    }

    const result = userResponseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('url')
    }
  })

  it('rejects missing required fields', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
    }

    const result = userResponseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects extra fields', () => {
    const invalidData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      url: 'http://localhost:8000/api/users/123e4567-e89b-12d3-a456-426614174000/',
      extra_field: 'should not be here',
    }

    const result = userResponseSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
