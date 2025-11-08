/**
 * OTP Verification Screen - Session 7 Placeholder
 * Will be fully implemented in Session 8 with 6-digit input + countdown timer
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>

export function OTPVerificationScreen({ route, navigation }: Props): React.ReactElement {
  const { email } = route.params

  const handleVerifyOTP = (): void => {
    // TODO: Session 8 - Implement with useVerifyOTP hook
    // This will trigger auth state change → navigate to Main stack
    console.log('OTP verified for:', email)
  }

  const handleResendOTP = (): void => {
    // TODO: Session 8 - Implement with useResendOTP hook
    console.log('Resend OTP to:', email)
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Verify Email
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Code sent to: {email}
      </Text>
      <Text variant="bodyMedium" style={styles.info}>
        Session 7 - Navigation Setup
      </Text>
      <Button mode="contained" onPress={handleVerifyOTP} style={styles.button}>
        Verify OTP (Placeholder)
      </Button>
      <Button mode="text" onPress={handleResendOTP} style={styles.button}>
        Resend Code
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
    marginBottom: 10,
  },
  info: {
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    marginVertical: 8,
  },
})
