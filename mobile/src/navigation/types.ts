/**
 * Navigation types for React Navigation
 * Provides type-safe navigation throughout the app
 */

import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { CompositeNavigationProp } from '@react-navigation/native'

/**
 * Auth Stack - Unauthenticated users
 */
export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  OTPVerification: {
    email: string
  }
}

/**
 * Main Tab Navigator - Authenticated users
 */
export type MainTabParamList = {
  ProjectsList: undefined
  Profile: undefined
}

/**
 * Projects Stack - Nested in Main Tab
 */
export type ProjectsStackParamList = {
  ProjectsList: undefined
  ProjectDetail: {
    projectUuid: string
  }
  ProjectForm: {
    projectUuid?: string // Optional for create mode
  }
}

/**
 * Root Stack - Top-level navigator
 */
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

/**
 * Auth Stack Navigation Prop
 */
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>

/**
 * Projects Stack Navigation Prop
 */
export type ProjectsStackNavigationProp = NativeStackNavigationProp<ProjectsStackParamList>

/**
 * Main Tab Navigation Prop
 */
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>

/**
 * Root Stack Navigation Prop
 */
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>

/**
 * Composite navigation prop for nested navigators
 */
export type ProjectsNavigationProp = CompositeNavigationProp<
  ProjectsStackNavigationProp,
  CompositeNavigationProp<MainTabNavigationProp, RootStackNavigationProp>
>

/**
 * Declare global navigation types for TypeScript
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
