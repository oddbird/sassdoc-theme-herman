/* eslint-disable no-process-env */

'use strict';

process.env.BROWSERSLIST_CONFIG = './.browserslistrc';

const path = require('path');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const SassDocPlugin = require('./sassdoc-webpack-plugin');

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
        url: 'https://www.oddbird.net/accoutrement/',
      },
    ],
    displayColors: ['hex', 'hsl'],
    customHTML: path.join(__dirname, 'templates', '_icons.svg'),
    fontPath: path.join(__dirname, 'fonts'),
    nunjucks: {
      templatePath: path.join(__dirname, 'templates'),
    },
    sass: {
      includePaths: [
        path.join(__dirname, 'scss'),
        path.join(__dirname, 'node_modules'),
      ],
      use: ['utilities', 'config', 'samples'],
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
  mode: 'production',
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
    filename: '[name].min.js',
  },
  resolve: {
    // where to look for "required" modules
    modules: ['templates/client', 'scss', 'node_modules'],
    alias: {
      jquery: 'jquery/dist/jquery.slim',
      nunjucks: 'nunjucks/browser/nunjucks-slim',
    },
  },
  resolveLoader: {
    alias: { sassjson: path.join(__dirname, 'sass-json-loader') },
  },
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
    moduleIds: 'deterministic',
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
  performance: {
    hints: false,
  },
  devServer: {
    static: [path.join(__dirname, 'docs')],
    hot: false,
  },
  plugins: [
    // make jquery accessible in all modules that use it
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'root.jQuery': 'jquery',
    }),
    // pull all CSS out of JS bundles
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
    new SassDocPlugin(sassDocOpts, {
      assetPaths: [
        { entry: 'app_styles', optPath: 'herman.customCSS' },
        { entry: 'styleguide_json', optPath: 'herman.sass.jsonFile' },
      ],
      outputPath,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
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
            options: {
              sassOptions: {
                quietDeps: true,
              },
            },
          },
        ],
      },
    ],
  },
  devtool: 'source-map',
};
