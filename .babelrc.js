/* eslint-disable no-process-env */

'use strict';

const env = process.env.BABEL_ENV;
const plugins = ['./arrow-function-coverage-fix.js'];
if (env === 'test') {
  plugins.push(['istanbul', { include: ['assets/js/*!(init).js'] }]);
}

module.exports = {
  plugins,
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        exclude: ['transform-regenerator'],
      },
    ],
  ],
};
