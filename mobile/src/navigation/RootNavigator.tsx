/**
 * Root Navigator
 * Switches between Auth and Main stacks based on authentication state
 */

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { useTheme } from 'react-native-paper'
import type { RootStackParamList } from './types'
import { AuthStack } from './AuthStack'
import { MainTab } from './MainTab'
import { useAuth } from '@/features/auth/hooks/useAuth'

const Stack = createNativeStackNavigator<RootStackParamList>()

/**
 * Loading screen while checking auth state
 */
function LoadingScreen(): React.ReactElement {
  const theme = useTheme()

  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  )
}

export function RootNavigator(): React.ReactElement {
  const { isAuthenticated } = useAuth()
  const theme = useTheme()

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.outline,
          notification: theme.colors.error,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTab} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
