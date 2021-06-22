'use strict';

const assert = require('assert');
const path = require('path');

const parse = require('../../lib/utils/parse');

describe('parse', () => {
  describe('sassJson', () => {
    it('parses sassJson', () => {
      const contents = '/*! json-encode: {"a": 1} */';
      const expected = { a: 1 };

      assert.deepStrictEqual(parse.sassJson(contents), expected);
    });

    it('parses sassJson with cruft after it', () => {
      const contents =
        '/*! json-encode: {"a": 1} */\n\n' +
        '/*# sourceMappingURL=sass_json.bundle.css.map*/';
      const expected = { a: 1 };

      assert.deepStrictEqual(parse.sassJson(contents), expected);
    });
  });

  describe('font', () => {
    it('skips invalid variants', () => {
      const font = {
        variants: ['bold'],
      };
      const data = {};
      const actual = parse.font(font, data);

      assert.strictEqual(actual.length, 1);
      assert.deepStrictEqual(actual[0].formats, {});
    });

    it('sets weight and style appropriately', () => {
      const font = {
        variants: ['italic 100'],
      };
      const data = {
        formats: 'woff',
        'italic 100': {
          path: 'font/path',
          svgid: 'svgid',
        },
      };
      const actual = parse.font(font, data);
      const expected = [
        {
          variant: 'italic 100',
          isLocal: true,
          hasEmbedded: false,
          family: undefined,
          formats: {
            woff: {
              src: path.normalize('font/path.woff'),
              dest: 'assets/fonts/font/path.woff',
            },
          },
          style: 'italic',
          svgid: 'svgid',
          weight: '100',
          local: undefined,
        },
      ];

      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('customCSS', () => {
    beforeEach(function () {
      this.enc = 'utf-8';
      this.env = {
        dir: __dirname,
      };
    });

    it('handles relative URLs', function () {
      const srcPath = path.resolve(__dirname, 'fixtures', 'css', 'main.css');
      const destPath = path.resolve(__dirname, 'fixtures', 'css', 'foo.png');
      const file = {
        path: srcPath,
        contents: '.foo { background: url("foo.png"); }',
      };
      parse.customCSS(file, this.enc, this.env);
      const actual = file.contents;
      const expected = '.foo { background: url("./fixtures/css/foo.png"); }';

      assert.deepStrictEqual(actual.toString(), expected);
      assert.deepStrictEqual(this.env.customCSSFiles, [destPath]);
    });

    it('handles unquoted relative URLs', function () {
      const srcPath = path.resolve(__dirname, 'fixtures', 'css', 'main.css');
      const destPath = path.resolve(__dirname, 'fixtures', 'css', 'foo.png');
      const file = {
        path: srcPath,
        contents: '.foo { background: url(foo.png); }',
      };
      parse.customCSS(file, this.enc, this.env);
      const actual = file.contents;
      const expected = '.foo { background: url(./fixtures/css/foo.png); }';

      assert.deepStrictEqual(actual.toString(), expected);
      assert.deepStrictEqual(this.env.customCSSFiles, [destPath]);
    });

    it('uses localFonts', function () {
      const file = {
        path: path.resolve(__dirname, 'fixtures', 'css', 'main.css'),
        contents: '.foo { @font-face { src: url(../../myfonts/font.ttf); }}',
      };
      const env = Object.assign(this.env, {
        localFonts: [path.resolve(__dirname, 'myfonts', 'font.ttf')],
        herman: {
          fontPath: 'myfonts',
        },
      });
      parse.customCSS(file, this.enc, env);
      const actual = file.contents;
      const expected = '.foo { @font-face { src: url(../fonts/font.ttf); }}';

      assert.deepStrictEqual(actual.toString(), expected);
      assert.deepStrictEqual(env.customCSSFiles, []);
    });

    it('skips external URLs', function () {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents:
          '.foo { background: url(http://foo); background: url(//foo);' +
          ' background: url(data://foo); }',
      };
      parse.customCSS(file, this.enc, this.env);
      const actual = file.contents;
      const expected =
        '.foo { background: url(http://foo); background: url(//foo);' +
        ' background: url(data://foo); }';

      assert.deepStrictEqual(actual.toString(), expected);
      assert.deepStrictEqual(this.env.customCSSFiles, []);
    });

    it('skips domain-relative URLs', function () {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { background: url(/foo); }',
      };
      parse.customCSS(file, this.enc, this.env);
      const actual = file.contents;
      const expected = '.foo { background: url(/foo); }';

      assert.deepStrictEqual(actual.toString(), expected);
      assert.deepStrictEqual(this.env.customCSSFiles, []);
    });
  });
});
