'use strict';

const assert = require('assert');
const extend = require('extend');
const nunjucks = require('nunjucks');
const path = require('path');
const sinon = require('sinon');

/* eslint-disable global-require */
const annotations = {
  icons: require('../../lib/annotations/icons'),
  colors: require('../../lib/annotations/colors'),
  sizes: require('../../lib/annotations/sizes'),
  ratios: require('../../lib/annotations/ratios'),
  font: require('../../lib/annotations/font'),
  example: require('../../lib/annotations/example'),
  name: require('../../lib/annotations/name'),
};
/* eslint-enable global-require */

describe('icons annotation', function() {
  beforeEach(function() {
    this.env = {
      logger: { warn: sinon.stub() },
    };
    this.icons = annotations.icons(this.env);
  });

  describe('parse', function() {
    it('returns argument', function() {
      assert.equal(this.icons.parse('icons/'), 'icons/');
    });
  });

  describe('resolve', function() {
    it('logs errors on bad icon path', function(done) {
      const data = [{ icons: 'test/js/fixtures/bad_icons/' }];

      this.icons
        .resolve(data)
        .then(() => {
          sinon.assert.calledOnce(this.env.logger.warn);
          done();
        })
        .catch(done);
    });

    it('bails early if no icons on items', function(done) {
      const data = [{}];
      this.icons
        .resolve(data)
        .then(() => {
          assert.deepEqual(data, [{}]);
          done();
        })
        .catch(done);
    });

    it('renders icons', function(done) {
      const data = [{ icons: 'test/js/fixtures/icons' }];

      this.icons
        .resolve(data)
        .then(() => {
          assert.deepEqual(data[0].icons, [
            {
              name: 'ok',
              path: 'test/js/fixtures/icons/',
              rendered:
                '<svg data-icon="ok"  ><use xlink:href="#icon-ok" />\n  </svg>',
            },
            {
              name: 'warning',
              path: 'test/js/fixtures/icons/',
              rendered:
                '<svg data-icon="warning"  >' +
                '<use xlink:href="#icon-warning" />\n  </svg>',
            },
          ]);
          assert.ok(data[0].iframed !== undefined);
          done();
        })
        .catch(done);
    });
  });
});

describe('colors annotation', function() {
  before(function() {
    this.colors = annotations.colors();
  });

  describe('parse', function() {
    it('parses CSS-like options and returns object', function() {
      assert.deepEqual(this.colors.parse(' sizes; foo : bar ; baz ;'), {
        type: 'sizes',
        foo: 'bar',
        baz: null,
      });
    });
  });
});

describe('sizes annotation', function() {
  before(function() {
    this.sizes = annotations.sizes();
  });

  describe('parse', function() {
    it('parses CSS-like options and returns object', function() {
      assert.deepEqual(this.sizes.parse(' sizes; foo : bar ; baz ;'), {
        type: 'sizes',
        foo: 'bar',
        baz: null,
      });
    });
  });
});

describe('ratios annotation', function() {
  before(function() {
    this.ratios = annotations.ratios();
  });

  describe('parse', function() {
    it('parses CSS-like options and returns object', function() {
      assert.deepEqual(this.ratios.parse(' sizes; foo : bar ; baz ;'), {
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
    it('keeps env.fontsHTML if set', function() {
      const env = {
        fontsHTML: ['<link rel="another-stylesheet">'],
      };
      const font = annotations.font(env);
      const input =
        '"key" (variant1, variant2) {format1, format2}\n' +
        '  <link rel="another-stylesheet">';
      font.parse(input);
      assert.deepEqual(env.fontsHTML, ['<link rel="another-stylesheet">']);
    });

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

    it('logs an error if missing Sass jsonfile', function(done) {
      const env = {
        logger: { warn: sinon.stub() },
        herman: {
          fontpath: '/path',
          sass: {
            jsonfile: `${__dirname}/no/such/file.json`,
          },
        },
      };
      annotations
        .font(env)
        .resolve(this.data)
        .then(() => {
          const errMsg = `ENOENT: no such file or directory, open '${
            env.herman.sass.jsonfile
          }'`;
          assert(
            env.logger.warn.calledWith(
              `File not found: ${env.herman.sass.jsonfile}\n${errMsg}`
            )
          );
          done();
        })
        .catch(done);
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
            jsonfile: `${__dirname}/fixtures/css/json.css`,
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

    it('skips localFonts processing if not a valid format', function(done) {
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
      const data = [{ font: { key: 'test-font', formats: ['fail'] } }];

      font
        .resolve(data)
        .then(() => {
          const css =
            '@font-face {\n' +
            "  font-family: 'test-font';\n" +
            '  src:\n' +
            '  font-style: normal;\n' +
            '  font-weight: normal;\n' +
            '}\n';

          assert.equal(data[0].font.localFontCSS, css);
          assert.deepEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });
  });
});

describe('example annotation', function() {
  beforeEach(function() {
    this.env = {
      herman: {
        nunjucks: {
          templatepath: path.resolve(__dirname, 'fixtures', 'templates'),
        },
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
          'Must pass in a nunjucks.templatepath if using Nunjucks @example.'
        )
      );
    });

    it("doesn't recreate a customNjkEnv", function(done) {
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.j2' as macros %}\n" +
                '{{ macros.mymacro(1, 2) }}',
            },
            {
              type: 'njk',
              code:
                "{% import 'macros.j2' as macros %}\n" +
                '{{ macros.mymacro(1, 2) }}',
            },
          ],
        },
      ];
      sinon.spy(nunjucks, 'configure');

      this.example
        .resolve(data)
        .then(() => {
          sinon.assert.calledOnce(nunjucks.configure);

          nunjucks.configure.restore();
          done();
        })
        .catch(done);
    });

    it('handles html items', function(done) {
      const data = [
        {
          example: [
            {
              type: 'html',
              code: '<div></div>',
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

    it('reports errors in sass compilation', function(done) {
      const env = extend(true, {}, this.env, {
        herman: {
          sass: {},
        },
      });
      const example = annotations.example(env);
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: 'this is just some bad sass',
            },
          ],
        },
      ];
      example
        .resolve(data)
        .then(() => {
          const errMsg =
            'Invalid CSS after "...t some bad sass": expected "{", was ""';
          const sassData = data[0].example[0].code;
          sinon.assert.calledOnce(this.env.logger.warn);
          sinon.assert.calledWith(
            this.env.logger.warn,
            `Error compiling @example scss: \n${errMsg}\n${sassData}`
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
            includepaths: [path.join(__dirname, 'fixtures', 'scss')],
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
      const nunjucksEnv = nunjucks.configure(
        path.resolve(__dirname, 'fixtures', 'templates')
      );
      nunjucksEnv.addFilter('plus_one', function(val) {
        return val + 1;
      });
      const env = { herman: { nunjucks: { environment: nunjucksEnv } } };
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

    it('does nothing if no item.name', function() {
      const data = { context: { name: 'bar' } };

      this.name.autofill(data);

      assert.deepEqual(data, { context: { name: 'bar' } });
    });
  });
});
