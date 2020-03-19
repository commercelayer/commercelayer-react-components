const { resolve, join } = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx|.ts?$/,
        exclude: /node_modules\/(?!(cypress-react-unit-test)\/).*/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-typescript', '@babel/preset-react']
        }
      }
    ]
  },
  resolve: { extensions: ['*', '.js', '.ts', '.jsx', '.tsx'] },
  output: {
    path: resolve(__dirname, 'dist/'),
    publicPath: '/dist/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: join(__dirname, 'cypress/support/'),
    port: 3000,
    publicPath: 'http://localhost:3000/dist/',
    hotOnly: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
}
