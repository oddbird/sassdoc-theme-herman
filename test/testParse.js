'use strict';

const assert = require('assert');

const parse = require('../lib/parse.js');

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
});
