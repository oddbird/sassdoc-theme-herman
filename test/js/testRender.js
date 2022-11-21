'use strict';

const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');

const del = require('del');

const render = require('../../lib/utils/render');
const { getNunjucksEnv } = require('../../lib/utils/templates');

const nunjucksEnv = getNunjucksEnv({});

describe('render', () => {
  before(function () {
    this.dest = `${__dirname}/dest/base.html`;
    this.tpl = path.resolve(__dirname, 'fixtures', 'templates', 'base.njk');
  });

  afterEach(function () {
    del.sync(this.dest);
  });

  it('renders nunjucks tpl as a string', function (done) {
    const ctx = { name: 'World' };

    render(nunjucksEnv, this.tpl, this.dest, ctx)
      .then(() => fs.readFile(this.dest, 'utf-8'))
      .then((data) => {
        assert.ok(data.includes('<title>Title | Herman Documentation</title>'));
        assert.ok(
          data.includes(
            '<p>I say: Hello<span class="widont">&nbsp;</span>World!</p>',
          ),
        );
        done();
      })
      .catch(done);
  });

  it('adds doc data to "rendered" array', function (done) {
    const ctx = { name: 'World' };
    const rendered = [];
    const expected = [
      {
        filename: 'base.html',
        title: 'Title',
        contents: 'I say: Hello World!',
      },
    ];

    render(nunjucksEnv, this.tpl, this.dest, ctx, rendered)
      .then(() => {
        assert.deepStrictEqual(rendered, expected);
        done();
      })
      .catch(done);
  });
});
