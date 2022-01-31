const config = {
  presets: ['next/babel'],
  plugins: [],
}

if (process.env.NODE_ENV === 'test') {
  config.plugins.push('istanbul')
}

module.exports = config
