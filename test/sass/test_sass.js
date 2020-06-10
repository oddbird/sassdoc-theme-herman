/* eslint-env mocha */

'use strict';

const path = require('path');
const sassTrue = require('sass-true');

const importer = function (url) {
  let file = url;
  if (url.startsWith('~')) {
    file = path.resolve('node_modules', url.substr(1));
  }

  return { file };
};

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass({ importer, file: sassFile }, describe, it);
