'use strict';

const path = require('path');

const sassTrue = require('sass-true');

const sassImporter = require('../../lib/utils/sassImporter');

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass({ describe, it }, sassFile, {
  importers: [sassImporter],
});
