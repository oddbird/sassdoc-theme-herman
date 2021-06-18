'use strict';

const path = require('path');

const sassTrue = require('sass-true');

const sassImporter = require('../../lib/utils/sassImporter');

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass(
  { file: sassFile, importer: sassImporter, quietDeps: true },
  { describe, it },
);
