/**
 * ForgotPasswordScreen - TDD Implementation (GREEN Phase)
 * Request password reset OTP via email
 */

import React, { useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, Button, TextInput, HelperText } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuthStackParamList } from '@/navigation/types'
import { passwordResetOTPRequestSchema, type PasswordResetOTPRequestInput } from '@/schemas/auth.schema'
import { useRequestPasswordResetOTP } from '@/features/auth/hooks/useAuthMutations'

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>

export function ForgotPasswordScreen({ navigation }: Props): React.ReactElement {
  const { control, handleSubmit, formState: { errors }, getValues } = useForm<PasswordResetOTPRequestInput>({
    resolver: zodResolver(passwordResetOTPRequestSchema),
    defaultValues: {
      email: '',
    },
  })

  const requestPasswordResetOTPMutation = useRequestPasswordResetOTP()

  // Handle successful OTP request
  useEffect(() => {
    if (requestPasswordResetOTPMutation.isSuccess) {
      // Navigate to ResetPasswordScreen with email
      const email = getValues('email')
      navigation.navigate('ResetPassword', { email })
    }
  }, [requestPasswordResetOTPMutation.isSuccess, navigation, getValues])

  const onSubmit = (data: PasswordResetOTPRequestInput): void => {
    requestPasswordResetOTPMutation.mutate(data)
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
            Forgot Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your email address and we'll send you a verification code to reset your password.
          </Text>

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={!!errors.email}
                  testID="forgot-password-email-input"
                  disabled={requestPasswordResetOTPMutation.isPending}
                />
                {errors.email && (
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* API Error Message */}
          {requestPasswordResetOTPMutation.isError && requestPasswordResetOTPMutation.error && (
            <HelperText type="error" visible={true} style={styles.errorMessage}>
              {requestPasswordResetOTPMutation.error.message}
            </HelperText>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={requestPasswordResetOTPMutation.isPending}
            disabled={requestPasswordResetOTPMutation.isPending}
            style={styles.button}
            testID="forgot-password-submit-button"
          >
            {requestPasswordResetOTPMutation.isPending ? 'Sending...' : 'Send Reset Code'}
          </Button>

          {/* Back to Login Link */}
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.button}
            testID="forgot-password-back-button"
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
