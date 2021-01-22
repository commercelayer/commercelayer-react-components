const ttypescript = require('ttypescript')
const tsPlugin = require('rollup-plugin-typescript2')
// These rollup configurations together support `npm start` and `npm run build`
// with absolute file paths in TSDX

module.exports = {
  rollup(config, options) {
    config.plugins.push({
      plugins: [
        tsPlugin({
          typescript: ttypescript,
        }),
      ],
    })
    return {
      ...config,
    }
  },
}
