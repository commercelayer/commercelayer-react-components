import { defineConfig } from "tsup"

const env = process.env.NODE_ENV

export default defineConfig((options) => ({
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  outDir: "dist",
  clean: true,
  treeshake: true,
}))
