import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: {
    // tsconfig.json limits "types" to ["vitest/globals"] for tests;
    // reset to empty so all @types/* are auto-included for DTS generation.
    // "bundler" moduleResolution enables package.json exports subpath imports
    // (e.g. @commercelayer/sdk/bundle) which "node" resolution doesn't support.
    compilerOptions: { types: ["node"], moduleResolution: "bundler" },
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
    "@commercelayer/sdk/bundle",
  ],
  banner: {
    js: '"use client";',
  },
  babelOptions: {
    plugins: [["babel-plugin-react-compiler"]],
  },
})
