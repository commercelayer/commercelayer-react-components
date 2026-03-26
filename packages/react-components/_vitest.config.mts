import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@commercelayer/hooks': path.resolve('../hooks/src/index.ts'),
      '@commercelayer/core': path.resolve('../core/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['mocks', 'specs']
    },
    setupFiles: ['./mocks/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**']
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']]
      }
    })
  ]
})
