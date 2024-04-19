import { defineConfig } from 'tsup'

const env = process.env['NODE_ENV']

export default defineConfig((options) => ({
  sourcemap: true, // source map is only available in prod
  clean: true, // clean dist before build
  dts: true, // generate dts file for main module
  format: ['cjs', 'esm'], // generate cjs and esm files
  minify: !options.watch,
  bundle: true,
  watch: env === 'development',
  target: 'es2020',
  entry: ['src/index.ts']
}))
