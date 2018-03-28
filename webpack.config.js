/* eslint-disable no-process-env */

'use strict';

process.env.NODE_ENV = 'production';
process.env.BROWSERSLIST_CONFIG = './.browserslistrc';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const sassdoc = require('sassdoc');
const webpack = require('webpack');

const jsOutput = '[name].min.js';
const styleOutput = '[name].min.css';

const outputPath = path.join(__dirname, 'dist', 'webpack');
const sassdocPath = path.join(__dirname, 'docs');

const SassdocPlugin = function() {};
const getCSS = function(entry) {
  if (!entry) {
    return undefined;
  }
  let css;
  for (const thisPath of entry) {
    if (thisPath.substr(-4) === '.css') {
      css = thisPath;
    }
  }
  return css;
};
SassdocPlugin.prototype.apply = compiler => {
  compiler.plugin('after-emit', (compilation, cb) => {
    const statsJSON = compilation.getStats().toJson();
    const css = getCSS(statsJSON.assetsByChunkName.app_styles);
    const json = getCSS(statsJSON.assetsByChunkName.styleguide_json);
    const cssPath = css ? path.join(outputPath, css) : undefined;
    const jsonPath = json ? path.join(outputPath, json) : undefined;
    sassdoc('./scss/**/*.scss', {
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
            name: 'Accoutrement-Color',
            url: 'http://oddbird.net/accoutrement-color/',
          },
          {
            name: 'Accoutrement-Scale',
            url: 'http://oddbird.net/accoutrement-scale/',
          },
          {
            name: 'Accoutrement-Type',
            url: 'http://oddbird.net/accoutrement-type/',
          },
          {
            name: 'Accoutrement-Layout',
            url: 'http://oddbird.net/accoutrement-layout/',
          },
          {
            name: 'Accoutrement-Init',
            url: 'http://oddbird.net/accoutrement-init/',
          },
        ],
        displayColors: ['hex', 'hsl'],
        customCSS: cssPath,
        customHTML: path.join(__dirname, 'templates', '_icons.svg'),
        fontpath: path.join(__dirname, 'fonts'),
        nunjucks: {
          templatepath: path.join(__dirname, 'templates'),
        },
        sass: {
          jsonfile: jsonPath,
          includepaths: [
            path.join(__dirname, 'scss'),
            path.join(__dirname, 'node_modules'),
          ],
          includes: ['utilities', 'config/manifest'],
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
    }).then(
      () => {
        /* eslint-disable no-console */
        console.log('Generated Sassdoc documentation.');
        cb();
      },
      err => {
        console.error(err);
        cb();
        /* eslint-enable no-console */
      }
    );
  });
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
    // pull all CSS out of JS bundles
    new ExtractTextPlugin({
      filename: styleOutput,
    }),
    new SassdocPlugin(),
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
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
                url: false,
              },
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader',
            },
          ],
        }),
      },
    ],
  },
  devtool: false,
};
