import path from "node:path"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "core",
    environment: "node",
    envDir: path.resolve(__dirname, "../.."),
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/extender.ts"],
    },
  },
  plugins: [tsconfigPaths()],
})
