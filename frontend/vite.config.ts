// frontend/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // Listen on all interfaces
    port: 5173,
    watch: {
      usePolling: true,  // Important for Docker on some systems
    },
    proxy: {
      '/api': {
        target: 'http://django:8000',  // Use Docker service name
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
