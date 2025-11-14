/**
 * Auth Stack Navigator
 * Handles unauthenticated user flow: Login → Register → OTP Verification
 */

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AuthStackParamList } from './types'
import {
  LoginScreen,
  RegisterScreen,
  OTPVerificationScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from '@/features/auth/screens'

const Stack = createNativeStackNavigator<AuthStackParamList>()

export function AuthStack(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Auth screens have custom headers
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{
          gestureEnabled: false, // Prevent swipe back during OTP verification
        }}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          gestureEnabled: false, // Prevent swipe back during password reset
        }}
      />
    </Stack.Navigator>
  )
}
