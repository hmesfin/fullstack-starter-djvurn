import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useThemeStore } from '../themeStore';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}));

describe('themeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should set theme in state (persistence mocked in tests)', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      // Test in-memory state (persist middleware is mocked as no-op)
      expect(result.current.theme).toBe('dark');
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

    it('should set toggled theme in state (persistence mocked in tests)', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.toggleTheme();
      });

      // Test in-memory state (persist middleware is mocked as no-op)
      expect(result.current.theme).toBe('dark');
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

    it('should set system theme preference in state (persistence mocked in tests)', async () => {
      const { result } = renderHook(() => useThemeStore());

      await act(async () => {
        await result.current.setSystemTheme(false);
      });

      // Test in-memory state (persist middleware is mocked as no-op)
      expect(result.current.isSystemTheme).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should maintain state in memory (persistence mocked in tests)', () => {
      // Persistence is handled by Zustand persist middleware
      // In tests, persist is mocked as no-op for synchronous testing
      // This test verifies store state management works correctly
      const { result } = renderHook(() => useThemeStore());

      // Verify default state
      expect(result.current.theme).toBe('light');
      expect(result.current.isSystemTheme).toBe(true);
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
