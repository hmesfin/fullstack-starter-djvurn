/**
 * Register Screen - Session 8 TDD Implementation
 * React Hook Form + Zod + useRegister
 */

import React, { useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, Button, TextInput, HelperText } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuthStackParamList } from '@/navigation/types'
import { userRegistrationSchema, type UserRegistrationInput } from '@/schemas/auth.schema'
import { useRegister } from '@/features/auth/hooks/useAuthMutations'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

export function RegisterScreen({ navigation }: Props): React.ReactElement {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<UserRegistrationInput>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
  })

  const registerMutation = useRegister()

  // Handle successful registration
  useEffect(() => {
    if (registerMutation.isSuccess && registerMutation.data) {
      // Navigate to OTP verification with user's email
      navigation.navigate('OTPVerification', { email: registerMutation.data.email })
      reset()
    }
  }, [registerMutation.isSuccess, registerMutation.data, navigation, reset])

  const onSubmit = (data: UserRegistrationInput): void => {
    registerMutation.mutate(data)
  }

  const handleNavigateToLogin = (): void => {
    navigation.navigate('Login')
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
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign up to get started
          </Text>

          {/* First Name Input */}
          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="First Name"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoComplete="name-given"
                  error={!!errors.first_name}
                  testID="register-firstname-input"
                  disabled={registerMutation.isPending}
                />
                {errors.first_name && (
                  <HelperText type="error" visible={!!errors.first_name}>
                    {errors.first_name.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* Last Name Input */}
          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Last Name"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  autoComplete="name-family"
                  error={!!errors.last_name}
                  testID="register-lastname-input"
                  disabled={registerMutation.isPending}
                />
                {errors.last_name && (
                  <HelperText type="error" visible={!!errors.last_name}>
                    {errors.last_name.message}
                  </HelperText>
                )}
              </View>
            )}
          />

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
                  testID="register-email-input"
                  disabled={registerMutation.isPending}
                />
                {errors.email && (
                  <HelperText type="error" visible={!!errors.email}>
                    {errors.email.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  label="Password"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  error={!!errors.password}
                  testID="register-password-input"
                  disabled={registerMutation.isPending}
                />
                {errors.password && (
                  <HelperText type="error" visible={!!errors.password}>
                    {errors.password.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          {/* API Error Message */}
          {registerMutation.isError && registerMutation.error && (
            <HelperText type="error" visible={true} style={styles.errorMessage}>
              {registerMutation.error.message}
            </HelperText>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            style={styles.button}
            testID="register-submit-button"
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <Button
            mode="text"
            onPress={handleNavigateToLogin}
            style={styles.button}
            testID="register-login-link"
            disabled={registerMutation.isPending}
          >
            Already have an account? Sign In
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
    marginBottom: 30,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  errorMessage: {
    marginTop: 8,
    marginBottom: 8,
  },
})
