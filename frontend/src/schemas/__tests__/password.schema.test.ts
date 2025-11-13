import { describe, it, expect } from 'vitest'
import { passwordChangeRequestSchema } from '../password.schema'

describe('passwordChangeRequestSchema', () => {
  it('validates correct password change request', () => {
    const validData = {
      old_password: 'OldPassword123!',
      new_password: 'NewSecurePass456!',
    }

    const result = passwordChangeRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('rejects missing old_password', () => {
    const invalidData = {
      new_password: 'NewSecurePass456!',
    }

    const result = passwordChangeRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('old_password')
    }
  })

  it('rejects missing new_password', () => {
    const invalidData = {
      old_password: 'OldPassword123!',
    }

    const result = passwordChangeRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('new_password')
    }
  })

  it('rejects empty old_password', () => {
    const invalidData = {
      old_password: '',
      new_password: 'NewSecurePass456!',
    }

    const result = passwordChangeRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('old_password')
    }
  })

  it('rejects empty new_password', () => {
    const invalidData = {
      old_password: 'OldPassword123!',
      new_password: '',
    }

    const result = passwordChangeRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('new_password')
    }
  })

  it('rejects new_password shorter than 8 characters', () => {
    const invalidData = {
      old_password: 'OldPassword123!',
      new_password: 'Short1!',
    }

    const result = passwordChangeRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain('new_password')
      expect(result.error.issues[0]?.message).toContain('8')
    }
  })

  it('rejects extra fields', () => {
    const invalidData = {
      old_password: 'OldPassword123!',
      new_password: 'NewSecurePass456!',
      extra_field: 'should not be here',
    }

    const result = passwordChangeRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('accepts same password for old and new (no uniqueness validation)', () => {
    const validData = {
      old_password: 'SamePassword123!',
      new_password: 'SamePassword123!',
    }

    const result = passwordChangeRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
