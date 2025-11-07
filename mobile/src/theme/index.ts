/**
 * React Native Paper theme configuration
 * Material Design 3 theme with light and dark modes
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper'

/**
 * Light theme configuration
 */
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Customize colors here if needed
    // primary: '#6200EE',
    // secondary: '#03DAC6',
  },
}

/**
 * Dark theme configuration
 */
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Customize colors here if needed
    // primary: '#BB86FC',
    // secondary: '#03DAC6',
  },
}

/**
 * Theme type for TypeScript
 */
export type AppTheme = typeof lightTheme
