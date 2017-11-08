'use strict';

const assert = require('assert');
const extend = require('extend');
const nunjucks = require('nunjucks');
const path = require('path');
const sinon = require('sinon');

/* eslint-disable global-require */
const annotations = {
  icons: require('../../lib/annotations/icons'),
  preview: require('../../lib/annotations/preview'),
  font: require('../../lib/annotations/font'),
  example: require('../../lib/annotations/example'),
  name: require('../../lib/annotations/name'),
};
/* eslint-enable global-require */

describe('icons annotation', function() {
  beforeEach(function() {
    this.env = {
      logger: { warn: sinon.stub() },
      herman: { templatepath: path.resolve(__dirname, 'files') },
    };
    this.icons = annotations.icons(this.env);
  });

  describe('parse', function() {
    it('splits on space and colon', function() {
      assert.deepEqual(this.icons.parse('icons/ foo.j2:name'), {
        iconsPath: 'icons/',
        macroFile: 'foo.j2',
        macroName: 'name',
      });
    });
  });

  describe('resolve', function() {
    it('logs errors on bad icon path', function(done) {
      const data = [
        {
          icons: {
            iconsPath: 'test/js/files/bad_icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
      ];

      this.icons
        .resolve(data)
        .then(() => {
          sinon.assert.calledOnce(this.env.logger.warn);
          done();
        })
        .catch(done);
    });

    it('renders icons', function(done) {
      const data = [
        {
          icons: {
            iconsPath: 'test/js/files/icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
      ];

      this.icons
        .resolve(data)
        .then(() => {
          assert.deepEqual(data[0].icons, [
            {
              name: 'ok',
              path: 'test/js/files/icons/ok.svg',
              rendered: 'rendered ok',
            },
            {
              name: 'warning',
              path: 'test/js/files/icons/warning.svg',
              rendered: 'rendered warning',
            },
          ]);
          assert.ok(data[0].iframed !== undefined);
          done();
        })
        .catch(done);
    });

    it("doesn't recreate a customNjkEnv", function(done) {
      const data = [
        {
          icons: {
            iconsPath: 'test/js/files/icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
        {
          icons: {
            iconsPath: 'test/js/files/icons',
            macroFile: 'macros.j2',
            macroName: 'mymacro',
          },
        },
      ];
      sinon.spy(nunjucks, 'configure');

      this.icons
        .resolve(data)
        .then(() => {
          sinon.assert.calledOnce(nunjucks.configure);

          nunjucks.configure.restore();
          done();
        })
        .catch(done);
    });
  });
});

describe('preview annotation', function() {
  before(function() {
    this.preview = annotations.preview();
  });

  describe('parse', function() {
    it('parses CSS-like options and returns object', function() {
      assert.deepEqual(this.preview.parse(' sizes; foo : bar ; baz ;'), {
        type: 'sizes',
        foo: 'bar',
        baz: null,
      });
    });
  });
});

describe('font annotation', function() {
  beforeEach(function() {
    this.env = {};
    this.font = annotations.font(this.env);
  });

  describe('parse', function() {
    it('parses options and returns object', function() {
      const input =
        '"key" (variant1, variant2) {format1, format2}\n' +
        '  <link rel="stylesheet">';
      assert.deepEqual(this.font.parse(input), {
        key: 'key',
        variants: ['variant1', 'variant2'],
        formats: ['format1', 'format2'],
        html: '<link rel="stylesheet">',
      });
      assert.equal(this.env.fontsHTML, '\n<link rel="stylesheet">');
    });

    it('skips if no linebreak', function() {
      const input = '"key" (variant1, variant2) {format1, format2}';
      assert.deepEqual(this.font.parse(input), {
        key: 'key',
        variants: ['variant1', 'variant2'],
        formats: ['format1', 'format2'],
        html: '',
      });
      assert.equal(this.env.fontsHTML, undefined);
    });

    it('appends obj.html to existing fontsHTML', function() {
      this.env.fontsHTML = '\n<link rel="stylesheet">';
      const input =
        '"key" (variant1, variant2) {format1, format2}\n' +
        '  <link rel="another-stylesheet">';
      assert.deepEqual(this.font.parse(input), {
        key: 'key',
        variants: ['variant1', 'variant2'],
        formats: ['format1', 'format2'],
        html: '<link rel="another-stylesheet">',
      });
      assert.equal(
        this.env.fontsHTML,
        '\n<link rel="stylesheet">\n<link rel="another-stylesheet">'
      );
    });

    it('returns undefined if no keyBits', function() {
      const input = '';
      assert.deepEqual(this.font.parse(input), undefined);
      assert.equal(this.env.fontsHTML, undefined);
    });

    it("doesn't set variants or formats if not appropriate bits", function() {
      const input = '"key"';
      assert.deepEqual(this.font.parse(input), {
        key: 'key',
        variants: [],
        formats: [],
        html: '',
      });
      assert.equal(this.env.fontsHTML, undefined);
    });
  });

  describe('resolve', function() {
    describe('local font', function() {
      beforeEach(function() {
        this.data = [{ font: { key: 'test-font', formats: ['woff'] } }];
        this.origData = Object.assign({}, this.data);
      });

      it('warns and exits if no fontpath', function() {
        const env = { logger: { warn: sinon.stub() }, herman: {} };
        const font = annotations.font(env);

        font.resolve(this.data);

        assert.deepEqual(this.data, this.origData);
        assert(
          env.logger.warn.calledWith(
            'Must pass in a `fontpath` if using @font annotation with local ' +
              'fonts.'
          )
        );
      });

      it('warns and exits if no jsonfile', function() {
        const env = {
          logger: { warn: sinon.stub() },
          herman: { fontpath: '/path' },
        };
        const font = annotations.font(env);

        font.resolve(this.data);

        assert.deepEqual(this.data, this.origData);
        assert(
          env.logger.warn.calledWith(
            'Must pass in a `sassjson` file if using @font annotation with ' +
              'local fonts.'
          )
        );
      });

      it('adds `@font-face` CSS and localFonts src', function(done) {
        const env = {
          logger: { warn: sinon.stub() },
          herman: {
            fontpath: '/path',
            sass: {
              jsonfile: '/json',
            },
          },
          sassjson: {
            fonts: {
              'test-font': {
                regular: 'font/font',
              },
            },
          },
        };
        const font = annotations.font(env);

        font
          .resolve(this.data)
          .then(() => {
            const css =
              '@font-face {\n' +
              "  font-family: 'test-font';\n" +
              "  src: url('assets/fonts/font/font.woff') format('woff');\n" +
              '  font-style: normal;\n' +
              '  font-weight: normal;\n' +
              '}\n';

            assert.equal(this.data[0].font.localFontCSS, css);
            assert.deepEqual(env.localFonts, ['/path/font/font.woff']);
            done();
          })
          .catch(done);
      });
    });

    it('skips items without a font attribute', function(done) {
      const env = {};
      const font = annotations.font(env);
      const data = [{}];

      font
        .resolve(data)
        .then(() => {
          assert.deepEqual(data, [{}]);
          done();
        })
        .catch(done);
    });

    it('skips localFont processing if formats is empty', function(done) {
      const env = {
        sassjson: 'json',
      };
      const font = annotations.font(env);
      const data = [
        {
          font: {
            key: 'foo',
            formats: [],
          },
        },
      ];

      font
        .resolve(data)
        .then(() => {
          assert.equal(env.localFonts, undefined);
          assert.equal(data[0].font.localFontCSS, undefined);
          assert.notEqual(data[0].iframed, undefined);
          done();
        })
        .catch(done);
    });

    it('fails on missing sassjson fontData', function(done) {
      const env = {
        herman: {
          sass: {
            jsonfile: `${__dirname}/files/json.css`,
          },
          fontpath: '/path',
        },
        logger: {
          warn: sinon.spy(),
        },
      };
      const font = annotations.font(env);
      const data = [
        {
          font: {
            formats: ['woff'],
          },
        },
      ];

      font
        .resolve(data)
        .then(() => {
          assert.fail('The promise should be rejected');
          done();
        })
        .catch(() => {
          sinon.assert.calledOnce(env.logger.warn);
          done();
        });
    });

    // TODO make this:
    it("don't push to env.localFonts if invalid format");
  });
});

describe('example annotation', function() {
  beforeEach(function() {
    this.env = {
      herman: {
        templatepath: path.resolve(__dirname, 'files'),
      },
      logger: { warn: sinon.spy() },
    };
    this.example = annotations.example(this.env);
  });

  describe('resolve', function() {
    it('warns and exits if no templatepath and njk @example used', function() {
      const env = { logger: { warn: sinon.spy() }, herman: {} };
      const example = annotations.example(env);
      const data = [{ example: [{ type: 'njk' }] }];

      example.resolve(data);

      assert.deepEqual(data, [{ example: [{ type: 'njk' }] }]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using Nunjucks @example.'
        )
      );
    });

    // TODO make this:
    it("doesn't recreate a customNjkEnv");

    it('handles html items', function(done) {
      const data = [
        {
          example: [
            {
              type: 'html',
              code: '<html></html>',
            },
          ],
        },
      ];
      this.example
        .resolve(data)
        .then(() => {
          assert.equal(data[0].example[0].rendered, data[0].example[0].code);
          done();
        })
        .catch(done);
    });

    it('handles scss items', function(done) {
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: '/* just a placeholder */',
            },
          ],
        },
      ];
      this.example
        .resolve(data)
        .then(() => {
          assert.equal(
            data[0].example[0].rendered,
            `${data[0].example[0].code}\n`
          );
          done();
        })
        .catch(done);
    });

    it('injects global imports for scss items', function(done) {
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: '/* just a placeholder */',
            },
          ],
        },
      ];
      const env = extend(true, {}, this.env, {
        herman: {
          sass: {
            includes: ['~accoutrement-color/sass/utils', 'import'],
            includepaths: [path.join(__dirname, 'files')],
          },
        },
      });
      const example = annotations.example(env);
      example
        .resolve(data)
        .then(() => {
          assert.equal(
            data[0].example[0].rendered,
            `body {\n  border: 1px;\n}\n\n${data[0].example[0].code}\n`
          );
          done();
        })
        .catch(done);
    });

    it('skips non-html, non-njk, non-scss items', function(done) {
      const data = [
        {
          example: [
            {
              type: 'other',
            },
          ],
        },
      ];
      this.example
        .resolve(data)
        .then(() => {
          assert.equal(data[0].example[0].rendered, undefined);
          done();
        })
        .catch(done);
    });

    it('warns only once about missing templatepath', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = annotations.example(env);
      const data = [
        { example: [{ type: 'njk' }] },
        { example: [{ type: 'njk' }] },
      ];

      example.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn if njk @example not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = annotations.example(env);
      const data = [{}];

      example.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders nunjucks example', function(done) {
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.j2' as macros %}\n" +
                '{{ macros.mymacro(1, 2) }}',
            },
          ],
        },
      ];
      this.example
        .resolve(data)
        .then(() => {
          assert.equal(data[0].example[0].rendered, '1 then 2.');
          assert.ok(data[0].example[0].iframed !== undefined);
          done();
        })
        .catch(done);
    });

    it('uses custom nunjucks env, if exists', function() {
      const nunjucksEnv = nunjucks.configure(path.resolve(__dirname, 'files'));
      nunjucksEnv.addFilter('plus_one', function(val) {
        return val + 1;
      });
      const env = { herman: { nunjucksEnv } };
      const example = annotations.example(env);
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.j2' as macros %}\n" +
                '{{ macros.macro_with_custom_filter(5) }}',
            },
          ],
        },
      ];

      example.resolve(data);

      assert.equal(data[0].example[0].rendered, '6');
    });
  });
});

describe('name annotation', function() {
  before(function() {
    this.name = annotations.name(this.env);
  });

  describe('parse', function() {
    it('trims text', function() {
      assert.equal(this.name.parse('foo '), 'foo');
    });
  });

  describe('autofill', function() {
    it('preserves original context name', function() {
      const data = { name: 'foo', context: { name: 'bar' } };

      this.name.autofill(data);

      assert.deepEqual(data, { context: { name: 'foo', origName: 'bar' } });
    });
  });
});
