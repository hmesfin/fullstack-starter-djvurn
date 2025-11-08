import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Theme type definition
 */
export type Theme = 'light' | 'dark';

/**
 * Theme store state
 */
interface ThemeState {
  /**
   * Current theme
   */
  theme: Theme;

  /**
   * Whether the app should follow system theme
   */
  isSystemTheme: boolean;

  /**
   * Computed property: is dark mode active?
   */
  isDark: boolean;

  /**
   * Set theme (light or dark)
   */
  setTheme: (theme: Theme) => Promise<void>;

  /**
   * Toggle between light and dark theme
   */
  toggleTheme: () => Promise<void>;

  /**
   * Enable or disable system theme mode
   */
  setSystemTheme: (enabled: boolean) => Promise<void>;
}

/**
 * Theme store
 *
 * Manages app theme (light/dark mode) with AsyncStorage persistence.
 *
 * Features:
 * - Light and dark themes
 * - System theme detection (optional)
 * - AsyncStorage persistence
 * - Type-safe theme values
 *
 * Usage:
 * ```tsx
 * const { theme, isDark, setTheme, toggleTheme } = useThemeStore();
 *
 * // Set theme
 * await setTheme('dark');
 *
 * // Toggle theme
 * await toggleTheme();
 *
 * // Check if dark
 * if (isDark) {
 *   // Apply dark mode styles
 * }
 * ```
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isSystemTheme: true,

      // Computed property
      get isDark(): boolean {
        return get().theme === 'dark';
      },

      setTheme: async (theme: Theme): Promise<void> => {
        set({ theme, isSystemTheme: false });
      },

      toggleTheme: async (): Promise<void> => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme, isSystemTheme: false });
      },

      setSystemTheme: async (enabled: boolean): Promise<void> => {
        set({ isSystemTheme: enabled });
      },
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        isSystemTheme: state.isSystemTheme,
      }),
    }
  )
);
