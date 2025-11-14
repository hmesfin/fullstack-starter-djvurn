/**
 * PasswordInput Component
 *
 * Reusable password input with show/hide toggle functionality
 * Based on react-native-paper TextInput with additional password visibility controls
 */

import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import { TextInput, TextInputProps, IconButton } from 'react-native-paper'

export interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry' | 'right'> {
  /**
   * Test ID for the password input field
   */
  testID?: string
  /**
   * Initial visibility state (default: false - password hidden)
   */
  initialVisible?: boolean
}

/**
 * Password input component with visibility toggle
 *
 * Features:
 * - Show/hide password toggle button
 * - Eye icon (open/closed) to indicate current state
 * - Fully compatible with react-native-paper theme
 * - Works with React Hook Form Controller
 *
 * @example
 * ```tsx
 * <Controller
 *   control={control}
 *   name="password"
 *   render={({ field: { onChange, onBlur, value } }) => (
 *     <PasswordInput
 *       label="Password"
 *       value={value}
 *       onChangeText={onChange}
 *       onBlur={onBlur}
 *       error={!!errors.password}
 *       testID="password-input"
 *     />
 *   )}
 * />
 * ```
 */
export function PasswordInput({
  testID,
  initialVisible = false,
  ...props
}: PasswordInputProps): React.ReactElement {
  const [showPassword, setShowPassword] = useState(initialVisible)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <TextInput
      {...props}
      secureTextEntry={!showPassword}
      testID={testID}
      right={
        <TextInput.Icon
          icon={showPassword ? 'eye' : 'eye-closed'}
          onPress={togglePasswordVisibility}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          testID={testID ? `${testID}-toggle` : 'password-toggle'}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  // Styles can be added here if needed for customization
})
