'use strict';

const assert = require('assert');

const {
  makeNunjucksColors,
  getNunjucksEnv,
} = require('../../lib/utils/templates');

const nunjucksEnv = getNunjucksEnv({});

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

describe('makeNunjucksColors', () => {
  before(function () {
    this.colors = makeNunjucksColors({
      herman: {
        displayColors: undefined,
      },
    });
  });

  it('exits early on invalid colors', function () {
    const actual = this.colors('not a color');
    assert.strictEqual(actual, null);
  });

  it('switches on formats', function () {
    const actual = this.colors('#fefced');
    const expected = {
      hex: '#fefced',
      rgb: 'rgb(254, 252, 237)',
      hsl: 'hsl(53, 89%, 96%)',
    };
    assert.deepStrictEqual(actual, expected);
  });

  it('handles rgba and hsla', () => {
    const colors = makeNunjucksColors({
      herman: {
        displayColors: ['rgba', 'hsla'],
      },
    });
    const actual = colors('#fefced');
    const expected = {
      rgb: 'rgb(254, 252, 237)',
      hsl: 'hsl(53, 89%, 96%)',
    };
    assert.deepStrictEqual(actual, expected);
  });

  it('passes on unknown format', () => {
    const colors = makeNunjucksColors({
      herman: {
        displayColors: ['blorble'],
      },
    });
    const actual = colors('#fefced');
    const expected = {};
    assert.deepStrictEqual(actual, expected);
  });
});
