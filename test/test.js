'use strict';

var assert = require('assert');
var path = require('path');
var sinon = require('sinon');
var theme = require('../');

describe('macro annotation', function () {
  before(function () {
    this.env = { templatepath: path.resolve(__dirname, 'templates') };
    this.macro = theme.annotations[0](this.env);
  });

  describe('parse', function () {

    it('splits on colon', function () {
      assert.deepEqual(
        this.macro.parse('foo.j2:name'),
        { file: 'foo.j2', name: 'name' }
      );
    });

  });

  describe('resolve', function () {

    it('warns and exits if no templatepath', function () {
      var env = { logger: { warn: sinon.stub() }};
      var macro = theme.annotations[0](env);
      var data = { foo: 'bar' };

      macro.resolve(data);

      assert.deepEqual(data, { foo: 'bar' });
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using @macro.'));
    });

    it('renders macro and doc', function () {
      var data = [{ macro: { file: 'macros.j2', name: 'mymacro' }}];

      this.macro.resolve(data);

      assert.deepEqual(data, [{
        macro: {
          file: 'macros.j2',
          name: 'mymacro',
          args: '"one","two"',
          doc: 'This is my macro.',
          rendered: 'one then two.'
        }
      }]);
    });

  });
});
