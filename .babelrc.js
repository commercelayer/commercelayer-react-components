let presets = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
}
if (process.env.npm_lifecycle_script.search('tsdx build') === -1) {
  presets = {
    presets: ['next/babel'],
  }
}
module.exports = presets
