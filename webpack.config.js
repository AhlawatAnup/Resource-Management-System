const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
require('dotenv').config();

const path = require('path');

const dev_mode = process.env.MODE == 'dev' ? 'development' : 'production';

const css_rules =
  dev_mode == 'development'
    ? [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ]
    : [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ];

// ADD THIS
const js_rule = {
  test: /\.js$/,
  exclude: /node_modules/,
  type: 'javascript/auto',
  use: {
    loader: 'babel-loader',
    options: { sourceType: 'unambiguous', presets: ['@babel/preset-env'] },
  },
};

const plugin_use =
  dev_mode == 'development'
    ? []
    : [
        new MiniCssExtractPlugin({
          filename: '[name].packs.css',
        }),
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: true,
          reportFilename: 'report.html',
        }),
      ];

module.exports = {
  mode: dev_mode,

  entry: {
    admin: './public_src/admin/js/admin.packer.js',
    student: './public_src/student/js/student.packer.js',
  },

  output: {
    filename: '[name].packs.js',
    path: path.resolve(__dirname, 'public', 'packs'),
  },

  module: {
    rules: [js_rule, ...css_rules],
  },

  resolve: {
    extensions: ['.js'],
  },

  plugins: plugin_use,
};
