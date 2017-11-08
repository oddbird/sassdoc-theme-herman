'use strict';

const assert = require('assert');

const parseSubprojects = require('../../lib/parseSubprojects');
const prepareContext = require('../../lib/prepareContext');

describe('parseSubprojects', function() {
  it('does a parseSubprojects', function(done) {
    const env = {
      data: [],
      herman: {
        subprojects: ['accoutrement-color'],
      },
    };
    let result;

    prepareContext(env)
      .then(ctx => {
        result = ctx;
        return parseSubprojects(ctx);
      })
      .then(() => {
        assert.equal(
          result.subprojects['accoutrement-color'].activeProject,
          'accoutrement-color'
        );

        done();
      });
  });
});
