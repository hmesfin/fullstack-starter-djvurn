/**
 * Root App component with all providers
 * Sets up QueryClient, React Native Paper theme, and navigation
 */

import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { QueryProvider } from '@/providers/QueryProvider'
import { lightTheme } from '@/theme'
import { View, Text, StyleSheet } from 'react-native'

/**
 * Root App Component
 */
export default function App(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <PaperProvider theme={lightTheme}>
          <View style={styles.container}>
            <Text style={styles.text}>React Native + TanStack Query + Zustand</Text>
            <Text style={styles.subtitle}>Ready for Session 5! 🚀</Text>
            <StatusBar style="auto" />
          </View>
        </PaperProvider>
      </QueryProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#666',
    textAlign: 'center',
  },
})
