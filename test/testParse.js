var parse = require('../lib/parse.js');
var assert = require('assert');

describe('parse', function () {
  describe('sassyJson', function () {

    it('parses sassyJson', function () {
      var contents = '/*! json-encode: {"a": 1} */';
      var expected = {a: 1};

      assert.deepEqual(parse.sassyJson(contents), expected);
    });

  });
});
