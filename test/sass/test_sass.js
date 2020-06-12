'use strict';

const path = require('path');
const sassTrue = require('sass-true');
const sass = require('sass');

const importer = function (url) {
  let file = url;
  if (url.startsWith('~')) {
    file = path.resolve('node_modules', url.substr(1));
  }

  return { file };
};

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass({ importer, file: sassFile }, { sass, describe, it });
