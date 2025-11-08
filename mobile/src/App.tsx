/**
 * Root App component with all providers
 * Sets up QueryClient, React Native Paper theme, and navigation
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { QueryProvider } from '@/providers/QueryProvider'
import { useAppTheme } from '@/hooks/useAppTheme'
import { OfflineBanner } from '@/components'
import { RootNavigator } from '@/navigation'

/**
 * App Content with theme and providers
 */
function AppContent(): React.ReactElement {
  const { theme, isDark } = useAppTheme()

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <OfflineBanner />
        <RootNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </PaperProvider>
  )
}

/**
 * Root App Component
 */
export default function App(): React.ReactElement {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  )
}
