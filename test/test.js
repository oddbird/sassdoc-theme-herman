'use strict';

const assert = require('assert');
const path = require('path');
const sinon = require('sinon');
const theme = require('../');
const nunjucks = require('nunjucks');

describe('macro annotation', function() {
  before(function() {
    this.env = {
      herman: { templatepath: path.resolve(__dirname, 'templates') },
    };
    this.macro = theme.annotations[0](this.env);
  });

  describe('parse', function() {
    it('splits on colon', function() {
      assert.deepEqual(this.macro.parse('foo.j2:name'), {
        file: 'foo.j2',
        name: 'name',
      });
    });
  });

  describe('resolve', function() {
    it('warns and exits if no templatepath and @macro used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const macro = theme.annotations[0](env);
      const data = [{ macro: {} }];

      macro.resolve(data);

      assert.deepEqual(data, [{ macro: {} }]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using @macro.'
        )
      );
    });

    it('warns only once about missing templatepath', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const macro = theme.annotations[0](env);
      const data = [{ macro: {} }, { macro: {} }];

      macro.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn on lack of templatepath if @macro not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const macro = theme.annotations[0](env);
      const data = [{}];

      macro.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders macro and doc', function() {
      const data = [{ macro: { file: 'macros.j2', name: 'mymacro' } }];

      this.macro.resolve(data);

      assert.deepEqual(data, [
        {
          macro: {
            file: 'macros.j2',
            name: 'mymacro',
            doc: 'This is my macro.',
          },
        },
      ]);
    });
  });
});

describe('icons annotation', function() {
  before(function() {
    this.env = {
      herman: { templatepath: path.resolve(__dirname, 'templates') },
    };
    this.icons = theme.annotations[1](this.env);
  });

  describe('parse', function() {
    it('splits on space and colon', function() {
      assert.deepEqual(this.icons.parse('icons/ foo.j2:name'), {
        iconsPath: 'icons/',
        macroFile: 'foo.j2',
        macroName: 'name',
      });
    });
  });

  describe('resolve', function() {
    it('warns and exits if no templatepath and @icons used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const icons = theme.annotations[1](env);
      const data = [{ icons: {} }];

      icons.resolve(data);

      assert.deepEqual(data, [{ icons: {} }]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using @icons.'
        )
      );
    });

    it('warns only once about missing templatepath', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const icons = theme.annotations[1](env);
      const data = [{ icons: {} }, { icons: {} }];

      icons.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn on lack of templatepath if @icons not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const icons = theme.annotations[1](env);
      const data = [{}];

      icons.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders icons', function() {
      const data = [
        {
          icons: {
            iconsPath: 'test/templates/icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
      ];

      this.icons.resolve(data);

      assert.deepEqual(data[0].icons, [
        {
          name: 'ok',
          path: 'test/templates/icons/ok.svg',
          rendered: 'rendered ok',
        },
        {
          name: 'warning',
          path: 'test/templates/icons/warning.svg',
          rendered: 'rendered warning',
        },
      ]);
      assert.ok(data[0].iframed !== undefined);
    });
  });
});

describe('preview annotation', function() {
  before(function() {
    this.preview = theme.annotations[2]();
  });

  describe('parse', function() {
    it('parses CSS-like options and returns object', function() {
      assert.deepEqual(
        this.preview.parse(' font-specimens; foo : bar ; baz ;'),
        { type: 'font-specimens', foo: 'bar', baz: null }
      );
    });
  });
});

describe('example annotation', function() {
  before(function() {
    this.env = {
      herman: { templatepath: path.resolve(__dirname, 'templates') },
    };
    this.example = theme.annotations[3](this.env);
  });

  describe('resolve', function() {
    it('warns and exits if no templatepath and njk @example used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = theme.annotations[3](env);
      const data = [{ example: [{ type: 'njk' }] }];

      example.resolve(data);

      assert.deepEqual(data, [{ example: [{ type: 'njk' }] }]);
      assert(
        env.logger.warn.calledWith(
          'Must pass in a templatepath if using Nunjucks @example.'
        )
      );
    });

    it('warns only once about missing templatepath', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = theme.annotations[3](env);
      const data = [
        { example: [{ type: 'njk' }] },
        { example: [{ type: 'njk' }] },
      ];

      example.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn if njk @example not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = theme.annotations[3](env);
      const data = [{}];

      example.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders nunjucks example', function() {
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.j2' as macros %}\n" +
                '{{ macros.mymacro(1, 2) }}',
            },
          ],
        },
      ];
      this.example.resolve(data);
      assert.equal(data[0].example[0].rendered, '1 then 2.');
    });

    it('uses custom nunjucks env, if exists', function() {
      const nunjucksEnv = nunjucks.configure(
        path.resolve(__dirname, 'templates')
      );
      nunjucksEnv.addFilter('plus_one', function(val) {
        return val + 1;
      });
      const env = { herman: { nunjucksEnv } };
      const example = theme.annotations[3](env);
      const data = [
        {
          example: [
            {
              type: 'njk',
              code:
                "{% import 'macros.j2' as macros %}\n" +
                '{{ macros.macro_with_custom_filter(5) }}',
            },
          ],
        },
      ];

      example.resolve(data);

      assert.equal(data[0].example[0].rendered, '6');
    });
  });
});

describe('name annotation', function() {
  before(function() {
    this.macro = theme.annotations[4](this.env);
  });

  describe('parse', function() {
    it('trims text', function() {
      assert.equal(this.macro.parse('foo '), 'foo');
    });
  });

  describe('autofill', function() {
    it('preserves original context name', function() {
      const data = { name: 'foo', context: { name: 'bar' } };

      this.macro.autofill(data);

      assert.deepEqual(data, { context: { name: 'foo', origName: 'bar' } });
    });
  });
});
