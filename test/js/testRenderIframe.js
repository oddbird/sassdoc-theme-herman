'use strict';

const assert = require('assert');
const extend = require('extend');
const path = require('path');
const sinon = require('sinon');

const renderIframe = require('../../lib/renderIframe');
const { nunjucksEnv } = require('../../lib/utils/templates');

describe('renderIframe', function() {
  describe('example', function() {
    beforeEach(function() {
      this.env = {
        herman: {
          customCSS: 'test/js/fixtures/css/main.css',
          customHTML: 'templates/_icons.svg',
        },
        logger: { log: sinon.fake() },
        dir: __dirname,
      };
    });

    it('renders', function(done) {
      sinon.stub(nunjucksEnv, 'render').returns('some iframed');
      const item = {
        rendered: true,
      };

      renderIframe(this.env, item, 'example').then(() => {
        assert.equal(item.iframed, 'some iframed');
        assert.ok(this.env.customHTML);
        assert.deepEqual(this.env.customCSS, {
          path: path.resolve(__dirname, 'test/js/fixtures/css/main.css'),
          url: 'assets/custom/main.css',
        });

        nunjucksEnv.render.restore();
        done();
      });
    });

    it("doesn't render if no item.rendered", function(done) {
      const item = {
        rendered: false,
      };

      renderIframe(this.env, item, 'example').then(() => {
        assert.equal(item.iframed, undefined);
        assert.equal(this.env.customHTML, undefined);
        assert.equal(this.env.customCSS, undefined);

        done();
      });
    });

    it('inserts raw HTML if env.herman.customHTML is bad path', function(done) {
      const env = extend({}, this.env);
      env.herman.customHTML = 'foo.bar';
      const item = {
        rendered: true,
      };

      renderIframe(this.env, item, 'example').then(() => {
        assert.equal(this.env.customHTML, this.env.herman.customHTML);

        done();
      });
    });
  });

  describe('icon', function() {
    beforeEach(function() {
      this.env = {};
    });

    it('renders', function(done) {
      sinon.stub(nunjucksEnv, 'render').returns('some iframed');
      const item = {
        icons: [{}],
        iconsPath: path.resolve(__dirname, 'fixtures', 'icons'),
      };

      renderIframe(this.env, item, 'icon').then(() => {
        assert.equal(item.iframed, 'some iframed');
        assert.ok(this.env.iconsSvg);

        nunjucksEnv.render.restore();
        done();
      });
    });

    it("doesn't render if no item.icons", function(done) {
      const item = {
        icons: [],
      };

      renderIframe(this.env, item, 'icon').then(() => {
        assert.equal(item.iframed, undefined);
        assert.equal(this.env.iconsSvg, undefined);

        done();
      });
    });
  });

  describe('font', function() {
    beforeEach(function() {
      this.env = {
        herman: {
          sass: {
            jsonfile: path.resolve(__dirname, 'fixtures', 'css', 'json.css'),
          },
        },
        logger: {
          warn: sinon.fake(),
        },
      };
    });

    it('sets sassjson', function(done) {
      const item = {
        font: {
          key: true,
        },
      };

      renderIframe(this.env, item, 'font').then(() => {
        const expected = {
          colors: {
            'brand-colors': {
              'brand-orange': '#c75000',
            },
          },
        };

        assert.deepEqual(this.env.sassjson, expected);

        done();
      });
    });

    it('logs the error on a bad sassjson', function(done) {
      const env = extend({}, this.env);
      env.herman.sass.jsonfile = 'foo.bar';
      const item = {
        font: {
          key: true,
        },
      };

      renderIframe(this.env, item, 'font').then(() => {
        sinon.assert.calledOnce(env.logger.warn);

        done();
      });
    });
  });

  describe('sizes', function() {
    beforeEach(function() {
      this.env = {
        herman: {
          customCSS: 'test/js/fixtures/css/main.css',
        },
        dir: __dirname,
      };
    });

    it('renders', function(done) {
      const item = {
        sizes: {
          key: true,
        },
      };

      renderIframe(this.env, item, 'sizes')
        .then(() => {
          assert.deepEqual(this.env.customCSS, {
            path: path.resolve(__dirname, 'test/js/fixtures/css/main.css'),
            url: 'assets/custom/main.css',
          });
          done();
        })
        .catch(done);
    });
  });
});
