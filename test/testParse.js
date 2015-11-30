'use strict';

var parse = require('../lib/parse.js');
var assert = require('assert');

describe('parse', function () {
  describe('sassJson', function () {

    it('parses sassJson', function () {
      var contents = '/*! json-encode: {"a": 1} */';
      var expected = { a: 1 };

      assert.deepEqual(parse.sassJson(contents), expected);
    });

    it('parses sassJson with cruft after it', function () {
      var contents = '/*! json-encode: {"a": 1} */\n\n' +
        '/*# sourceMappingURL=sass_json.bundle.css.map*/';
      var expected = { a: 1 };

      assert.deepEqual(parse.sassJson(contents), expected);
    });

  });
});
