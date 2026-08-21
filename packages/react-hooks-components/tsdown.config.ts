import pluginBabel from "@rolldown/plugin-babel"
import { reactCompilerPreset } from "@vitejs/plugin-react"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  fixedExtension: false,
  outDir: "dist",
  clean: true,
  treeshake: true,
  plugins: [
    pluginBabel({
      // target 19: compiled output imports the built-in react/compiler-runtime,
      // which requires the react >=19 peer range
      presets: [reactCompilerPreset({ target: "19" })],
    }),
  ],
})
