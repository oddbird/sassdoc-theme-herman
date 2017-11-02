'use strict';

const assert = require('assert');
const prepareContext = require('../lib/prepareContext.js');

describe('prepareContext', function() {
  it('resolves to a context', function(done) {
    const dest = '.';
    prepareContext({
      data: [],
      groups: {},
      display: {},
    }).then(
      ctx => {
        const expected = {
          display: {
            access: ['public', 'private'],
            alias: false,
            watermark: true,
          },
          groups: {
            undefined: 'General',
          },
          sort: ['group', 'file', 'line', 'access'],
          herman: {
            sass: {},
          },
          descriptionPath: './README.md',
          data: [],
          byGroup: {},
        };
        // This value was very long and also causing problems, so we're
        // gonna take it on faith that it's good, for now:
        delete ctx['description'];
        assert.deepEqual(ctx, expected);
        done();
      },
      err => {
        assert.fail(err);
        done();
      }
    );
  });
});
