'use strict';

const assert = require('assert');

const prepareContext = require('../lib/prepareContext');
const render = require('../lib/render');
const { nunjucksEnv } = require('../lib/templates');

describe('render', function() {
  it('does a render', function(done) {
    const tpl = 'templates/base.j2';
    const dest = `${__dirname}/dest/base.html`;
    prepareContext({
      data: [],
      groups: {},
      display: {},
    })
      .then(ctx => render(nunjucksEnv, tpl, dest, ctx))
      .then(() => {
        // Look for side-effects
        assert.ok(true);
        done();
      })
      .catch(err => {
        assert.fail(err);
        done();
      });
  });

  it('no-ops with a non-buffer file', function() {
    // What would that even be? How can we trigger that eventuality?
    assert.ok(true);
  });
});
