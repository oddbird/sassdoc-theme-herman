'use strict';

const assert = require('assert');
const path = require('path');

const importer = require('../../lib/utils/sassImporter');

describe('sassImporter', () => {
  it('returns resolved path', () => {
    assert.ok(
      importer('~sass-true').file.startsWith(
        path.resolve(process.cwd(), '.yarn/cache'),
      ),
    );
    assert.ok(
      importer('~@babel/core').file.startsWith(
        path.resolve(process.cwd(), '.yarn/cache'),
      ),
    );
  });
});
