'use strict';

const assert = require('assert');
const assets = require('../lib/assets.js');

describe('assets', function() {
  it('Returns a valid promise', async function(done) {
    /* This test is, so far, just to test wiring up async/await syntax in tests. */
    const src = '.';
    const dest = '.';
    const options = {
      parser: (file, enc, env) => {},
    };
    const result = await assets(src, dest, options);
    expect(result).to.equal('promise resolved');
  });
});
