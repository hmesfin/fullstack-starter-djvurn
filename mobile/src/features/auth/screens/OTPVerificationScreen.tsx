/**
 * OTP Verification Screen - Session 8 TDD Implementation
 * React Hook Form + Zod + useVerifyOTP + useResendOTP
 */

import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, Button, TextInput, HelperText } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuthStackParamList } from '@/navigation/types'
import { otpVerificationSchema, type OtpVerificationInput } from '@/schemas/auth.schema'
import { useVerifyOTP, useResendOTP } from '@/features/auth/hooks/useAuthMutations'

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>

export function OTPVerificationScreen({ route, navigation }: Props): React.ReactElement {
  const { email } = route.params
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const { control, handleSubmit, formState: { errors }, reset } = useForm<OtpVerificationInput>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email,
      code: '',
    },
  })

  const verifyOTPMutation = useVerifyOTP()
  const resendOTPMutation = useResendOTP()

  // Handle successful OTP verification
  useEffect(() => {
    if (verifyOTPMutation.isSuccess && verifyOTPMutation.data) {
      reset()
      // Navigate to Login screen after successful verification
      navigation.navigate('Login')
    }
  }, [verifyOTPMutation.isSuccess, verifyOTPMutation.data, navigation, reset])

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
      return undefined
    }
  }, [countdown])

  // Handle successful resend
  useEffect(() => {
    if (resendOTPMutation.isSuccess) {
      setResendDisabled(true)
      setCountdown(60) // 60 second countdown
    }
  }, [resendOTPMutation.isSuccess])

  const onSubmit = (data: OtpVerificationInput): void => {
    verifyOTPMutation.mutate(data)
  }

  const handleResendOTP = (): void => {
    resendOTPMutation.mutate({ email })
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
            Verify Your Email
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {email}
          </Text>

          {/* OTP Input */}
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="OTP Code"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  error={!!errors.code}
                  testID="otp-input"
                  disabled={verifyOTPMutation.isPending}
                  style={styles.otpInput}
                />
                {errors.code && (
                  <HelperText type="error" visible={!!errors.code}>
                    {errors.code.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* Verification Error Message */}
          {verifyOTPMutation.isError && verifyOTPMutation.error && (
            <HelperText type="error" visible={true} style={styles.errorMessage}>
              {verifyOTPMutation.error.message}
            </HelperText>
          )}

          {/* Resend Success Message */}
          {resendOTPMutation.isSuccess && (
            <HelperText type="info" visible={true} style={styles.successMessage}>
              New code sent to your email!
            </HelperText>
          )}

          {/* Resend Error Message */}
          {resendOTPMutation.isError && resendOTPMutation.error && (
            <HelperText type="error" visible={true} style={styles.errorMessage}>
              {resendOTPMutation.error.message}
            </HelperText>
          )}

          {/* Verify Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={verifyOTPMutation.isPending}
            disabled={verifyOTPMutation.isPending}
            style={styles.button}
            testID="otp-verify-button"
          >
            {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify Code'}
          </Button>

          {/* Resend Button */}
          <Button
            mode="text"
            onPress={handleResendOTP}
            disabled={resendDisabled || resendOTPMutation.isPending}
            style={styles.button}
            testID="otp-resend-button"
          >
            {resendDisabled
              ? `Resend code in ${countdown}s`
              : resendOTPMutation.isPending
              ? 'Sending...'
              : 'Resend Code'}
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
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  email: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 16,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
  },
  button: {
    marginVertical: 8,
  },
  errorMessage: {
    marginTop: 8,
    marginBottom: 8,
  },
  successMessage: {
    marginTop: 8,
    marginBottom: 8,
  },
})
