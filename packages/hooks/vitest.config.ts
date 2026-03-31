import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "hooks",
    environment: "jsdom",
    testTimeout: 30000,
    fileParallelism: false,
    setupFiles: ["./src/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/extender.ts"],
      thresholds: {
        statements: 100,
        branches: 95,
        functions: 100,
        lines: 100,
      },
    },
  },
  plugins: [tsconfigPaths()],
})
