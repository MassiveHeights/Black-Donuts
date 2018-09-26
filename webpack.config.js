const path = require('path')
const webpack = require('webpack')
const HTMLPlugin = require('html-webpack-plugin')

module.exports = {
  context: `${__dirname}/src`,
  resolve: {
    alias: { res: `${__dirname}/res` },
  },
  entry: {
    main: './main.js',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules/black'),
      ],
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [ ['@babel/preset-env', { modules: false }] ],
          plugins: [
            ['@babel/plugin-transform-runtime', { corejs: 2, useESModules: true }],
          ],
        },
      },
    }, {
      test: path.resolve(__dirname, 'res'),
      type: 'javascript/auto', // fix json type
      loader: 'file-loader',
      options: {
        name: '[name]-[hash:8].[ext]',
      },
    }],
  },
  plugins: [
    new HTMLPlugin({
      template: 'index.html.ejs',
    }),
  ],
}
