/**
 * Login Screen - Session 7 Placeholder
 * Will be fully implemented in Session 8 with React Hook Form + Zod
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const handleLogin = (): void => {
    // TODO: Session 8 - Implement with useLogin hook
    console.log('Login pressed')
  }

  const handleNavigateToRegister = (): void => {
    navigation.navigate('Register')
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Welcome Back
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Session 7 - Navigation Setup
      </Text>
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login (Placeholder)
      </Button>
      <Button mode="text" onPress={handleNavigateToRegister} style={styles.button}>
        Create Account
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
