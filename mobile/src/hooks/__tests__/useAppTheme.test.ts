import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from '../useAppTheme';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/theme';

// Mock the theme store
vi.mock('@/stores/themeStore');
const mockUseThemeStore = useThemeStore as vi.MockedFunction<typeof useThemeStore>;

describe('useAppTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('theme selection', () => {
    it('should return light theme when theme is light', () => {
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        isDark: false,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.theme).toEqual(lightTheme);
    });

    it('should return dark theme when theme is dark', () => {
      mockUseThemeStore.mockReturnValue({
        theme: 'dark',
        isDark: true,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.theme).toEqual(darkTheme);
    });
  });

  describe('theme actions', () => {
    it('should expose setTheme function', () => {
      const mockSetTheme = vi.fn();
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        isDark: false,
        isSystemTheme: false,
        setTheme: mockSetTheme,
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.setTheme).toBe(mockSetTheme);
    });

    it('should expose toggleTheme function', () => {
      const mockToggleTheme = vi.fn();
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        isDark: false,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: mockToggleTheme,
        setSystemTheme: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.toggleTheme).toBe(mockToggleTheme);
    });

    it('should expose setSystemTheme function', () => {
      const mockSetSystemTheme = vi.fn();
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        isDark: false,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: mockSetSystemTheme,
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.setSystemTheme).toBe(mockSetSystemTheme);
    });
  });

  describe('theme state', () => {
    it('should expose isDark state', () => {
      mockUseThemeStore.mockReturnValue({
        theme: 'dark',
        isDark: true,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.isDark).toBe(true);
    });

    it('should expose isSystemTheme state', () => {
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        isDark: false,
        isSystemTheme: true,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      const { result } = renderHook(() => useAppTheme());

      expect(result.current.isSystemTheme).toBe(true);
    });
  });

  describe('theme reactivity', () => {
    it('should update theme when store changes', () => {
      // Start with light theme
      mockUseThemeStore.mockReturnValue({
        theme: 'light',
        isDark: false,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      const { result, rerender } = renderHook(() => useAppTheme());
      expect(result.current.theme).toEqual(lightTheme);

      // Switch to dark theme
      mockUseThemeStore.mockReturnValue({
        theme: 'dark',
        isDark: true,
        isSystemTheme: false,
        setTheme: vi.fn(),
        toggleTheme: vi.fn(),
        setSystemTheme: vi.fn(),
      } as any);

      rerender({});
      expect(result.current.theme).toEqual(darkTheme);
    });
  });
});
