'use strict';

var assert = require('assert');
var path = require('path');
var sinon = require('sinon');
var theme = require('../');
var nunjucks = require('nunjucks');

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
          doc: 'This is my macro.'
        }
      }]);
    });

  });
});

describe('icons annotation', function () {
  before(function () {
    this.env = { templatepath: path.resolve(__dirname, 'templates') };
    this.icons = theme.annotations[1](this.env);
  });

  describe('parse', function () {

    it('splits on space and colon', function () {
      assert.deepEqual(
        this.icons.parse('icons/ foo.j2:name'),
        { iconsPath: 'icons/', macroFile: 'foo.j2', macroName: 'name' }
      );
    });

  });

  describe('resolve', function () {

    it('warns and exits if no templatepath and @icons used', function () {
      var env = { logger: { warn: sinon.stub() }};
      var icons = theme.annotations[1](env);
      var data = [{ icons: {}}];

      icons.resolve(data);

      assert.deepEqual(data, [{ icons: {}}]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using @icons.'));
    });

    it('warns only once about missing templatepath', function () {
      var env = { logger: { warn: sinon.stub() }};
      var icons = theme.annotations[1](env);
      var data = [{ icons: {}}, { icons: {}}];

      icons.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn on lack of templatepath if @icons not used', function () {
      var env = { logger: { warn: sinon.stub() }};
      var icons = theme.annotations[1](env);
      var data = [{}];

      icons.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders icons', function () {
      var data = [{ icons: {
        iconsPath: 'icons/', macroFile: 'macros.j2', macroName: 'icon' }}];

      this.icons.resolve(data);

      assert.deepEqual(data, [{
        icons: [
          {
            name: 'ok',
            path: 'icons/ok.svg',
            rendered: 'rendered ok'
          },
          {
            name: 'warning',
            path: 'icons/warning.svg',
            rendered: 'rendered warning'
          }
        ]
      }]);
    });

  });

});

describe('preview annotation', function () {
  before(function () {
    this.preview = theme.annotations[2]();
  });

  describe('parse', function () {

    it('parses CSS-like options and returns object', function () {
      assert.deepEqual(
        this.preview.parse(' font-specimens; foo : bar ; baz ;'),
        { type: 'font-specimens', foo: 'bar', baz: null }
      );
    });

  });

});

describe('example annotation', function () {
  before(function () {
    this.env = { templatepath: path.resolve(__dirname, 'templates') };
    this.example = theme.annotations[3](this.env);
  });

  describe('resolve', function () {

    it('warns and exits if no templatepath and njk @example used', function () {
      var env = { logger: { warn: sinon.stub() }};
      var example = theme.annotations[3](env);
      var data = [{ example: [{ type: 'njk' }] }];

      example.resolve(data);

      assert.deepEqual(data, [{ example: [{ type: 'njk' }] }]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using Nunjucks @example.'));
    });

    it('warns only once about missing templatepath', function () {
      var env = { logger: { warn: sinon.stub() }};
      var example = theme.annotations[3](env);
      var data = [
        { example: [{ type: 'njk' }] },
        { example: [{ type: 'njk' }] }
      ];

      example.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn if njk @example not used', function () {
      var env = { logger: { warn: sinon.stub() }};
      var example = theme.annotations[3](env);
      var data = [{}];

      example.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders nunjucks example', function () {
      var data = [{
        example: [{
          type: 'njk',
          code: "{% import 'macros.j2' as macros %}\n{{ macros.mymacro(1, 2) }}"
        }]
      }];
      this.example.resolve(data);
      assert.equal(data[0].example[0].rendered,
        '1 then 2.');
    });

    it('uses custom nunjucks env, if exists', function () {
      var nunjucksEnv = nunjucks.configure(
        path.resolve(__dirname, 'templates'));
      nunjucksEnv.addFilter('plus_one', function (val) {
        return val + 1;
      });
      var env = { nunjucksEnv: nunjucksEnv };
      var example = theme.annotations[3](env);
      var data = [{
        example: [{
          type: 'njk',
          code: "{% import 'macros.j2' as macros %}\n" +
            '{{ macros.macro_with_custom_filter(5) }}'
        }]
      }];

      example.resolve(data);

      assert.equal(data[0].example[0].rendered, '6');
    });

  });
});
