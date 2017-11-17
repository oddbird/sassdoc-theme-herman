'use strict';

const assert = require('assert');

const { nunjucksEnv } = require('../../lib/utils/templates');

describe('split filter', function() {
  it('returns array of split str', function() {
    const val = 'foo;bar';
    const expected = ['foo', 'bar'];
    const actual = nunjucksEnv.filters.split(val, ';');

    assert.deepEqual(actual, expected);
  });
});

describe('isString filter', function() {
  it('returns true if val is a string', function() {
    const aString = 'foo';
    const notAString = [];

    assert.ok(nunjucksEnv.filters.isString(aString));
    assert.equal(nunjucksEnv.filters.isString(notAString), false);
  });
});
