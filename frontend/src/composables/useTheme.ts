import { useDark, useToggle } from '@vueuse/core'

/**
 * Composable for managing dark mode theme
 *
 * Features:
 * - System preference detection
 * - Manual toggle with localStorage persistence
 * - Applies 'dark' class to document element
 *
 * @returns Object with isDark ref and toggleDark function
 */
export function useTheme() {
  // useDark automatically:
  // 1. Detects system preference (prefers-color-scheme: dark)
  // 2. Persists user preference in localStorage
  // 3. Applies 'dark' class to document element
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: '',
    storageKey: 'theme',
    storage: localStorage,
  })

  // Create toggle function
  const toggleDark = useToggle(isDark)

  return {
    isDark,
    toggleDark,
  }
}
