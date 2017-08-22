/* eslint-env mocha */

const path = require('path');
const sassTrue = require('sass-true');

const importer = function(url) {
  if (url[0] === '~') {
    url = path.resolve('node_modules', url.substr(1));
  }

  return { file: url };
};

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass({ importer, file: sassFile }, describe, it);
