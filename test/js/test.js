/* eslint-disable global-require, no-process-env */

'use strict';

const assert = require('assert');
const fs = require('fs');

const Promise = require('bluebird');
const del = require('del');

const access = Promise.promisify(fs.access);

describe('herman', () => {
  before(function () {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function () {
    del.sync(`${this.dest}/*`);
  });

  it('renders herman', function (done) {
    const herman = require('../../');
    const requireAnnotation = herman.annotations.find(
      (a) => a().name === 'require',
    );
    assert.strictEqual(requireAnnotation().autofill, undefined);
    herman(this.dest, { data: [] })
      .then(() => access(`${this.dest}/index.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('can override default autofill setting', () => {
    process.env.HERMAN_ENABLE_AUTOFILL = 1;
    delete require.cache[require.resolve('../../')];
    const herman = require('../../');
    const requireAnnotation = herman.annotations.find(
      (a) => a().name === 'require',
    );
    assert.strictEqual(requireAnnotation, undefined);
    delete process.env.HERMAN_ENABLE_AUTOFILL;
  });
});
