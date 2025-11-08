/**
 * Project Detail Screen - Session 7 Placeholder
 * Will be fully implemented in Session 9 with full project data + edit/delete actions
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProjectsStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetail'>

export function ProjectDetailScreen({ route, navigation }: Props): React.ReactElement {
  const { projectUuid } = route.params

  const handleEdit = (): void => {
    navigation.navigate('ProjectForm', { projectUuid })
  }

  const handleDelete = (): void => {
    // TODO: Session 9 - Implement delete with confirmation dialog
    console.log('Delete project:', projectUuid)
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        Project Detail
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        UUID: {projectUuid}
      </Text>
      <Text variant="bodyMedium" style={styles.info}>
        Session 7 - Navigation Setup
      </Text>
      <Button mode="contained" onPress={handleEdit} style={styles.button}>
        Edit Project
      </Button>
      <Button mode="outlined" onPress={handleDelete} style={styles.button}>
        Delete Project
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
