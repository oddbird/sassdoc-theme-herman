'use strict';

const assert = require('assert');
const path = require('path');

const { findFileUrl } = require('../../lib/utils/sassImporter');

describe('sassImporter', () => {
  it('returns resolved path', () => {
    assert.ok(
      findFileUrl('~sass-true')
        .toString()
        .startsWith(`file://${path.resolve(process.cwd(), '.yarn/')}`),
    );
    assert.ok(
      findFileUrl('~@babel/core')
        .toString()
        .startsWith(`file://${path.resolve(process.cwd(), '.yarn/')}`),
    );
  });
});
