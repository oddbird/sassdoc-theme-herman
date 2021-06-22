'use strict';

const assert = require('assert');

const markdown = require('../../lib/utils/markdown');

const expected = require('./fixtures/markdown/expected');
const input = require('./fixtures/markdown/input');

describe('markdown', () => {
  it('should match expected ctx', () => {
    markdown(input);

    assert.deepStrictEqual(input, expected);
  });
});
