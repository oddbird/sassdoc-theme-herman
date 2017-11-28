/* eslint-disable no-process-env */

'use strict';

const env = process.env.BABEL_ENV;
const plugins = [];
if (env === 'test') {
  plugins.push(['istanbul', { include: ['assets/js/!(init).js'] }]);
}

module.exports = {
  plugins,
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        useBuiltIns: 'entry',
        exclude: ['transform-regenerator'],
      },
    ],
  ],
};
