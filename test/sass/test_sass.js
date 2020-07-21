'use strict';

const path = require('path');

const sassTrue = require('sass-true');
const sass = require('sass');

const sassImporter = require('../../lib/utils/sassImporter');

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass(
  { file: sassFile, importer: sassImporter },
  { sass, describe, it },
);
