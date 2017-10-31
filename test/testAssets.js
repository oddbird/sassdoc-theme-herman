'use strict';

const assert = require('assert');
const assets = require('../lib/assets.js');

describe('assets', function() {
  it('Returns a valid promise', async function() {
    // This test is, so far, just to test wiring up async/await syntax in tests.
    const src = '.';
    const dest = '.';
    await assets(src, dest, {});
    assert.ok(true);
  });
});
