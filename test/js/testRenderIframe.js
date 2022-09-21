'use strict';

const assert = require('assert');
const path = require('path');

const extend = require('extend');
const sinon = require('sinon');

const renderIframe = require('../../lib/renderIframe');
const { getNunjucksEnv } = require('../../lib/utils/templates');

const nunjucksEnv = getNunjucksEnv({});

describe('renderIframe', () => {
  describe('example', () => {
    beforeEach(function () {
      this.env = {
        herman: {
          customCSS: 'test/js/fixtures/css/main.css',
          customHTML: 'templates/_icons.svg',
        },
        logger: { log: sinon.fake() },
        dir: __dirname,
      };
    });

    it('renders', function (done) {
      sinon.stub(nunjucksEnv, 'render').returns('some iframed');
      const item = {
        rendered: true,
      };

      renderIframe(this.env, item, 'example')
        .then(() => {
          assert.strictEqual(item.iframed, 'some iframed');
          assert.ok(this.env.customHTML);
          assert.deepStrictEqual(this.env.customCSS, {
            path: path.resolve(__dirname, 'test/js/fixtures/css/main.css'),
            url: 'assets/custom/main.css',
          });

          nunjucksEnv.render.restore();
          done();
        })
        .catch(done);
    });

    it("doesn't render if no item.rendered", function (done) {
      const item = {
        rendered: false,
      };

      renderIframe(this.env, item, 'example')
        .then(() => {
          assert.strictEqual(item.iframed, undefined);
          assert.strictEqual(this.env.customHTML, undefined);
          assert.strictEqual(this.env.customCSS, undefined);

          done();
        })
        .catch(done);
    });

    it('inserts HTML if env.herman.customHTML is bad path', function (done) {
      const env = extend({}, this.env);
      env.herman.customHTML = 'foo.bar';
      const item = {
        rendered: true,
      };

      renderIframe(this.env, item, 'example')
        .then(() => {
          assert.strictEqual(this.env.customHTML, this.env.herman.customHTML);

          done();
        })
        .catch(done);
    });
  });

  describe('icon', () => {
    beforeEach(function () {
      this.env = {};
    });

    it('renders', function (done) {
      sinon.stub(nunjucksEnv, 'render').returns('some iframed');
      const item = {
        icons: [{}],
        iconsPath: path.resolve(__dirname, 'fixtures', 'icons'),
      };

      renderIframe(this.env, item, 'icon')
        .then(() => {
          assert.strictEqual(item.iframed, 'some iframed');
          assert.ok(this.env.iconsSvg);

          nunjucksEnv.render.restore();
          done();
        })
        .catch(done);
    });

    it("doesn't render if no item.icons", function (done) {
      const item = {
        icons: [],
      };

      renderIframe(this.env, item, 'icon')
        .then(() => {
          assert.strictEqual(item.iframed, undefined);
          assert.strictEqual(this.env.iconsSvg, undefined);

          done();
        })
        .catch(done);
    });
  });

  describe('font', () => {
    beforeEach(function () {
      this.env = {
        herman: {
          sass: {
            jsonFile: path.resolve(__dirname, 'fixtures', 'css', 'json.css'),
          },
        },
        logger: {
          warn: sinon.fake(),
        },
      };
    });

    it('sets sassjson', function (done) {
      const item = {
        font: {
          key: true,
        },
      };

      renderIframe(this.env, item, 'font')
        .then(() => {
          assert.ok(this.env.sassjson.colors !== undefined);

          done();
        })
        .catch(done);
    });

    it('logs the error on a bad sassjson', function (done) {
      const env = extend({}, this.env);
      env.herman.sass.jsonFile = 'foo.bar';
      const item = {
        font: {
          key: true,
        },
      };

      renderIframe(this.env, item, 'font')
        .then(() => {
          sinon.assert.calledOnce(env.logger.warn);

          done();
        })
        .catch(done);
    });
  });

  describe('colors', () => {
    beforeEach(function () {
      this.env = {};
    });

    it('renders', function (done) {
      sinon.stub(nunjucksEnv, 'render').returns('some iframed');
      const item = {
        colors: [{}],
      };

      renderIframe(this.env, item, 'colors')
        .then(() => {
          assert.strictEqual(item.iframed, 'some iframed');

          nunjucksEnv.render.restore();
          done();
        })
        .catch(done);
    });
  });
});
