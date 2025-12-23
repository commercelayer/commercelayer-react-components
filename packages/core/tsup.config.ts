import { defineConfig } from "tsup"

export default defineConfig(() => ({
  entryPoints: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  outDir: "dist",
  clean: true,
  treeshake: true,
}))
