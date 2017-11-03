'use strict';

const assert = require('assert');
const sinon = require('sinon');

const renderIframe = require('../lib/renderIframe.js');
const { nunjucksEnv } = require('../constants.js');

describe('renderIframe', function() {
  describe('example', function() {
    it('should render', function(done) {
      const render = sinon.stub(nunjucksEnv, 'render');
      render.returns('some iframed');
      const env = {
        herman: {
          customCSS: 'dist/css/main.css',
          minifiedIcons: 'templates/_icons.svg',
          sass: {
            jsonfile: 'dist/css/json.css',
          },
        },
        dir: __dirname,
      };
      const item = {
        rendered: true,
      };
      // Returns nothing, mutates input:
      renderIframe(env, item, 'example').then(
        () => {
          // add iconsSvg to env
          // add customCSS to env
          // add sassjson to env
          // call nunjucks
          // assert(render.calledWith(example_iFrameTpl, ctx));
          // check that value is on item
          assert.equal(item.iframed, 'some iframed');
          done();
        },
        err => {
          assert.fail(err);
          done();
        }
      );
    });
  });

  describe('icon', function() {
    it('should render');
  });

  describe('font', function() {
    it('should render');
  });
});
