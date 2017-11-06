'use strict';

const assert = require('assert');
const vfs = require('vinyl-fs');
const sinon = require('sinon');

const assets = require('../lib/assets');

describe('assets', function() {
  it('Runs the vfs pipeline', function(done) {
    const src = '.';
    const dest = 'dest';
    const destSpy = sinon.spy(vfs, 'dest');
    // Complete the promise chain, then let's check side-effects:
    assets(src, dest, {}).then(() => {
      assert(destSpy.calledWith(dest));
      done();
    });
  });
});
