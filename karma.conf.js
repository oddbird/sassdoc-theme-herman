/* eslint-disable no-process-env */

'use strict';

process.env.BABEL_ENV = 'test';

const path = require('path');
const extend = require('extend');
const webpack = require('webpack');

// Use extend instead of Object.assign to do a deep merge,
// because we're modifying nested properties on the new object.
const webpackConf = extend(true, {}, require('./webpack.config.js'));

Reflect.deleteProperty(webpackConf, 'entry');
webpackConf.optimization = {};
webpackConf.devtool = 'cheap-module-inline-source-map';
webpackConf.plugins = [
  new webpack.WatchIgnorePlugin([/flycheck_/, /\.#/, /#$/]),
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    'root.jQuery': 'jquery',
  }),
  new webpack.LoaderOptionsPlugin({ debug: true }),
];

// Instrument source JS with Istanbul
webpackConf.module.rules.push({
  test: /assets\/js\/.*\.js$/,
  exclude: /(node_modules|vendor)/,
  enforce: 'post',
  use: [
    {
      loader: 'istanbul-instrumenter-loader',
      options: {
        esModules: true,
      },
    },
  ],
});

module.exports = (config) => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-sinon'],

    client: { mocha: { ui: 'bdd' } },

    // list of files / patterns to load in the browser
    files: ['test/clientjs/index.js'],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { 'test/clientjs/index.js': ['webpack', 'sourcemap'] },

    webpack: webpackConf,

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'mocha', 'coverage-istanbul', 'junit'],

    // reporter options
    mochaReporter: {
      output: 'minimal',
      showDiff: true,
    },

    coverageIstanbulReporter: {
      dir: path.join(__dirname, 'jscov', 'client'),
      reports: ['html', 'json', 'text'],
      'report-config': {
        html: { subdir: '.' },
        json: { subdir: '.' },
      },
      fixWebpackSourcePaths: true,
    },

    // results will be saved as $outputDir/$browserName.xml
    junitReporter: { outputDir: 'jscov/client/' },

    webpackMiddleware: {
      logLevel: 'error',
      stats: 'errors-only',
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE, config.LOG_ERROR, config.LOG_WARN,
    // config.LOG_INFO, config.LOG_DEBUG
    logLevel: config.LOG_ERROR,

    // enable/disable watching file and executing tests whenever a file changes
    autoWatch: false,

    // start these browsers
    // available launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    browserNoActivityTimeout: 60000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
  });
};
