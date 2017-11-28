'use strict';

module.exports = {
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
