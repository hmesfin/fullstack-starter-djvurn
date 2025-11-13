/**
 * ProfileScreen - Session 11 Implementation (GREEN phase - TDD)
 * User profile with theme toggle and logout
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '@/navigation/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useAppTheme } from '@/hooks/useAppTheme'

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>

export function ProfileScreen({ navigation }: Props): React.ReactElement {
  const { logout } = useAuth()
  const { data: user, isLoading } = useCurrentUser()
  const { isDark, toggleTheme } = useAppTheme()

  const handleLogout = (): void => {
    // Logout is async (clears both Zustand store and API client)
    logout().catch((error) => {
      console.error('Failed to logout:', error)
    })
    // RootNavigator will automatically switch to AuthStack
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Profile
        </Text>
      </View>

      {/* User Info Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account Information
        </Text>
        {isLoading ? (
          <ActivityIndicator size="small" style={styles.loader} />
        ) : (
          <>
            {(user?.first_name || user?.last_name) && (
              <Text variant="bodyLarge" style={styles.userInfo}>
                {[user?.first_name, user?.last_name].filter(Boolean).join(' ')}
              </Text>
            )}
            <Text variant="bodyMedium" style={styles.userInfo}>
              {user?.email || 'Guest'}
            </Text>
          </>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Preferences
        </Text>
        <Button
          mode="outlined"
          onPress={toggleTheme}
          style={styles.button}
          icon={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
          testID="theme-toggle-button"
        >
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Button>
      </View>

      <Divider style={styles.divider} />

      {/* Actions Section */}
      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.button}
          icon="logout"
          testID="logout-button"
        >
          Logout
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userInfo: {
    marginBottom: 8,
  },
  loader: {
    marginVertical: 16,
  },
  divider: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 8,
  },
})
