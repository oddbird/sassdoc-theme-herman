'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');

const herman = require('../');

describe('herman', function() {
  it('renders herman', function(done) {
    const dest = `${__dirname}/dest`;
    herman(dest, { data: [] }).then(() => {
      fs.access(`${dest}/index.html`, err => {
        assert.equal(err, undefined);

        del(dest).then(() => {
          done();
        });
      });
    });
  });
});
