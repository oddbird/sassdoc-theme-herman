'use strict';

const assert = require('assert');
const vfs = require('vinyl-fs');
const sinon = require('sinon');

const assets = require('../lib/assets');

describe('assets', function() {
  it('Runs the vfs pipeline', async function() {
    const src = '.';
    const dest = 'dest';
    const destSpy = sinon.spy(vfs, 'dest');
    // Complete the promise chain, then let's check side-effects:
    await assets(src, dest, {});
    assert(destSpy.calledWith(dest));
  });
});
