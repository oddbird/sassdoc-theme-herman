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

    it('warns and exits if no templatepath and @macro used', function () {
      var env = { logger: { warn: sinon.stub() }};
      var macro = theme.annotations[0](env);
      var data = [{ macro: {}}];

      macro.resolve(data);

      assert.deepEqual(data, [{ macro: {}}]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using @macro.'));
    });

    it('warns only once about missing templatepath', function () {
      var env = { logger: { warn: sinon.stub() }};
      var macro = theme.annotations[0](env);
      var data = [{ macro: {}}, { macro: {}}];

      macro.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn on lack of templatepath if @macro not used', function () {
      var env = { logger: { warn: sinon.stub() }};
      var macro = theme.annotations[0](env);
      var data = [{}];

      macro.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
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
