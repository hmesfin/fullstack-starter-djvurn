/**
 * Login Screen - Session 8 TDD Implementation
 * React Hook Form + Zod + useLogin
 */

import React, { useEffect } from 'react'
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Text, Button, TextInput, HelperText } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AuthStackParamList } from '@/navigation/types'
import { emailTokenObtainPairSchema, type EmailTokenObtainPairInput } from '@/schemas/auth.schema'
import { useLogin } from '@/features/auth/hooks/useAuthMutations'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { PasswordInput } from '@/features/auth/components'

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const { control, handleSubmit, formState: { errors }, reset } = useForm<EmailTokenObtainPairInput>({
    resolver: zodResolver(emailTokenObtainPairSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useLogin()
  const { setTokens } = useAuth()

  // Handle successful login
  useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      // Store tokens (async - updates both Zustand store and API client)
      setTokens({
        access: loginMutation.data.access,
        refresh: loginMutation.data.refresh,
      }).catch((error) => {
        console.error('Failed to store auth tokens:', error)
      })
      reset()
      // RootNavigator will automatically switch to Main stack
    }
  }, [loginMutation.isSuccess, loginMutation.data, setTokens, reset])

  const onSubmit = (data: EmailTokenObtainPairInput): void => {
    loginMutation.mutate(data)
  }

  const handleNavigateToRegister = (): void => {
    navigation.navigate('Register')
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
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to continue
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
                  testID="login-email-input"
                  disabled={loginMutation.isPending}
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
                <PasswordInput
                  label="Password"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="password"
                  error={!!errors.password}
                  testID="login-password-input"
                  disabled={loginMutation.isPending}
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
          {loginMutation.isError && loginMutation.error && (
            <HelperText type="error" visible={true} style={styles.errorMessage}>
              {loginMutation.error.message}
            </HelperText>
          )}

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            style={styles.button}
            testID="login-submit-button"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Button>

          {/* Register Link */}
          <Button
            mode="text"
            onPress={handleNavigateToRegister}
            style={styles.button}
            testID="login-register-link"
            disabled={loginMutation.isPending}
          >
            Don't have an account? Create Account
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
