'use strict';

const assert = require('assert');
const herman = require('../lib/herman.js');
const prepareContext = require('../lib/prepareContext.js');

describe('herman', function() {
  it('renders herman', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      groups: {},
      display: {},
    }).then(ctx => {
      herman(dest, ctx).then(
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
