/**
 * Root App component with all providers
 * Sets up QueryClient, React Native Paper theme, and navigation
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider, Button } from 'react-native-paper'
import { QueryProvider } from '@/providers/QueryProvider'
import { useAppTheme } from '@/hooks/useAppTheme'
import { OfflineBanner, FadeIn, SlideIn } from '@/components'
import { View, Text, StyleSheet } from 'react-native'

/**
 * Root App Component with dynamic theming
 */
function AppContent(): React.ReactElement {
  const { theme, isDark, toggleTheme } = useAppTheme()

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <OfflineBanner />
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <FadeIn duration={600}>
            <Text style={[styles.text, { color: theme.colors.onBackground }]}>
              React Native + Dark Mode
            </Text>
          </FadeIn>
          <SlideIn direction="bottom" duration={500} delay={200} distance={30}>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Session 5 - UI Foundation & Polish 🚀
            </Text>
          </SlideIn>
          <SlideIn direction="bottom" duration={500} delay={400} distance={30}>
            <Button mode="contained" onPress={toggleTheme} style={styles.button}>
              Toggle {isDark ? 'Light' : 'Dark'} Mode
            </Button>
          </SlideIn>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
})
