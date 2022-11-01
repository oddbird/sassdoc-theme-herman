'use strict';

const assert = require('assert');

const sinon = require('sinon');

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
    this.ctx = {
      herman: {
        displayColors: undefined,
      },
      logger: {
        warn: sinon.fake(),
      },
    };
    this.colors = makeNunjucksColors(this.ctx);
  });

  it('exits early on invalid colors', function () {
    const actual = this.colors('not a color');
    assert.strictEqual(actual, null);
    sinon.assert.calledOnce(this.ctx.logger.warn);
  });

  it('exits early on CSS custom properties', function () {
    const actual = this.colors('var(--my-color)');
    assert.strictEqual(actual, null);
    sinon.assert.notCalled(this.ctx.logger.warn);
  });

  it('switches on formats', function () {
    const actual = this.colors('#fefced');
    const expected = {
      hex: '#fefced',
      rgb: 'rgb(99.608% 98.824% 92.941%)',
      hsl: 'hsl(52.941 89.474% 96.275%)',
    };
    assert.deepStrictEqual(actual, expected);
  });

  it('handles rgba and hsla', () => {
    const colors = makeNunjucksColors({
      herman: {
        displayColors: ['rgba', 'hsla'],
      },
    });
    const actual = colors('hsl(53deg 89% 96% / 0.5)');
    const expected = {
      rgb: 'rgb(99.56% 98.729% 92.44% / 0.5)',
      hsl: 'hsl(53 89% 96% / 0.5)',
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
