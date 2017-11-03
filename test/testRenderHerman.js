'use strict';

const assert = require('assert');
const renderHerman = require('../lib/renderHerman.js');
const prepareContext = require('../lib/prepareContext.js');

describe('renderHerman', function() {
  it('does the herman things', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      groups: {},
      display: {},
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(
        () => {
          assert(true);
          done();
        },
        err => {
          assert.fail(err);
          done();
        }
      );
  });
});
