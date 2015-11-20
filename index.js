'use strict';

var extend = require('extend');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');
var Promise = require('bluebird');

var copy = require('./lib/assets.js');
var parse = require('./lib/parse.js');
var render = require('./lib/render.js');

/**
 * SassDoc extras (providing Markdown and other filters, and different way to
 * index SassDoc data).
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
var extras = require('sassdoc-extras');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
module.exports = function (dest, ctx) {
  var src = path.resolve(__dirname, './views/index.j2');
  var base = path.resolve(__dirname, './views');
  var assets = path.resolve(__dirname, './assets');
  var nunjucksEnv = nunjucks.configure(base, { noCache: true });
  dest = path.resolve(dest);

  var def = {
    display: {
      access: [ 'public', 'private' ],
      alias: false,
      watermark: true
    },
    groups: {
      undefined: 'General'
    },
    shortcutIcon: 'http://sass-lang.com/favicon.ico'
  };

  // Apply default values for groups and display.
  ctx.groups = extend(def.groups, ctx.groups);
  ctx.display = extend(def.display, ctx.display);

  // Extend top-level context keys.
  ctx = extend({}, def, ctx);

  /**
   * Load a `sassyjsonfile` (if one is given in the context) and add its
   * contents under the `sassyjson` key of the context.
   */
  if (ctx.sassyjsonfile) {
    /* eslint-disable no-sync */
    ctx.sassyjson = parse.sassyJson(fs.readFileSync(ctx.sassyjsonfile));
    /* eslint-enable no-sync */
  }

  /**
   * Parse text data (like descriptions) as Markdown, and put the
   * rendered HTML in `html*` variables.
   *
   * For example, `ctx.package.description` will be parsed as Markdown
   * in `ctx.package.htmlDescription`.
   *
   * See <http://sassdoc.com/extra-tools/#markdown>.
   */
  extras.markdown(ctx);

  /**
   * Add a `display` property for each data item regarding of display
   * configuration (hide private items and aliases for example).
   *
   * You'll need to add default values in your `.sassdocrc` before
   * using this filter:
   *
   *     {
   *       "display": {
   *         "access": ["public", "private"],
   *         "alias": false
   *       }
   *     }
   *
   * See <http://sassdoc.com/extra-tools/#display-toggle>.
   */
  extras.display(ctx);

  /**
   * Allow the user to give a name to the documentation groups.
   *
   * We can then have `@group slug` in the docblock, and map `slug`
   * to `Some title string` in the theme configuration.
   *
   * **Note:** all items without a group are in the `undefined` group.
   *
   * See <http://sassdoc.com/extra-tools/#groups-aliases>.
   */
  extras.groupName(ctx);

  /**
   * Use SassDoc indexer to index the data by group and type, so we
   * have the following structure:
   *
   *     {
   *       "group-slug": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       },
   *       "another-group": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       }
   *     }
   *
   * You can then use `data.byGroupAndType` instead of `data` in your
   * templates to manipulate the indexed object.
   */
  ctx.data.byGroupAndType = extras.byGroupAndType(ctx.data);

  return Promise.all([
    render(nunjucksEnv, src, dest, ctx),
    copy(assets, dest)
  ]);
};

module.exports.annotations = [
  /**
   * Custom `@macro` annotation. Expects macrofile:macroname.
   *
   * The referenced macro should have `macroname_doc` (a string containing
   * documentation for the macro) and `macroname_data` (a list of "fake data"
   * arguments for rendering the macro) vars defined in the same macro file.
   */
  function macro (env) {
    return {
      name: 'macro',
      multiple: false,
      parse: function (raw) {
        // expects e.g. 'forms.macros.js.j2:label' and returns { file:
        // 'forms.macros.js.j2', name: 'label' }
        var bits = raw.split(':');
        return { file: bits[0], name: bits[1] };
      },
      resolve: function (data) {
        var cachedNunjucksEnv;
        var warned = false;
        // get nunjucks env lazily so that we only throw an error on missing
        // templatepath if @macro was actually used.
        var getNunjucksEnv = function () {
          if (!cachedNunjucksEnv) {
            if (!env.templatepath) {
              if (!warned) {
                env.logger.warn('Must pass in a templatepath if using @macro.');
                warned = true;
              }
              return null;
            }
            cachedNunjucksEnv = nunjucks.configure(env.templatepath);
            cachedNunjucksEnv.addFilter('joinArgs', function (args) {
              return args.map(function (arg) {
                return JSON.stringify(arg);
              }).join(',');
            });
          }
          return cachedNunjucksEnv;
        };
        data.forEach(function (item) {
          if (!item.macro) { return; }
          var nunjucksEnv = getNunjucksEnv();
          if (!nunjucksEnv) { return; }
          var prefix = '{% import "' + item.macro.file + '" as it %}';
          var docTpl = prefix + '{{ it.' + item.macro.name + '_doc }}';
          var argsTpl = prefix +
            '{{ it.' + item.macro.name + '_data|joinArgs|safe }}';
          item.macro.args = nunjucksEnv.renderString(argsTpl);
          var renderTpl = prefix +
            '{{ it.' + item.macro.name +
            '(' + item.macro.args + ') }}';
          item.macro.doc = nunjucksEnv.renderString(docTpl);
          item.macro.rendered = nunjucksEnv.renderString(renderTpl).trim();
        });
      }
    };
  }
];
