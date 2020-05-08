const config = {
  presets: ['next/babel'],
}
if (
  process.env.npm_lifecycle_script &&
  process.env.npm_lifecycle_script.search('tsdx build') !== -1
) {
  config.presets = ['@babel/preset-env', '@babel/preset-react']
  console.log('build config 🚀', config)
}
module.exports = config
