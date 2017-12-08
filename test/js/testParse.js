'use strict';

const assert = require('assert');

const parse = require('../../lib/utils/parse');

describe('parse', function() {
  describe('sassJson', function() {
    it('parses sassJson', function() {
      const contents = '/*! json-encode: {"a": 1} */';
      const expected = { a: 1 };

      assert.deepEqual(parse.sassJson(contents), expected);
    });

    it('parses sassJson with cruft after it', function() {
      const contents =
        '/*! json-encode: {"a": 1} */\n\n' +
        '/*# sourceMappingURL=sass_json.bundle.css.map*/';
      const expected = { a: 1 };

      assert.deepEqual(parse.sassJson(contents), expected);
    });
  });

  describe('localFont', function() {
    it('skips invalid variants', function() {
      const font = {
        variants: ['bold'],
      };
      const data = {};
      const actual = parse.localFont(font, data);
      const expected = [];

      assert.deepEqual(actual, expected);
    });

    it('sets weight and style appropriately', function() {
      const font = {
        variants: ['italic 100'],
        formats: ['italic'],
      };
      const data = {
        'italic 100': 'font/path',
      };
      const actual = parse.localFont(font, data);
      const expected = [
        {
          ctx: {
            dest_path: 'assets/fonts/font/path',
            family: undefined,
            formats: ['italic'],
            style: 'italic',
            svgid: undefined,
            weight: '100',
          },
          src_path: 'font/path',
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe('customCSS', function() {
    beforeEach(function() {
      this.enc = 'utf-8';
      this.env = {
        dir: __dirname,
      };
    });

    it('handles relative URLs', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { background: url("foo.png"); }',
      };
      parse.customCSS(file, this.enc, this.env);
      const actual = file.contents;
      const expected = '.foo { background: url("./fixtures/css/foo.png"); }';

      assert.deepEqual(actual.toString(), expected);
    });

    it('handles unquoted relative URLs', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { background: url(foo.png); }',
      };
      parse.customCSS(file, this.enc, this.env);
      const actual = file.contents;
      const expected = '.foo { background: url(./fixtures/css/foo.png); }';

      assert.deepEqual(actual.toString(), expected);
    });

    it('uses localFonts', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { @font-face { src: url(../../myfonts/font.ttf); }}',
      };
      const env = Object.assign(this.env, {
        localFonts: [`${__dirname}/myfonts/font.ttf`],
        herman: {
          fontpath: 'myfonts/',
        },
      });
      parse.customCSS(file, this.enc, env);
      const actual = file.contents;
      const expected = '.foo { @font-face { src: url(../fonts/font.ttf); }}';

      assert.deepEqual(actual.toString(), expected);
    });

    it('skips external URLs', function() {
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

      assert.deepEqual(actual.toString(), expected);
    });
  });
});
