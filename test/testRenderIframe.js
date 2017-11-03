'use strict';

const assert = require('assert');
const sinon = require('sinon');
const extend = require('extend');

const renderIframe = require('../lib/renderIframe');
const { nunjucksEnv } = require('../constants');

describe('renderIframe', function() {
  describe('example', function() {
    beforeEach(function() {
      this.env = {
        herman: {
          customCSS: 'dist/css/main.css',
          minifiedIcons: 'templates/_icons.svg',
          sass: {
            jsonfile: 'dist/css/json.css',
          },
        },
        dir: __dirname,
        logger: {
          warn: sinon.spy(),
        },
      };
    });

    it('renders', function(done) {
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
      renderIframe(this.env, item, 'example').then(
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

    it("doesn't render if the item is marked don't-render", function(done) {
      const item = {
        rendered: false,
      };
      // Returns nothing, mutates input:
      renderIframe(this.env, item, 'example').then(
        () => {
          // Should do nothing?
          done();
        },
        err => {
          assert.fail(err);
          done();
        }
      );
    });

    it('errors out if env.herman.minifiedIcons is bad', function(done) {
      const env = extend({}, this.env);
      env.herman.minifiedIcons = 'foo.bar';
      const item = {
        rendered: true,
      };
      // Returns nothing, mutates input:
      renderIframe(env, item, 'example')
        .then(
          () => {
            assert(
              env.logger.warn.calledWith(
                "File not found: foo.bar\nENOENT: no such file or directory, open 'foo.bar'"
              )
            );
            done();
          },
          err => {
            assert.fail(err);
            done();
          }
        )
        .catch(err => done(err));
    });
  });

  describe('icon', function() {
    it('renders');
  });

  describe('font', function() {
    beforeEach(function() {
      this.env = {
        herman: {
          customCSS: 'dist/css/main.css',
          minifiedIcons: 'templates/_icons.svg',
          sass: {
            jsonfile: 'dist/css/json.css',
          },
        },
        dir: __dirname,
        logger: {
          warn: sinon.spy(),
        },
      };
    });

    it('renders');

    it('sets sassjson', function(done) {
      const item = {
        font: {
          key: true,
        },
      };
      // Returns nothing, mutates input:
      renderIframe(this.env, item, 'font')
        .then(
          () => {
            const expected = {
              colors: {
                'brand-colors': {
                  'brand-orange': '#c75000',
                  'brand-blue': '#0d7fa5',
                  'brand-pink': '#e2127a',
                },
                'neutral-colors': {
                  'light-gray': '#dedede',
                  gray: '#555b5e',
                  black: '#3b4042',
                },
                'status-colors': {
                  go: '#657e1b',
                  yield: '#c75000',
                  stop: '#ec1313',
                },
                'theme-colors': {
                  'theme-dark': '#0d7fa5',
                  'theme-light': '#cfe5ed',
                  background: '#fff',
                  text: '#3b4042',
                  'text-light': '#555b5e',
                  border: '#555b5e',
                  'light-border': '#dedede',
                  callout: '#dedede',
                  overlay: 'rgba(222, 222, 222, 0.9)',
                  shadow: 'rgba(85, 91, 94, 0.5)',
                  action: '#0d7fa5',
                  focus: '#0a5f7c',
                  active: '#0d7fa5',
                  accent: '#e2127a',
                  slight: '#fcfcfc',
                  code: '#587f8d',
                  'code-shadow': 'rgba(88, 127, 141, 0.2)',
                },
                'system-colors': {
                  'contrast-light': '#fff',
                  'contrast-dark': '#3b4042',
                },
              },
              ratios: {
                'text-ratios': {
                  herman: '1.4',
                },
              },
              sizes: {
                'text-sizes': {
                  root: '18px',
                  'large-rem': '1.11111rem',
                  'base-rem': '1rem',
                  'small-rem': '0.88889rem',
                  'xsmall-rem': '0.75rem',
                  large: 'calc(1rem + 1.5vw)',
                  medium: 'calc(1rem + .5vw)',
                  base: 'calc(.88889rem + .5vw)',
                  small: 'calc(.88889rem + .25vw)',
                  xsmall: 'calc(.75rem + .25vw)',
                  code: 'calc(.75rem + .25vw)',
                  'small-code': 'calc(.675rem + .25vw)',
                  h1: 'calc(1rem + 2.5vw)',
                  h2: 'calc(1rem + 2vw)',
                  h3: 'calc(1rem + 1.5vw)',
                  quote: 'calc(1rem + .5vw)',
                },
                'spacing-sizes': {
                  rhythm: '1.4rem',
                  gutter: '1.4rem',
                  'flex-gutter': 'calc(.7rem + 2.5vw)',
                  'double-gutter': '2.8rem',
                  spacer: '4.2rem',
                  'double-spacer': '8.4rem',
                  shim: '0.7rem',
                  'half-shim': '0.35rem',
                  'quarter-shim': '0.175rem',
                },
                'pattern-sizes': {
                  border: '8px',
                  page: '50rem',
                  'nav-small': '21rem',
                  'nav-medium': '32rem',
                  'project-link-nav': '36rem',
                  specimen: '4.2rem',
                  'color-preview': 'calc(15em + 0.25vw)',
                  'color-swatch': '5.6rem',
                  icon: '28px',
                  'nav-underline': '4px',
                },
              },
              fonts: {
                sans: {
                  name: 'Source Sans Pro',
                  source: 'https://fonts.google.com/specimen/Source+Sans+Pro',
                  stack: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
                },
                code: {
                  name: 'Source Code Pro',
                  source: 'https://fonts.google.com/specimen/Source+Code+Pro',
                  stack: [
                    'Consolas',
                    'Menlo',
                    'Monaco',
                    'Lucida Console',
                    'Liberation Mono',
                    'DejaVu Sans Mono',
                    'Bitstream Vera Sans Mono',
                    'Courier New',
                    'monospace',
                    'sans-serif',
                  ],
                },
              },
            };
            assert.deepEqual(this.env.sassjson, expected);
            done();
          },
          err => {
            assert.fail(err);
            done();
          }
        )
        .catch(err => done(err));
    });

    it('logs the error on a bad sassjson', function(done) {
      const env = extend({}, this.env);
      env.herman.sass.jsonfile = 'foo.bar';
      const item = {
        font: {
          key: true,
        },
      };
      // Returns nothing, mutates input:
      renderIframe(env, item, 'font')
        .then(
          () => {
            assert(
              env.logger.warn.calledWith(
                "File not found: foo.bar\nENOENT: no such file or directory, open 'foo.bar'"
              )
            );
            done();
          },
          err => {
            assert.fail(err);
            done();
          }
        )
        .catch(err => done(err));
    });
  });
});
