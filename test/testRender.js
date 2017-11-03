'use strict';

const assert = require('assert');

const render = require('../lib/render');
const prepareContext = require('../lib/prepareContext');

describe('render', function() {
  it('does a render', function(done) {
    const env = {
      herman: {
        customCSS: 'dist/css/main.css',
        minifiedIcons: 'templates/_icons.svg',
        sass: {
          jsonfile: 'dist/css/json.css',
        },
      },
      dir: __dirname,
      renderString() {},
    };
    const tpl = 'templates/base.j2';
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      groups: {},
      display: {},
    })
      .then(ctx => render(env, tpl, dest, ctx))
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
});
