/**
 * Profile Screen - Session 7 Placeholder
 * Will be enhanced in later sessions with user settings, preferences, etc.
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '@/navigation/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAppTheme } from '@/hooks/useAppTheme'

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>

export function ProfileScreen({ navigation }: Props): React.ReactElement {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useAppTheme()

  const handleLogout = (): void => {
    logout()
    // RootNavigator will automatically switch to AuthStack
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Profile
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        {user?.email || 'Not logged in'}
      </Text>
      <Text variant="bodyMedium" style={styles.info}>
        Session 7 - Navigation Setup
      </Text>
      <Button mode="outlined" onPress={toggleTheme} style={styles.button}>
        Toggle {isDark ? 'Light' : 'Dark'} Mode
      </Button>
      <Button mode="text" onPress={handleLogout} style={styles.button}>
        Logout
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
