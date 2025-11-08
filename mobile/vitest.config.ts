import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.expo',
      'android',
      'ios',
      // NetInfo has Flow syntax that prevents test collection
      'src/components/__tests__/OfflineBanner.test.tsx',
      'src/hooks/__tests__/useNetworkState.test.ts',
      // App.test.tsx requires React Navigation - test in E2E
      'src/__tests__/App.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/**/__tests__/',
        'src/api/', // Exclude generated API files
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-native': path.resolve(__dirname, './src/test/react-native-mock.ts'),
    },
  },
  define: {
    __DEV__: true,
    'global.__DEV__': true,
  },
})
