'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const path = require('path');

const render = require('../../lib/utils/render');
const { nunjucksEnv } = require('../../lib/utils/templates');

describe('render', function() {
  before(function() {
    this.dest = `${__dirname}/dest/base.html`;
  });

  afterEach(function() {
    del.sync(this.dest);
  });

  it('does a render', function(done) {
    const tpl = path.resolve(__dirname, 'files', 'base.j2');
    const ctx = { name: 'World' };

    render(nunjucksEnv, tpl, this.dest, ctx).then(() => {
      fs.readFile(this.dest, (err, data) => {
        assert.equal(err, undefined);
        assert.equal(data, 'Hello World!');

        done();
      });
    });
  });
});
