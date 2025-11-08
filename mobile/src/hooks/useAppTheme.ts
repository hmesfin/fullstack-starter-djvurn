import { useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/theme';
import type { AppTheme } from '@/theme';

/**
 * useAppTheme hook
 *
 * Returns the current React Native Paper theme based on the theme store.
 *
 * Features:
 * - Reactive theme switching
 * - Type-safe theme object
 * - Theme toggle functions
 * - Dark mode detection
 *
 * Usage:
 * ```tsx
 * const { theme, isDark, toggleTheme } = useAppTheme();
 *
 * return (
 *   <PaperProvider theme={theme}>
 *     <Button onPress={toggleTheme}>
 *       Toggle {isDark ? 'Light' : 'Dark'} Mode
 *     </Button>
 *   </PaperProvider>
 * );
 * ```
 */
export const useAppTheme = () => {
  const {
    theme: themeMode,
    isDark,
    isSystemTheme,
    setTheme,
    toggleTheme,
    setSystemTheme,
  } = useThemeStore();

  // Select theme based on current mode
  const theme: AppTheme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode]);

  return {
    theme,
    isDark,
    isSystemTheme,
    setTheme,
    toggleTheme,
    setSystemTheme,
  };
};
