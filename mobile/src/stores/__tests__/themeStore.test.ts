import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useThemeStore } from '../themeStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('themeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useThemeStore.setState({
      theme: 'light',
      isSystemTheme: true,
    });
  });

  describe('initial state', () => {
    it('should have light theme by default', () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.theme).toBe('light');
    });

    it('should use system theme by default', () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.isSystemTheme).toBe(true);
    });

    it('should have isDark computed as false for light theme', () => {
      const { result } = renderHook(() => useThemeStore());

      expect(result.current.isDark).toBe(false);
    });
  });

  describe('setTheme', () => {
    it('should update theme to dark', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should update theme to light', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Set to dark first
      await act(async () => {
        await result.current.setTheme('dark');
      });

      // Then set to light
      await act(async () => {
        await result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
    });

    it('should persist theme to AsyncStorage', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({ theme: 'dark', isSystemTheme: false })
        );
      });
    });

    it('should set isSystemTheme to false when manually setting theme', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.isSystemTheme).toBe(false);
    });

    it('should update isDark computed property', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.isDark).toBe(true);

      await act(async () => {
        await result.current.setTheme('light');
      });

      expect(result.current.isDark).toBe(false);
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should toggle from dark to light', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Set to dark first
      await act(async () => {
        await result.current.setTheme('dark');
      });

      // Then toggle
      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
    });

    it('should persist toggled theme to AsyncStorage', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({ theme: 'dark', isSystemTheme: false })
        );
      });
    });

    it('should set isSystemTheme to false when toggling', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.toggleTheme();
      });

      expect(result.current.isSystemTheme).toBe(false);
    });
  });

  describe('setSystemTheme', () => {
    it('should enable system theme mode', async () => {
      const { result } = renderHook(() => useThemeStore());

      // Disable system theme first
      await act(async () => {
        await result.current.setTheme('dark');
      });

      // Then enable system theme
      await act(async () => {
        await result.current.setSystemTheme(true);
      });

      expect(result.current.isSystemTheme).toBe(true);
    });

    it('should disable system theme mode', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setSystemTheme(false);
      });

      expect(result.current.isSystemTheme).toBe(false);
    });

    it('should persist system theme preference to AsyncStorage', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setSystemTheme(false);
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'theme',
          JSON.stringify({ theme: 'light', isSystemTheme: false })
        );
      });
    });
  });

  describe('persistence', () => {
    it('should load theme from AsyncStorage on mount', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ theme: 'dark', isSystemTheme: false })
      );

      // Create new store instance
      const { result } = renderHook(() => useThemeStore());

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.isSystemTheme).toBe(false);
      });
    });

    it('should handle missing AsyncStorage data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useThemeStore());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.isSystemTheme).toBe(true);
      });
    });

    it('should handle corrupted AsyncStorage data gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');

      const { result } = renderHook(() => useThemeStore());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.isSystemTheme).toBe(true);
      });
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useThemeStore());

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.isSystemTheme).toBe(true);
      });
    });
  });

  describe('derived state', () => {
    it('should compute isDark as true for dark theme', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.isDark).toBe(true);
    });

    it('should compute isDark as false for light theme', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('light');
      });

      expect(result.current.isDark).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should only accept valid theme values (light or dark)', () => {
      const { result } = renderHook(() => useThemeStore());

      // TypeScript enforces this at compile time
      // Only 'light' | 'dark' are allowed
      expect(['light', 'dark']).toContain(result.current.theme);
    });
  });
});
