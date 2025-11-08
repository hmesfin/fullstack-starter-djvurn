/**
 * Project Form Screen - Session 7 Placeholder
 * Will be fully implemented in Session 9 with React Hook Form + Zod
 * Handles both create and edit modes
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProjectsStackParamList } from '@/navigation/types'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectForm'>

export function ProjectFormScreen({ route, navigation }: Props): React.ReactElement {
  const { projectUuid } = route.params || {}
  const isEditMode = !!projectUuid

  const handleSave = (): void => {
    // TODO: Session 9 - Implement with useCreateProject or useUpdateProject
    console.log(isEditMode ? 'Update project' : 'Create project')
    navigation.goBack()
  }

  return (
    <View style={styles.container}>
      <Text variant="displaySmall" style={styles.title}>
        {isEditMode ? 'Edit Project' : 'New Project'}
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Session 7 - Navigation Setup
      </Text>
      {isEditMode && (
        <Text variant="bodyMedium" style={styles.info}>
          Editing: {projectUuid}
        </Text>
      )}
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        {isEditMode ? 'Update' : 'Create'} (Placeholder)
      </Button>
      <Button mode="text" onPress={() => navigation.goBack()} style={styles.button}>
        Cancel
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
    marginBottom: 20,
  },
  button: {
    marginVertical: 8,
  },
})
