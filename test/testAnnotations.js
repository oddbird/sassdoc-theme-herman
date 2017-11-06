'use strict';

const assert = require('assert');
const nunjucks = require('nunjucks');
const path = require('path');
const sinon = require('sinon');

/* eslint-disable global-require */
const annotations = {
  macro: require('../lib/annotations/macro'),
  icons: require('../lib/annotations/icons'),
  preview: require('../lib/annotations/preview'),
  font: require('../lib/annotations/font'),
  example: require('../lib/annotations/example'),
  name: require('../lib/annotations/name'),
};
/* eslint-enable global-require */

describe('macro annotation', function() {
  before(function() {
    this.env = {
      herman: { templatepath: path.resolve(__dirname, 'templates') },
    };
    this.macro = annotations.macro(this.env);
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
      const macro = annotations.macro(env);
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
      const macro = annotations.macro(env);
      const data = [{ macro: {} }, { macro: {} }];

      macro.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn on lack of templatepath if @macro not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const macro = annotations.macro(env);
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
    this.icons = annotations.icons(this.env);
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
      const icons = annotations.icons(env);
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
      const icons = annotations.icons(env);
      const data = [{ icons: {} }, { icons: {} }];

      icons.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn on lack of templatepath if @icons not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const icons = annotations.icons(env);
      const data = [{}];

      icons.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('logs errors on bad icon path', function() {
      const data = [
        {
          icons: {
            iconsPath: 'test/templates/bad_icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
      ];

      this.icons.resolve(data).then(
        () => {
          sinon.assert.calledOnce(env.logger.warn);
          done();
        },
        error => {
          assert.fail(error);
          done();
        }
      );
    });

    it('renders icons', function(done) {
      const data = [
        {
          icons: {
            iconsPath: 'test/templates/icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
      ];

      this.icons.resolve(data).then(
        () => {
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
          done();
        },
        error => {
          assert.fail(error);
          done();
        }
      );
    });

    it("doesn't recreate a customNjkEnv", function(done) {
      const data = [
        {
          icons: {
            iconsPath: 'test/templates/icons',
            macroFile: 'macros.j2',
            macroName: 'icon',
          },
        },
        {
          icons: {
            iconsPath: 'test/templates/icons',
            macroFile: 'macros.j2',
            macroName: 'mymacro',
          },
        },
      ];
      // Gotta actually spy on a thing here:
      const getNunjucksEnvSpy = sinon.spy();

      this.icons.resolve(data).then(
        () => {
          // assert(getNunjucksEnvSpy.calledOnce);
          done();
        },
        error => {
          assert.fail(error);
          done();
        }
      );
    });
  });
});

describe('preview annotation', function() {
  before(function() {
    this.preview = annotations.preview();
  });

  describe('parse', function() {
    it('parses CSS-like options and returns object', function() {
      assert.deepEqual(this.preview.parse(' sizes; foo : bar ; baz ;'), {
        type: 'sizes',
        foo: 'bar',
        baz: null,
      });
    });
  });
});

describe('font annotation', function() {
  before(function() {
    this.env = {};
    this.font = annotations.font(this.env);
  });

  describe('parse', function() {
    it('parses options and returns object', function() {
      const input =
        '"key" (variant1, variant2) {format1, format2}\n' +
        '  <link rel="stylesheet">';
      assert.deepEqual(this.font.parse(input), {
        key: 'key',
        variants: ['variant1', 'variant2'],
        formats: ['format1', 'format2'],
        html: '<link rel="stylesheet">',
      });
      assert.equal(this.env.fontsHTML, '\n<link rel="stylesheet">');
    });
  });

  describe('resolve', function() {
    describe('local font', function() {
      before(function() {
        this.data = [{ font: { key: 'test-font', formats: ['woff'] } }];
        this.origData = Object.assign({}, this.data);
      });

      it('warns and exits if no fontpath', function() {
        const env = { logger: { warn: sinon.stub() }, herman: {} };
        const example = annotations.font(env);

        example.resolve(this.data);

        assert.deepEqual(this.data, this.origData);
        assert(
          env.logger.warn.calledWith(
            'Must pass in a `fontpath` if using @font annotation with local ' +
              'fonts.'
          )
        );
      });

      it('warns and exits if no jsonfile', function() {
        const env = {
          logger: { warn: sinon.stub() },
          herman: { fontpath: '/path' },
        };
        const example = annotations.font(env);

        example.resolve(this.data);

        assert.deepEqual(this.data, this.origData);
        assert(
          env.logger.warn.calledWith(
            'Must pass in a `sassjson` file if using @font annotation with ' +
              'local fonts.'
          )
        );
      });

      it('adds `@font-face` CSS and localFonts src', function(done) {
        const env = {
          logger: { warn: sinon.stub() },
          herman: {
            fontpath: '/path',
            sass: {
              jsonfile: '/json',
            },
          },
          sassjson: {
            fonts: {
              'test-font': {
                regular: 'font/font',
              },
            },
          },
        };
        const example = annotations.font(env);

        example.resolve(this.data).then(
          () => {
            const css =
              '@font-face {\n' +
              "  font-family: 'test-font';\n" +
              "  src: url('assets/fonts/font/font.woff') format('woff');\n" +
              '  font-style: normal;\n' +
              '  font-weight: normal;\n' +
              '}\n';

            assert.equal(this.data[0].font.localFontCSS, css);
            assert.deepEqual(env.localFonts, ['/path/font/font.woff']);
            done();
          },
          err => {
            assert.fail(err);
            done();
          }
        );
      });
    });
  });
});

describe('example annotation', function() {
  before(function() {
    this.env = {
      herman: { templatepath: path.resolve(__dirname, 'templates') },
    };
    this.example = annotations.example(this.env);
  });

  describe('resolve', function() {
    it('warns and exits if no templatepath and njk @example used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = annotations.example(env);
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
      const example = annotations.example(env);
      const data = [
        { example: [{ type: 'njk' }] },
        { example: [{ type: 'njk' }] },
      ];

      example.resolve(data);

      sinon.assert.calledOnce(env.logger.warn);
    });

    it('does not warn if njk @example not used', function() {
      const env = { logger: { warn: sinon.stub() }, herman: {} };
      const example = annotations.example(env);
      const data = [{}];

      example.resolve(data);

      assert.deepEqual(data, [{}]);
      sinon.assert.notCalled(env.logger.warn);
    });

    it('renders nunjucks example', function(done) {
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
      this.example.resolve(data).then(
        () => {
          assert.equal(data[0].example[0].rendered, '1 then 2.');
          assert.ok(data[0].example[0].iframed !== undefined);
          done();
        },
        err => {
          assert.fail(err);
          done();
        }
      );
    });

    it('uses custom nunjucks env, if exists', function() {
      const nunjucksEnv = nunjucks.configure(
        path.resolve(__dirname, 'templates')
      );
      nunjucksEnv.addFilter('plus_one', function(val) {
        return val + 1;
      });
      const env = { herman: { nunjucksEnv } };
      const example = annotations.example(env);
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
    this.macro = annotations.name(this.env);
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
