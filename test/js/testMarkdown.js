'use strict';

const assert = require('assert');

const markdown = require('../../lib/utils/markdown');

const expected = require('./fixtures/markdown/expected');
const input = require('./fixtures/markdown/input');

describe('markdown', function () {
  it('should match expected ctx', function () {
    markdown(input);

    assert.deepEqual(input, expected);
  });
});
