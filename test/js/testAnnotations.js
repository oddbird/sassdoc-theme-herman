'use strict';

const assert = require('assert');
const path = require('path');

const Promise = require('bluebird');
const extend = require('extend');
const nunjucks = require('nunjucks');
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

describe('icons annotation', () => {
  beforeEach(function () {
    this.env = {
      logger: { warn: sinon.fake() },
    };
    this.icons = annotations.icons(this.env);
  });

  describe('parse', () => {
    it('returns argument', function () {
      assert.strictEqual(this.icons.parse('icons/'), 'icons/');
    });
  });

  describe('resolve', () => {
    it('logs errors on bad icon path', function (done) {
      const data = [{ icons: 'test/js/fixtures/bad_icons/' }];

      this.icons
        .resolve(data)
        .then(() => {
          sinon.assert.calledOnce(this.env.logger.warn);
          done();
        })
        .catch(done);
    });

    it('bails early if no icons on items', function (done) {
      const data = [{}];
      this.icons
        .resolve(data)
        .then(() => {
          assert.deepStrictEqual(data, [{}]);
          done();
        })
        .catch(done);
    });

    it('renders icons', function (done) {
      const iconPath = path.normalize('test/js/fixtures/icons');
      const data = [{ icons: iconPath }];

      this.icons
        .resolve(data)
        .then(() => {
          assert.deepStrictEqual(data[0].icons, [
            {
              name: 'ok',
              path: `${iconPath}${path.sep}`,
              rendered:
                '<svg data-icon="ok"  ><use xlink:href="#icon-ok" />\n  </svg>',
            },
            {
              name: 'warning',
              path: `${iconPath}${path.sep}`,
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

describe('colors annotation', () => {
  before(function () {
    this.colors = annotations.colors();
  });

  describe('parse', () => {
    it('parses string and returns object', function () {
      assert.deepStrictEqual(this.colors.parse('foo-bar'), {
        key: 'foo-bar',
      });
    });
  });
});

describe('sizes annotation', () => {
  before(function () {
    this.env = {
      herman: {
        sass: {
          jsonFile: `${__dirname}/fixtures/css/json.css`,
        },
      },
      logger: {
        warn: sinon.fake(),
      },
    };
    this.sizes = annotations.sizes(this.env);
  });

  describe('parse', () => {
    it('parses options and returns object', function () {
      const input = 'key-thing {style}';
      assert.deepStrictEqual(this.sizes.parse(input), {
        key: 'key-thing',
        style: 'style',
      });
    });

    it('uses defaults if no arguments', function () {
      const input = '';
      assert.deepStrictEqual(this.sizes.parse(input), {
        key: '',
        style: '',
      });
    });
  });

  describe('resolve', () => {
    it('bails early if no sizes on items', function (done) {
      const data = [{}];
      this.sizes
        .resolve(data)
        .then(() => {
          assert.deepStrictEqual(data, [{}]);
          done();
        })
        .catch(done);
    });

    it('fails on missing sassjson sizesData', function (done) {
      const data = [
        {
          sizes: {
            key: '',
            style: '',
          },
          context: {
            name: 'foo',
          },
        },
      ];

      this.sizes
        .resolve(data)
        .then(() => {
          assert.fail('The promise should be rejected');
          done();
        })
        .catch(() => {
          sinon.assert.calledOnce(this.env.logger.warn);
          done();
        });
    });

    it('renders sizes', function (done) {
      const data = [
        {
          sizes: {
            key: 'root-sizes',
            style: '',
          },
        },
      ];

      this.sizes
        .resolve(data)
        .then(() => {
          assert.ok(data[0].iframed !== undefined);
          done();
        })
        .catch(done);
    });
  });
});

describe('ratios annotation', () => {
  before(function () {
    this.env = {
      herman: {
        sass: {
          jsonFile: `${__dirname}/fixtures/css/json.css`,
        },
      },
      logger: {
        warn: sinon.fake(),
      },
    };
    this.ratios = annotations.ratios(this.env);
  });

  describe('parse', () => {
    it('parses string and returns object', function () {
      assert.deepStrictEqual(this.ratios.parse('foo-bar'), {
        key: 'foo-bar',
      });
    });
  });

  describe('resolve', () => {
    it('bails early if no ratios on items', function (done) {
      const data = [{}];
      this.ratios
        .resolve(data)
        .then(() => {
          assert.deepStrictEqual(data, [{}]);
          done();
        })
        .catch(done);
    });

    it('fails on missing sassjson ratiosData', function (done) {
      const data = [
        {
          ratios: { key: '' },
          context: { name: 'foo' },
        },
      ];

      this.ratios
        .resolve(data)
        .then(() => {
          assert.fail('The promise should be rejected');
          done();
        })
        .catch(() => {
          sinon.assert.calledOnce(this.env.logger.warn);
          done();
        });
    });

    it('renders ratios', function (done) {
      const data = [{ ratios: { key: 'root-ratios' } }];

      this.ratios
        .resolve(data)
        .then(() => {
          assert.ok(data[0].iframed !== undefined);
          done();
        })
        .catch(done);
    });
  });
});

describe('font annotation', () => {
  beforeEach(function () {
    this.env = {};
    this.font = annotations.font(this.env);
  });

  describe('parse', () => {
    it('keeps env.fontsHTML if set', () => {
      const env = {
        fontsHTML: ['<link rel="another-stylesheet">'],
      };
      const font = annotations.font(env);
      const input =
        'key (variant1, variant2)\n  <link rel="another-stylesheet">';
      font.parse(input);
      assert.deepStrictEqual(env.fontsHTML, [
        '<link rel="another-stylesheet">',
      ]);
    });

    it('parses options and returns object', function () {
      const input = 'key-thing (variant1, variant2)\n  <link rel="stylesheet">';
      assert.deepStrictEqual(this.font.parse(input), {
        key: 'key-thing',
        variants: ['variant1', 'variant2'],
        html: '<link rel="stylesheet">',
      });
      assert.strictEqual(this.env.fontsHTML, '\n<link rel="stylesheet">');
    });

    it('skips HTML if no linebreak', function () {
      const input = '"key-thing" (variant1, variant2)';
      assert.deepStrictEqual(this.font.parse(input), {
        key: 'key-thing',
        variants: ['variant1', 'variant2'],
        html: '',
      });
      assert.strictEqual(this.env.fontsHTML, undefined);
    });

    it('appends obj.html to existing fontsHTML', function () {
      this.env.fontsHTML = '\n<link rel="stylesheet">';
      const input =
        '\'key\' (variant1, variant2)\n  <link rel="another-stylesheet">';
      assert.deepStrictEqual(this.font.parse(input), {
        key: 'key',
        variants: ['variant1', 'variant2'],
        html: '<link rel="another-stylesheet">',
      });
      assert.strictEqual(
        this.env.fontsHTML,
        '\n<link rel="stylesheet">\n<link rel="another-stylesheet">',
      );
    });

    it("doesn't set variants if not appropriate bits", function () {
      const input = '';
      assert.deepStrictEqual(this.font.parse(input), {
        key: '',
        variants: [],
        html: '',
      });
      assert.strictEqual(this.env.fontsHTML, undefined);
    });
  });

  describe('resolve', () => {
    beforeEach(function () {
      this.data = [{ font: { key: 'test-font' } }];
      this.origData = Object.assign([], this.data);
    });

    it('warns and exits if no jsonFile defined', function (done) {
      const env = {
        logger: { warn: sinon.fake() },
        herman: {},
      };

      annotations
        .font(env)
        .resolve(this.data)
        .then(() => {
          assert.fail('The promise should be rejected');
          done();
        })
        .catch(() => {
          assert.deepStrictEqual(this.data, this.origData);
          assert(
            env.logger.warn.calledWith(
              'Must pass in a `sassjson` file if using @font annotation.',
            ),
          );
          done();
        });
    });

    it('logs an error if missing Sass jsonFile', function (done) {
      const env = {
        logger: { warn: sinon.fake() },
        herman: {
          sass: {
            jsonFile: `${__dirname}/no/such/file.json`,
          },
        },
      };
      annotations
        .font(env)
        .resolve(this.data)
        .then(() => {
          const errMsg =
            'ENOENT: no such file or directory, open ' +
            `'${env.herman.sass.jsonFile}'`;
          assert(
            env.logger.warn.calledWith(
              `Error reading file: ${env.herman.sass.jsonFile}\n${errMsg}`,
            ),
          );
          done();
        })
        .catch(done);
    });

    it('warns and exits if no fontPath', function (done) {
      const env = {
        logger: { warn: sinon.fake() },
        herman: {},
        sassjson: {
          fonts: {
            'test-font': {
              normal: 'font/font',
              formats: 'woff',
            },
          },
        },
      };
      const font = annotations.font(env);

      font
        .resolve(this.data)
        .then(() => {
          assert.fail('The promise should be rejected');
          done();
        })
        .catch(() => {
          assert.deepStrictEqual(this.data, this.origData);
          sinon.assert.calledWith(
            env.logger.warn,
            'Must pass in a `fontPath` if using @font annotation with local ' +
              'fonts.',
          );
          done();
        });
    });

    it('adds `@font-face` CSS and localFonts src', function (done) {
      const env = {
        dir: __dirname,
        logger: { warn: sinon.fake() },
        herman: {
          fontPath: path.normalize('/path'),
          sass: {
            jsonFile: '/json',
          },
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: path.normalize('font/font'),
              formats: ['eot', 'ttf'],
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
            "  src: url('assets/fonts/font/font.eot');\n" +
            "  src: url('assets/fonts/font/font.eot?#iefix') " +
            "format('embedded-opentype'), " +
            "url('assets/fonts/font/font.ttf') format('truetype');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, [
            path.resolve('/path/font/font.eot'),
            path.resolve('/path/font/font.ttf'),
          ]);
          done();
        })
        .catch(done);
    });

    it('adds `@font-face` CSS for embedded `data:` fonts', function (done) {
      const env = {
        herman: {},
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                woff: 'data:embedded',
              },
              bold: 'data:another-embedded',
              formats: 'woff',
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
            "  src: url('data:embedded') format('woff');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n' +
            '\n' +
            '@font-face {\n' +
            "  font-family: 'test-font';\n" +
            "  src: url('data:another-embedded') format('woff');\n" +
            '  font-weight: bold;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });

    it('adds `@font-face` CSS for `local` names', function (done) {
      const env = {
        dir: __dirname,
        herman: {
          fontPath: path.normalize('/path'),
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                woff: 'data:embedded',
                fail: 'bad',
                ttf: path.normalize('font/font'),
                local: ['this', 'that'],
              },
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
            "  src: local('this'), local('that'), " +
            "url('data:embedded') format('woff'), " +
            "url('assets/fonts/font/font.ttf') format('truetype');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, [
            path.resolve('/path/font/font.ttf'),
          ]);
          done();
        })
        .catch(done);
    });

    it('adds `@font-face` CSS for `local` without `formats`', function (done) {
      const env = {
        dir: __dirname,
        herman: {
          fontPath: path.normalize('/path'),
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                local: ['this', 'that'],
              },
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
            "  src: local('this'), local('that');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });

    it('adds separate `@font-face` for `eot` and `local`', function (done) {
      const env = {
        dir: __dirname,
        herman: {
          fontPath: path.normalize('/path'),
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                path: path.normalize('font/font'),
                local: 'this',
              },
              formats: 'eot',
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
            "  src: url('assets/fonts/font/font.eot');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n' +
            '\n' +
            '@font-face {\n' +
            "  font-family: 'test-font';\n" +
            "  src: local('this');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, [
            path.resolve('/path/font/font.eot'),
          ]);
          done();
        })
        .catch(done);
    });

    it('adds separate `@font-face` for `eot` and `data:`', function (done) {
      const env = {
        herman: {
          fontPath: '/path',
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                woff: 'data:embedded-woff',
                eot: 'data:embedded-eot',
              },
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
            "  src: url('data:embedded-eot');\n" +
            "  src: url('data:embedded-eot') format('embedded-opentype'), " +
            "url('data:embedded-woff') format('woff');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });

    it('adds `@font-face` for embedded eot', function (done) {
      const env = {
        herman: {
          fontPath: '/path',
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                eot: 'data:embedded',
              },
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
            "  src: url('data:embedded');\n" +
            "  src: url('data:embedded') format('embedded-opentype');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });

    it('adds svgid', function (done) {
      const env = {
        dir: __dirname,
        herman: {
          fontPath: path.normalize('/path'),
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                svg: path.normalize('my/font'),
                svgid: 'my-font',
              },
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
            "  src: url('assets/fonts/my/font.svg#my-font') format('svg');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, [
            path.resolve('/path/my/font.svg'),
          ]);
          done();
        })
        .catch(done);
    });

    it('allows setting `local` as a string', function (done) {
      const env = {
        herman: {},
        sassjson: {
          fonts: {
            'test-font': {
              normal: {
                woff: 'data:embedded',
                local: 'this-and-that',
              },
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
            "  src: local('this-and-that'), " +
            "url('data:embedded') format('woff');\n" +
            '  font-weight: normal;\n' +
            '  font-style: normal;\n' +
            '}\n';

          assert.strictEqual(this.data[0].font.localFontCSS, css);
          assert.deepStrictEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });

    it('stores parsed data for webfonts', (done) => {
      const env = {
        herman: {},
        sassjson: {
          fonts: {
            'test-font': {},
          },
        },
      };
      const font = annotations.font(env);
      const data = [{ font: { key: 'test-font', variants: ['normal'] } }];

      font
        .resolve(data)
        .then(() => {
          const expected = [
            {
              isLocal: false,
              hasEmbedded: false,
              variant: 'normal',
              family: 'test-font',
              formats: {},
              svgid: 'test-font',
              style: 'normal',
              weight: 'normal',
              local: undefined,
            },
          ];

          assert.deepStrictEqual(data[0].font.parsedVariants, expected);
          done();
        })
        .catch(done);
    });

    it('skips items without a font attribute', (done) => {
      const env = {};
      const font = annotations.font(env);
      const data = [{}];

      font
        .resolve(data)
        .then(() => {
          assert.deepStrictEqual(data, [{}]);
          done();
        })
        .catch(done);
    });

    it('skips localFont processing if formats is empty', (done) => {
      const env = {
        herman: {
          fontPath: '/path',
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: 'font/font',
            },
          },
        },
      };
      const font = annotations.font(env);
      const data = [
        {
          font: {
            key: 'test-font',
          },
        },
      ];

      font
        .resolve(data)
        .then(() => {
          assert.deepStrictEqual(env.localFonts, []);
          assert.strictEqual(data[0].font.localFontCSS, undefined);
          assert.notStrictEqual(data[0].iframed, undefined);
          done();
        })
        .catch(done);
    });

    it('fails on missing sassjson fontData', (done) => {
      const env = {
        herman: {
          sass: {
            jsonFile: `${__dirname}/fixtures/css/json.css`,
          },
          fontPath: '/path',
        },
        logger: {
          warn: sinon.fake(),
        },
      };
      const font = annotations.font(env);
      const data = [
        {
          font: {
            formats: 'woff',
          },
          context: {},
          name: 'foo',
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

    it('skips localFonts processing if not a valid format', (done) => {
      const env = {
        herman: {
          fontPath: '/path',
        },
        sassjson: {
          fonts: {
            'test-font': {
              normal: 'font/font',
              formats: 'fail',
            },
          },
        },
      };
      const font = annotations.font(env);
      const data = [
        {
          font: {
            key: 'test-font',
          },
        },
      ];

      font
        .resolve(data)
        .then(() => {
          assert.strictEqual(data[0].font.localFontCSS, undefined);
          assert.deepStrictEqual(env.localFonts, []);
          done();
        })
        .catch(done);
    });
  });
});

describe('example annotation', () => {
  beforeEach(function () {
    this.env = {
      herman: {
        nunjucks: {
          templatePath: path.resolve(__dirname, 'fixtures', 'templates'),
        },
      },
      logger: { warn: sinon.fake() },
    };
    this.example = annotations.example(this.env);
  });

  describe('resolve', () => {
    it('warns and exits if no templatePath and njk @example used', () => {
      const env = { logger: { warn: sinon.fake() }, herman: {} };
      const example = annotations.example(env);
      const data = [{ example: [{ type: 'njk' }] }];

      example.resolve(data);

      assert.deepStrictEqual(data, [{ example: [{ type: 'njk' }] }]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a nunjucks.templatePath if using Nunjucks @example.',
        ),
      );
    });

    it("doesn't recreate a customNjkEnv", function (done) {
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.njk' as macros %}\n" +
                '{{ macros.mymacro(1, 2) }}',
            },
            {
              type: 'njk',
              code:
                "{% import 'macros.njk' as macros %}\n" +
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

    it('handles html items', function (done) {
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
          assert.strictEqual(
            data[0].example[0].rendered,
            data[0].example[0].code,
          );
          done();
        })
        .catch(done);
    });

    it('handles scss items', function (done) {
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
          assert.strictEqual(
            data[0].example[0].rendered,
            data[0].example[0].code,
          );
          done();
        })
        .catch(done);
    });

    it('reports errors in sass compilation', function (done) {
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
          const sassData = data[0].example[0].code;
          sinon.assert.calledOnce(this.env.logger.warn);
          const warning = this.env.logger.warn.args[0][0];
          assert.ok(warning.includes('Error compiling @example scss'));
          assert.ok(warning.includes(sassData));
          done();
        })
        .catch(done);
    });

    it('injects global imports for scss items [import]', function (done) {
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: 'body { @include color; }',
            },
          ],
        },
      ];
      const env = extend(true, {}, this.env, {
        herman: {
          sass: {
            includes: ['~accoutrement/sass/color', 'import', 'tools'],
            includePaths: [path.join(__dirname, 'fixtures', 'scss')],
          },
        },
      });
      const example = annotations.example(env);
      example
        .resolve(data)
        .then(() => {
          assert.strictEqual(
            data[0].example[0].rendered,
            `body {\n  border: 1px;\n}\n\nbody {\n  color: red;\n}`,
          );
          done();
        })
        .catch(done);
    });

    it('injects global imports for scss items [use]', function (done) {
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: 'body { @include my-tools.color; }',
            },
          ],
        },
      ];
      const env = extend(true, {}, this.env, {
        herman: {
          sass: {
            use: [
              '~accoutrement/sass/color',
              'import',
              { file: 'tools', namespace: 'my-tools' },
              {},
            ],
            includePaths: [path.join(__dirname, 'fixtures', 'scss')],
            // eslint-disable-next-line global-require
            implementation: require('sass'),
          },
        },
      });
      const example = annotations.example(env);
      example
        .resolve(data)
        .then(() => {
          assert.strictEqual(
            data[0].example[0].rendered,
            `body {\n  border: 1px;\n}\n\nbody {\n  color: red;\n}`,
          );
          done();
        })
        .catch(done);
    });

    it('uses custom `importer` setting', function (done) {
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: '@import "foo"',
            },
          ],
        },
      ];
      const env = extend(true, {}, this.env, {
        herman: {
          sass: {
            importer: (url, prev, cb) => cb({ file: 'import' }),
            includePaths: [path.join(__dirname, 'fixtures', 'scss')],
          },
        },
      });
      const example = annotations.example(env);
      example
        .resolve(data)
        .then(() => {
          assert.strictEqual(
            data[0].example[0].rendered,
            `body {\n  border: 1px;\n}`,
          );
          done();
        })
        .catch(done);
    });

    it('uses custom `outputStyle` setting', function (done) {
      const data = [
        {
          example: [
            {
              type: 'scss',
              code: '/* a relevant comment */',
            },
          ],
        },
      ];
      const env = extend(true, {}, this.env, {
        herman: {
          sass: {
            outputStyle: 'compressed',
          },
        },
      });
      const example = annotations.example(env);
      example
        .resolve(data)
        .then(() => {
          assert.strictEqual(data[0].example[0].rendered, '');
          done();
        })
        .catch(done);
    });

    it('warns, exits if no sass and scss @example used', function (done) {
      const data = [{ example: [{ type: 'scss' }] }];
      sinon.stub(Promise, 'promisify').throws();

      this.example
        .resolve(data)
        .then(() => {
          sinon.assert.calledTwice(this.env.logger.warn);
          assert.deepStrictEqual(data, [
            { example: [{ type: 'scss', rendered: undefined }] },
          ]);
        })
        .finally(() => {
          Promise.promisify.restore();
          done();
        });
    });

    it('only requires sass once', function (done) {
      const data = [{ example: [{ type: 'scss', code: '' }] }];
      const data2 = [{ example: [{ type: 'scss', code: '' }] }];
      sinon.spy(Promise, 'promisify');

      Promise.all([this.example.resolve(data), this.example.resolve(data2)])
        .then(() => {
          sinon.assert.calledOnce(Promise.promisify);
        })
        .finally(() => {
          Promise.promisify.restore();
          done();
        });
    });

    it('skips non-html, non-njk, non-scss items', function (done) {
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
          assert.strictEqual(data[0].example[0].rendered, undefined);
          done();
        })
        .catch(done);
    });

    it('warns only once about missing templatePath', () => {
      const env = { logger: { warn: sinon.fake() }, herman: {} };
      const example = annotations.example(env);
      const data = [
        { example: [{ type: 'njk' }] },
        { example: [{ type: 'njk' }] },
      ];

      example.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn if njk @example not used', () => {
      const env = { logger: { warn: sinon.fake() }, herman: {} };
      const example = annotations.example(env);
      const data = [{}];

      example.resolve(data);

      assert.deepStrictEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders nunjucks example', function (done) {
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.njk' as macros %}\n" +
                '{{ macros.mymacro(1, 2) }}',
            },
          ],
        },
      ];
      this.example
        .resolve(data)
        .then(() => {
          assert.strictEqual(data[0].example[0].rendered, '1 then 2.');
          assert.ok(data[0].example[0].iframed !== undefined);
          done();
        })
        .catch(done);
    });

    it('uses custom nunjucks env, if exists', () => {
      const nunjucksEnv = nunjucks.configure(
        path.resolve(__dirname, 'fixtures', 'templates'),
      );
      nunjucksEnv.addFilter('plus_one', (val) => val + 1);
      const env = { herman: { nunjucks: { environment: nunjucksEnv } } };
      const example = annotations.example(env);
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.njk' as macros %}\n" +
                '{{ macros.macro_with_custom_filter(5) }}',
            },
          ],
        },
      ];

      example.resolve(data);

      assert.strictEqual(data[0].example[0].rendered, '6');
    });
  });
});

describe('name annotation', () => {
  before(function () {
    this.name = annotations.name(this.env);
  });

  describe('parse', () => {
    it('trims text', function () {
      assert.strictEqual(this.name.parse('foo '), 'foo');
    });
  });

  describe('autofill', () => {
    it('preserves original context name', function () {
      const data = { name: 'foo', context: { name: 'bar' } };

      this.name.autofill(data);

      assert.deepStrictEqual(data, {
        context: { name: 'foo', origName: 'bar' },
      });
    });

    it('does nothing if no item.name', function () {
      const data = { context: { name: 'bar' } };

      this.name.autofill(data);

      assert.deepStrictEqual(data, { context: { name: 'bar' } });
    });
  });
});
