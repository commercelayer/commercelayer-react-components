import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['mocks', 'specs']
    },
    setupFiles: ['./mocks/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**']
  },
  plugins: [tsconfigPaths(), react()]
})
