const webpack = require('webpack')
const path = require('path')

/**
 * @type { import("webpack-cli").ConfigOptions }
 */
module.exports = {
  entry: './dist/index.js',

  resolve: {
    extensions: ['.js'],
    alias: {
      HttpReact: path.resolve(__dirname, './dist/index.js')
    }
  },
  externals: {
    react: 'React'
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, 'dist/browser'),
    filename: 'http-react.min.js',
    library: 'HttpReact',
    libraryTarget: 'window'
  }
}
