/* eslint-disable no-process-env */

'use strict';

process.env.BABEL_ENV = 'test';

const extend = require('extend');
const webpack = require('webpack');
// Use extend instead of Object.assign to do a deep merge,
// because we're modifying nested properties on the new object.
const webpackConf = extend(true, {}, require('./webpack.config.js'));

Reflect.deleteProperty(webpackConf, 'entry');
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

module.exports = config => {
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
    reporters: ['dots', 'mocha', 'coverage', 'junit'],

    // reporter options
    mochaReporter: {
      output: 'minimal',
      showDiff: true,
    },

    coverageReporter: {
      dir: 'jscov/client/',
      reporters: [
        { type: 'html', subdir: '.' },
        { type: 'json', subdir: '.' },
        { type: 'text' },
      ],
      instrumenterOptions: { istanbul: { noCompact: true } },
    },

    // results will be saved as $outputDir/$browserName.xml
    junitReporter: { outputDir: 'jscov/client/' },

    webpackMiddleware: { noInfo: true },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE, config.LOG_ERROR, config.LOG_WARN,
    // config.LOG_INFO, config.LOG_DEBUG
    logLevel: 'WARN',

    // enable/disable watching file and executing tests whenever a file changes
    autoWatch: false,

    // start these browsers
    // available launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
  });
};
