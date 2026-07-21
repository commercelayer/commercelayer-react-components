import path from "node:path"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  envDir: path.resolve(__dirname, "../.."),
  test: {
    name: "core",
    environment: "node",
    // Integration tests hit the live Commerce Layer API; the 5s default is too tight
    testTimeout: 15_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/extender.ts"],
    },
  },
  plugins: [tsconfigPaths()],
})
