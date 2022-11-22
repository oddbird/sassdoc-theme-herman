'use strict';

const assert = require('assert');
const fs = require('fs/promises');

const del = require('del');

const herman = require('../../');

describe('herman', () => {
  before(function () {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function () {
    del.sync(`${this.dest}/*`);
  });

  it('renders herman', function (done) {
    herman(this.dest, { data: [] })
      .then(() => fs.access(`${this.dest}/index.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('skips autofill for prose block', () => {
    const prose = {
      commentRange: {
        start: 0,
        end: 5,
      },
      context: {
        name: 'Test\nItem',
        line: {
          start: 8,
          end: 10,
        },
        code: '@content',
      },
    };
    const notProse = {
      commentRange: {
        start: 0,
        end: 6,
      },
      context: {
        name: 'Test\nItem',
        line: {
          start: 8,
          end: 10,
        },
        code: '@content',
      },
    };
    const annotation = herman.annotations.find((a) => a().name === 'content')();

    assert.ok(annotation.autofill(prose) === undefined);
    assert.ok(annotation.autofill(notProse) !== undefined);
  });
});
