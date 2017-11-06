'use strict';

const assert = require('assert');

const prepareContext = require('../lib/prepareContext');
const theme = require('../');

describe('herman', function() {
  it('renders herman', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      groups: {},
      display: {},
    }).then(ctx => {
      theme(dest, ctx).then(
        () => {
          // assert something about the mutated state?
          done();
        },
        err => {
          assert.fail(err);
          done();
        }
      );
    });
  });
});
