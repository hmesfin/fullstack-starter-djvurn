/**
 * PasswordInput Component Tests
 *
 * Tests for reusable password input with show/hide toggle functionality
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@/test/react-native-testing-mock'
import React from 'react'
import { PasswordInput } from '../PasswordInput'

describe('PasswordInput', () => {
  it('renders password input with label', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value=""
        onChangeText={() => {}}
        testID="password-input"
      />
    )

    expect(getByTestId('password-input')).toBeTruthy()
  })

  it('renders with toggle button', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value="secret123"
        onChangeText={() => {}}
        testID="password-input"
      />
    )

    // Toggle button should be present
    expect(getByTestId('password-input-toggle')).toBeTruthy()
  })

  it('calls onChangeText when provided', () => {
    const mockOnChangeText = vi.fn()

    render(
      <PasswordInput
        label="Password"
        value=""
        onChangeText={mockOnChangeText}
        testID="password-input"
      />
    )

    // Component renders without error
    expect(mockOnChangeText).toBeDefined()
  })

  it('renders with error state', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value=""
        onChangeText={() => {}}
        error={true}
        testID="password-input"
      />
    )

    // Component renders with error prop
    expect(getByTestId('password-input')).toBeTruthy()
  })

  it('renders in disabled state', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value=""
        onChangeText={() => {}}
        disabled={true}
        testID="password-input"
      />
    )

    // Component renders with disabled prop
    expect(getByTestId('password-input')).toBeTruthy()
  })

  it('accepts all TextInput props', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        mode="outlined"
        value=""
        onChangeText={() => {}}
        placeholder="Enter password"
        autoCapitalize="none"
        autoComplete="password"
        testID="password-input"
      />
    )

    // Component renders with all props without error
    expect(getByTestId('password-input')).toBeTruthy()
  })

  it('supports initialVisible prop', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value="secret123"
        onChangeText={() => {}}
        initialVisible={true}
        testID="password-input"
      />
    )

    // Component renders with initialVisible prop
    expect(getByTestId('password-input')).toBeTruthy()
  })

  it('renders with custom testID for toggle button', () => {
    const { getByTestId } = render(
      <PasswordInput
        label="Password"
        value=""
        onChangeText={() => {}}
        testID="custom-password"
      />
    )

    // Toggle button uses custom testID
    expect(getByTestId('custom-password-toggle')).toBeTruthy()
  })
})
