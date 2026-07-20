import pluginBabel from "@rolldown/plugin-babel"
import { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  // browser library: keeps rolldown's require-interop shim browser-safe
  // (platform "node" emits a top-level `import { createRequire } from "node:module"`,
  // which breaks consumer browser bundles)
  platform: "browser",
  dts: {
    // tsconfig.json limits "types" to ["vitest/globals"] for tests;
    // reset to ["node"] so all @types/* are auto-included for DTS generation.
    // "bundler" moduleResolution enables package.json exports subpath imports
    // (e.g. @commercelayer/sdk/bundle) which "node" resolution doesn't support.
    compilerOptions: { types: ["node"], moduleResolution: "bundler" },
  },
  fixedExtension: false,
  outDir: "dist",
  clean: true,
  treeshake: true,
  deps: {
    neverBundle: [
      "react",
      "react-dom",
      "@commercelayer/hooks",
      "@commercelayer/core",
      "@commercelayer/sdk",
      "@commercelayer/sdk/bundle",
    ],
  },
  banner: {
    js: '"use client";',
  },
  plugins: [
    pluginBabel({
      // target 19: compiled output imports the built-in react/compiler-runtime
      presets: [reactCompilerPreset({ target: "19" })],
    }),
  ],
})
