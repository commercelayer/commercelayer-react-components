import path from "node:path"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@commercelayer/hooks": path.resolve("../hooks/src/index.ts"),
      "@commercelayer/core": path.resolve("../core/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**"],
      exclude: ["mocks", "specs", "src/**/*.spec.*"],
    },
    setupFiles: ["./mocks/setup.ts"],
    exclude: ["**/e2e/**", "**/node_modules/**"],
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
})
