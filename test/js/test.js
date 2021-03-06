'use strict';

const assert = require('assert');
const fs = require('fs');

const Promise = require('bluebird');
const del = require('del');

const herman = require('../../');

const access = Promise.promisify(fs.access);

describe('herman', () => {
  before(function () {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function () {
    del.sync(`${this.dest}/*`);
  });

  it('renders herman', function (done) {
    herman(this.dest, { data: [] })
      .then(() => access(`${this.dest}/index.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });
});
