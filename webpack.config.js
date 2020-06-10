/* eslint-disable no-process-env */

'use strict';

process.env.NODE_ENV = 'production';
process.env.BROWSERSLIST_CONFIG = './.browserslistrc';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const SassDocPlugin = require('./sassdoc-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const sass = require('sass');

const jsOutput = '[name].min.js';
const styleOutput = '[name].min.css';

const outputPath = path.join(__dirname, 'dist', 'webpack');
const sassdocPath = path.join(__dirname, 'docs');

const sassDocOpts = {
  src: './scss/**/*.scss',
  dest: sassdocPath,
  theme: __dirname,
  herman: {
    extraDocs: [
      { name: 'Configuration', path: './CONFIGURATION.md' },
      { name: 'Changelog', path: './CHANGELOG.md' },
      { name: 'Contributing', path: './CONTRIBUTING.md' },
    ],
    extraLinks: [
      {
        name: 'Accoutrement',
        url: 'http://oddbird.net/accoutrement/',
      },
    ],
    displayColors: ['hex', 'hsl'],
    customHTML: path.join(__dirname, 'templates', '_icons.svg'),
    fontpath: path.join(__dirname, 'fonts'),
    nunjucks: {
      templatepath: path.join(__dirname, 'templates'),
    },
    sass: {
      includepaths: [
        path.join(__dirname, 'scss'),
        path.join(__dirname, 'node_modules'),
      ],
      includes: ['utilities', 'config/manifest'],
      implementation: sass,
    },
  },
  display: {
    alias: true,
  },
  groups: {
    'Public API': {
      'api_json-export': 'Exporting Styles to JSON',
      'api_sass-accoutrement': 'Accoutrement Integration',
      demo_colors: 'Color Palettes',
      demo_fonts: 'Font Specimens',
      demo_sizes: 'Ratios & Sizes',
      demo_icons: 'SVG Icons',
      demo_examples: 'Rendered Examples',
      'demo_test-sassdoc': 'SassDoc Annotations',
    },
    '_Design Tokens': {
      'config-colors': '_Colors',
      'config-scale': '_Sizes',
      'config-fonts': '_Fonts',
      'config-utils': '_Utilities',
      'config_api-utilities': '_API Utils',
    },
    _Layout: {
      'style-regions': '_Regions',
      'style-banner': '_Banner',
      'style-nav': '_Nav',
      'style-main': '_Main',
    },
    _Patterns: {
      'style-icons': '_Icons',
      'style-typography': '_Typography',
      'style-code': '_Code Blocks',
    },
    _Components: {
      'component-nav': '_Nav',
      'component-footer': '_Footer',
      'component-breadcrumb': '_Breadcrumb',
    },
  },
};

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  // context for entry points
  context: path.join(__dirname, 'assets', 'js'),
  // define all the entry point bundles
  entry: {
    app: './init',
    search: './search',
    app_styles: ['main.scss'],
    iframe_styles: ['iframes.scss'],
    styleguide_json: ['json.scss'],
  },
  output: {
    path: outputPath,
    publicPath: '/assets/webpack/',
    filename: jsOutput,
  },
  resolve: {
    // where to look for "required" modules
    modules: ['assets/js', 'templates/client', 'scss', 'node_modules'],
    alias: {
      jquery: 'jquery/dist/jquery.slim',
      nunjucks: 'nunjucks/browser/nunjucks-slim',
    },
  },
  resolveLoader: {
    alias: { sassjson: path.join(__dirname, 'sass-json-loader') },
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        // pull common code into common bundle
        common: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2,
          minSize: 0,
        },
      },
    },
  },
  plugins: [
    // ignore flycheck and Emacs special files when watching
    new webpack.WatchIgnorePlugin([/flycheck_/, /\.#/, /#$/]),
    // make jquery accessible in all modules that use it
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'root.jQuery': 'jquery',
    }),
    new OptimizeCSSAssetsPlugin(),
    // pull all CSS out of JS bundles
    new MiniCssExtractPlugin({
      filename: styleOutput,
    }),
    new SassDocPlugin(sassDocOpts, {
      assetPaths: [
        { entry: 'app_styles', optPath: 'herman.customCSS' },
        { entry: 'styleguide_json', optPath: 'herman.sass.jsonfile' },
      ],
      outputPath,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.HashedModuleIdsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /(assets\/js\/.*\.js$|test\/clientjs\/.*\.js$)/,
        exclude: /(node_modules|vendor)/,
        use: ['babel-loader'],
      },
      {
        test: /\.njk$/,
        use: [
          {
            loader: 'jinja-loader',
            options: {
              root: path.join(__dirname, 'templates', 'client/'),
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  devtool: false,
};
