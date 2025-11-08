/**
 * Projects Stack Navigator
 * Nested inside Main Tab navigator
 * Handles project-related screens: List → Detail → Form
 */

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ProjectsStackParamList } from './types'
import { ProjectsListScreen, ProjectDetailScreen, ProjectFormScreen } from '@/features/projects/screens'

const Stack = createNativeStackNavigator<ProjectsStackParamList>()

export function ProjectsStack(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="ProjectsList"
      screenOptions={{
        headerShown: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={{
          title: 'Projects',
          headerShown: false, // Tab navigator shows header
        }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{
          title: 'Project Details',
        }}
      />
      <Stack.Screen
        name="ProjectForm"
        component={ProjectFormScreen}
        options={({ route }) => ({
          title: route.params?.projectUuid ? 'Edit Project' : 'New Project',
          presentation: 'modal', // Modal presentation for form
        })}
      />
    </Stack.Navigator>
  )
}
