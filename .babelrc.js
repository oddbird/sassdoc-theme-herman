/* eslint-disable no-process-env */

'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: '3',
        exclude: ['transform-regenerator'],
      },
    ],
  ],
};
