import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "core",
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
})
