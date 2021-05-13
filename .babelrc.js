const config = {
  presets: ['next/babel'],
  env: {
    testCypress: {
      plugins: ['istanbul'],
    },
  },
}
if (
  (process.env.npm_lifecycle_script &&
    process.env.npm_lifecycle_script.search('tsdx build') !== -1) ||
  process.env.npm_lifecycle_script.search('tsdx watch') !== -1
) {
  config.presets = ['@babel/preset-env', '@babel/preset-react']
  console.log('build config 🚀', config)
}

module.exports = config
