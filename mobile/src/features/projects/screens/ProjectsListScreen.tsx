/**
 * Projects List Screen - Session 7 Placeholder
 * Will be fully implemented in Session 9 with FlatList + search + filters
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button, FAB } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProjectsStackParamList } from '@/navigation/types'
import { useAuth } from '@/features/auth/hooks/useAuth'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectsList'>

export function ProjectsListScreen({ navigation }: Props): React.ReactElement {
  const { logout } = useAuth()

  const handleNavigateToDetail = (): void => {
    // TODO: Session 9 - Navigate with actual project UUID
    navigation.navigate('ProjectDetail', { projectUuid: 'test-uuid-123' })
  }

  const handleNavigateToCreate = (): void => {
    navigation.navigate('ProjectForm', {})
  }

  const handleLogout = (): void => {
    logout()
    // RootNavigator will automatically switch to AuthStack
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Projects
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Session 7 - Navigation Setup
      </Text>
      <Button mode="outlined" onPress={handleNavigateToDetail} style={styles.button}>
        View Project (Placeholder)
      </Button>
      <Button mode="text" onPress={handleLogout} style={styles.button}>
        Logout
      </Button>
      <FAB icon="plus" style={styles.fab} onPress={handleNavigateToCreate} />
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
})
