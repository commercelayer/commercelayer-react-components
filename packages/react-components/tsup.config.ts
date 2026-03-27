import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    // tsconfig.json limits "types" to ["vitest/globals"] for tests;
    // reset to empty so all @types/* are auto-included for DTS generation
    compilerOptions: { types: ["node"] },
  },
  splitting: true,
  outDir: "dist",
  clean: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "@commercelayer/hooks",
    "@commercelayer/core",
    "@commercelayer/sdk",
  ],
  banner: {
    js: '"use client";',
  },
  babelOptions: {
    plugins: [["babel-plugin-react-compiler"]],
  },
})
