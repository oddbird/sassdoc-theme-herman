'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const path = require('path');

const render = require('../lib/utils/render');
const { nunjucksEnv } = require('../lib/utils/templates');

describe('render', function() {
  it('does a render', function(done) {
    const tpl = path.resolve(__dirname, 'templates', 'base.j2');
    const dest = `${__dirname}/dest/base.html`;
    const ctx = { name: 'World' };

    render(nunjucksEnv, tpl, dest, ctx).then(() => {
      fs.readFile(dest, 'utf-8', (err, data) => {
        assert.equal(err, undefined);
        assert.equal(data, 'Hello World!\n');

        del(dest).then(() => {
          done();
        });
      });
    });
  });
});
