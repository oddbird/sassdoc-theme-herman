'use strict';

const path = require('path');

const { NodePackageImporter } = require('sass');
const sassTrue = require('sass-true');

const sassFile = path.join(__dirname, 'test.scss');
sassTrue.runSass({ describe, it }, sassFile, {
  importers: [new NodePackageImporter()],
});
