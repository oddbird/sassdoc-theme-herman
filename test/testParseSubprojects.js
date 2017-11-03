'use strict';

const assert = require('assert');
const parseSubprojects = require('../lib/parseSubprojects.js');
const prepareContext = require('../lib/prepareContext.js');

describe('parseSubprojects', function() {
  it('does a parseSubprojects', function(done) {
    prepareContext({
      data: [],
      groups: {},
      display: {},
      herman: {
        subprojects: [],
      },
    })
      .then(ctx => parseSubprojects(ctx))
      .then(
        () => {
          // Look for side-effects
          assert.ok(true);
          done();
        },
        err => {
          assert.fail(err);
          done();
        }
      );
  });
});
