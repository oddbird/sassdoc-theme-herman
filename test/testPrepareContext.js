'use strict';

const assert = require('assert');

const prepareContext = require('../lib/prepareContext');

describe('prepareContext', function() {
  it('resolves to a context', function(done) {
    prepareContext({
      data: [],
      description: 'foo',
    }).then(ctx => {
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
        herman: { sass: {} },
        description: '<p>foo</p>\n',
        data: [],
        byGroup: {},
      };

      assert.deepEqual(ctx, expected);
      done();
    });
  });
});
