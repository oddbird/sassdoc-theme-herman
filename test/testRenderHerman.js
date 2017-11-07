'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');

const prepareContext = require('../lib/prepareContext');
const renderHerman = require('../lib/renderHerman');

describe('renderHerman', function() {
  it('does the herman things', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        fs.access(`${dest}/index.html`, err => {
          assert.equal(err, undefined);

          del(`${dest}/*`).then(() => {
            done();
          });
        });
      });
  });
});
