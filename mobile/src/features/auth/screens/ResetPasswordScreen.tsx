/**
 * ResetPasswordScreen - TDD Implementation (GREEN Phase)
 * Reset password using OTP code sent to email
 */

import React, { useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, Button, TextInput, HelperText } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuthStackParamList } from '@/navigation/types'
import { passwordResetOTPConfirmSchema, type PasswordResetOTPConfirmInput } from '@/schemas/auth.schema'
import { useConfirmPasswordResetOTP } from '@/features/auth/hooks/useAuthMutations'
import { PasswordInput } from '@/features/auth/components'

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>

export function ResetPasswordScreen({ navigation, route }: Props): React.ReactElement {
  const { email } = route.params

  const { control, handleSubmit, formState: { errors }, watch } = useForm<PasswordResetOTPConfirmInput>({
    resolver: zodResolver(passwordResetOTPConfirmSchema),
    defaultValues: {
      email,
      code: '',
      password: '',
    },
  })

  const confirmPasswordResetOTPMutation = useConfirmPasswordResetOTP()

  // Handle successful password reset
  useEffect(() => {
    if (confirmPasswordResetOTPMutation.isSuccess) {
      // Reset navigation stack and go to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    }
  }, [confirmPasswordResetOTPMutation.isSuccess, navigation])

  const onSubmit = (data: PasswordResetOTPConfirmInput): void => {
    confirmPasswordResetOTPMutation.mutate(data)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text variant="displaySmall" style={styles.title}>
            Reset Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            We've sent a verification code to {email}. Enter the code and your new password below.
          </Text>

          {/* OTP Code Input */}
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Verification Code"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={!!errors.code}
                  testID="reset-password-code-input"
                  disabled={confirmPasswordResetOTPMutation.isPending}
                />
                {errors.code && (
                  <HelperText type="error" visible={!!errors.code}>
                    {errors.code.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* New Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <PasswordInput
                  label="New Password"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  error={!!errors.password}
                  testID="reset-password-new-password-input"
                  disabled={confirmPasswordResetOTPMutation.isPending}
                />
                {errors.password && (
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* Confirm Password Input (for UI confirmation only, not in schema) */}
          <Controller
            control={control}
            name="password"
            render={({ field: { value: passwordValue } }) => (
              <View style={styles.inputContainer}>
                <PasswordInput
                  label="Confirm New Password"
                  mode="outlined"
                  value={watch('password')}
                  onChangeText={() => {}}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  testID="reset-password-confirm-password-input"
                  disabled={confirmPasswordResetOTPMutation.isPending}
                />
              </View>
            )}
          />

          {/* API Error Message */}
          {confirmPasswordResetOTPMutation.isError && confirmPasswordResetOTPMutation.error && (
            <HelperText type="error" visible={true} style={styles.errorMessage}>
              {confirmPasswordResetOTPMutation.error.message}
            </HelperText>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={confirmPasswordResetOTPMutation.isPending}
            disabled={confirmPasswordResetOTPMutation.isPending}
            style={styles.button}
            testID="reset-password-submit-button"
          >
            {confirmPasswordResetOTPMutation.isPending ? 'Resetting...' : 'Reset Password'}
          </Button>

          {/* Back to Login Link */}
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            testID="reset-password-back-button"
          >
            Back to Login
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  errorMessage: {
    marginTop: 8,
  },
})
