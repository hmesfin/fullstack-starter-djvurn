import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Define __DEV__ global
;(global as typeof global & { __DEV__: boolean }).__DEV__ = true

// Mock AsyncStorage
const asyncStorageMock = {
  getItem: vi.fn(() => Promise.resolve(null)),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
  clear: vi.fn(() => Promise.resolve()),
  getAllKeys: vi.fn(() => Promise.resolve([])),
  multiGet: vi.fn(() => Promise.resolve([])),
  multiSet: vi.fn(() => Promise.resolve()),
  multiRemove: vi.fn(() => Promise.resolve()),
}

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: asyncStorageMock,
  ...asyncStorageMock,
}))

// Mock NetInfo
vi.mock('@react-native-community/netinfo', () => ({
  useNetInfo: vi.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: null,
  })),
  fetch: vi.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: null,
    })
  ),
  addEventListener: vi.fn(),
}))

// Mock react-native-paper
vi.mock('react-native-paper', () => ({
  PaperProvider: ({ children }: { children: React.ReactNode }) => children,
  Portal: ({ children }: { children: React.ReactNode }) => children,
  Button: 'Button',
  Text: 'Text',
  Card: 'Card',
  IconButton: 'IconButton',
  MD3LightTheme: {
    dark: false,
    colors: {
      primary: '#6200ee',
      background: '#ffffff',
      surface: '#ffffff',
      onBackground: '#000000',
      onSurface: '#000000',
      onSurfaceVariant: '#49454F',
      surfaceVariant: '#e7e0ec',
      outline: '#79747e',
      error: '#b3261e',
      onError: '#ffffff',
    },
  },
  MD3DarkTheme: {
    dark: true,
    colors: {
      primary: '#d0bcff',
      background: '#1c1b1f',
      surface: '#1c1b1f',
      onBackground: '#e6e1e5',
      onSurface: '#e6e1e5',
      onSurfaceVariant: '#cac4d0',
      surfaceVariant: '#49454f',
      outline: '#938f99',
      error: '#f2b8b5',
      onError: '#601410',
    },
  },
  useTheme: () => ({
    colors: {
      primary: '#6200ee',
      background: '#ffffff',
      surface: '#ffffff',
      onBackground: '#000000',
      onSurface: '#000000',
      onSurfaceVariant: '#49454F',
    },
  }),
}))

// Mock expo-status-bar
vi.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}))

// Mock react-native-safe-area-context
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}))

// Mock Zustand persist middleware (Option C - disable persistence in tests)
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual<typeof import('zustand/middleware')>('zustand/middleware')
  return {
    ...actual,
    persist: (config: any) => config, // No-op persist - makes tests synchronous
  }
})
