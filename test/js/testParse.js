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
        'italic 100': true,
      };
      const actual = parse.localFont(font, data);
      const expected = [
        {
          ctx: {
            dest_path: 'assets/fonts/true',
            family: undefined,
            formats: ['italic'],
            style: 'italic',
            svgid: undefined,
            weight: '100',
          },
          src_path: true,
        },
      ];

      assert.deepEqual(actual, expected);
    });
  });

  describe('customCSS', function() {
    it('handles relative URLs', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { background: url("foo.png"); }',
      };
      const enc = 'utf-8';
      const env = {
        dir: __dirname,
      };
      parse.customCSS(file, enc, env);
      const actual = file.contents;
      const expected =
        '.foo { background: url("../../custom/fixtures/css/foo.png"); }';

      assert.deepEqual(actual.toString(), expected);
    });

    it('handles unquoted relative URLs', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { background: url(foo.png); }',
      };
      const enc = 'utf-8';
      const env = {
        dir: __dirname,
      };
      parse.customCSS(file, enc, env);
      const actual = file.contents;
      const expected =
        '.foo { background: url(../../custom/fixtures/css/foo.png); }';

      assert.deepEqual(actual.toString(), expected);
    });

    it('uses localFonts', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents: '.foo { background: url(foo.png); }',
      };
      const enc = 'utf-8';
      const env = {
        dir: __dirname,
        localFonts: [`${__dirname}/fixtures/css/foo.png`],
        herman: {
          fontpath: '',
        },
      };
      parse.customCSS(file, enc, env);
      const actual = file.contents;
      const expected =
        '.foo { background: url(../../fonts/fixtures/css/foo.png); }';

      assert.deepEqual(actual.toString(), expected);
    });

    it('skips absolute URLs', function() {
      const file = {
        path: `${__dirname}/fixtures/css/main.css`,
        contents:
          '.foo { background: url(http://foo); background: url(//foo); background: url(data://foo); }',
      };
      const enc = 'utf-8';
      const env = {
        dir: __dirname,
      };
      parse.customCSS(file, enc, env);
      const actual = file.contents;
      const expected =
        '.foo { background: url(http://foo); background: url(//foo); background: url(data://foo); }';

      assert.deepEqual(actual.toString(), expected);
    });
  });
});
