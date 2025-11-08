/**
 * Main Tab Navigator
 * Bottom tabs for authenticated users: Projects | Profile
 */

import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from 'react-native-paper'
import Icon from 'react-native-paper/src/components/Icon'
import type { MainTabParamList } from './types'
import { ProjectsStack } from './ProjectsStack'
import { ProfileScreen } from '@/features/projects/screens'

const Tab = createBottomTabNavigator<MainTabParamList>()

export function MainTab(): React.ReactElement {
  const theme = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
      }}
    >
      <Tab.Screen
        name="ProjectsList"
        component={ProjectsStack}
        options={{
          title: 'Projects',
          headerShown: false, // ProjectsStack handles its own headers
          tabBarIcon: ({ color, size }) => (
            <Icon source="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon source="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
