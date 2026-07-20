import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  fixedExtension: false,
  outDir: "dist",
  clean: true,
  treeshake: true,
})
