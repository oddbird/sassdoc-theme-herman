'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');

const herman = require('../../');

describe('herman', function() {
  before(function() {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function() {
    del.sync(`${this.dest}/*`);
  });

  it('renders herman', function(done) {
    herman(this.dest, { data: [] }).then(() => {
      fs.access(`${this.dest}/index.html`, err => {
        assert.equal(err, undefined);

        done();
      });
    });
  });
});
