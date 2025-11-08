/**
 * Register Screen - Session 7 Placeholder
 * Will be fully implemented in Session 8 with React Hook Form + Zod
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

export function RegisterScreen({ navigation }: Props): React.ReactElement {
  const handleRegister = (): void => {
    // TODO: Session 8 - Implement with useRegister hook
    // Navigate to OTP verification on success
    navigation.navigate('OTPVerification', { email: 'test@example.com' })
  }

  const handleNavigateToLogin = (): void => {
    navigation.navigate('Login')
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Create Account
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Session 7 - Navigation Setup
      </Text>
      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register (Placeholder)
      </Button>
      <Button mode="text" onPress={handleNavigateToLogin} style={styles.button}>
        Already have an account?
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
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
  },
  button: {
    marginVertical: 8,
  },
})
