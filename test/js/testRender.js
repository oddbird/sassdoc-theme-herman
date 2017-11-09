'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const render = require('../../lib/utils/render');
const { nunjucksEnv } = require('../../lib/utils/templates');

const readFile = Promise.promisify(fs.readFile);

describe('render', function() {
  before(function() {
    this.dest = `${__dirname}/dest/base.html`;
  });

  afterEach(function() {
    del.sync(this.dest);
  });

  it('renders nunjucks tpl as a string', function(done) {
    const tpl = path.resolve(__dirname, 'fixtures', 'templates', 'base.j2');
    const ctx = { name: 'World' };

    render(nunjucksEnv, tpl, this.dest, ctx)
      .then(() => readFile(this.dest, 'utf-8'))
      .then(data => {
        assert.equal(
          data,
          '<p>I say: Hello<span class="widont">&nbsp;</span>World!</p>\n'
        );
        done();
      })
      .catch(done);
  });
});
