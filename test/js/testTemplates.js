'use strict';

const assert = require('assert');

const { nunjucksEnv } = require('../../lib/utils/templates');

describe('split filter', () => {
  it('returns array of split str', () => {
    const val = 'foo;bar';
    const expected = ['foo', 'bar'];
    const actual = nunjucksEnv.filters.split(val, ';');

    assert.deepStrictEqual(actual, expected);
  });
});

describe('isString filter', () => {
  it('returns true if val is a string', () => {
    const aString = 'foo';
    const notAString = [];

    assert.ok(nunjucksEnv.filters.isString(aString));
    assert.strictEqual(nunjucksEnv.filters.isString(notAString), false);
  });
});
