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
  var base = path.resolve(__dirname, './views');
  var indexTemplate = path.join(base, 'index.j2');
  var indexDest = path.join(dest, 'index.html');
  var groupTemplate = path.join(base, 'group.j2');
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
      undefined: 'general'
    },
    sort: [ 'group', 'file', 'line', 'access' ]
  };

  // Apply default values for groups and display.
  ctx.groups = extend(def.groups, ctx.groups);
  ctx.display = extend(def.display, ctx.display);

  if (!ctx.description) {
    def.descriptionPath = './README.md';
  }

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
   * Add `description` and `descriptionPath` from configuration.
   * Note: `descriptionPath` will override `description`.
   *
   * See
   * <http://sassdoc.com/extra-tools/#description-description-descriptionpath>.
   */
  extras.description(ctx);

  /**
   * Parse text data (like descriptions) as Markdown, and put the
   * rendered HTML in `html*` variables.
   *
   * For example, `ctx.package.description` will be parsed as Markdown
   * in `ctx.package.htmlDescription`.
   *
   * See <http://sassdoc.com/extra-tools/#markdown-markdown>.
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
   * See <http://sassdoc.com/extra-tools/#display-toggle-display>.
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
   * See <http://sassdoc.com/extra-tools/#groups-aliases-groupname>.
   */
  extras.groupName(ctx);

  /**
   * Converts `shortcutIcon` config option into an object:
   *
   *       {
   *         "type": "external",
   *         "url": "http://absolute.path/to/icon.png"
   *       }
   *
   *       {
   *         "type": "internal",
   *         "url": "icon.png",
   *         "path": "/complete/relative/path/to/icon.png"
   *       }
   *
   * See <http://sassdoc.com/extra-tools/#shortcut-icon-shortcuticon>.
   */
  extras.shortcutIcon(ctx);

  /**
   * Sorts items based on the `sort` config value.
   * Sort order is determined by the last character: > (desc) or < (asc).
   *
   *       {
   *         "sort": [
   *            "access",
   *            "line>",
   *            "group",
   *            "file"
   *          ]
   *       }
   *
   * See <http://sassdoc.com/extra-tools/#sort-sort>.
   */
  extras.sort(ctx);

  /**
   * Connects aliased variables to their original value.
   * Adds `resolvedValue` key:
   *
   *       {
   *         "description": "<p>Main color</p>\n",
   *         "context": {
   *           "type": "variable",
   *           "name": "color-main",
   *           "value": "$color-blue"
   *         },
   *         "type": "Color",
   *         "resolvedValue": "#22b8dc"
   *       }
   *
   * See <http://sassdoc.com/extra-tools/#resolved-variables-resolvevariables>.
   */
  extras.resolveVariables(ctx);

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

  // check if we need to copy a favicon file or use the default
  var copyShortcutIcon = false;
  if (!ctx.shortcutIcon) {
    ctx.shortcutIcon = { type: 'internal', url: 'assets/img/favicon.ico' };
  } else if (ctx.shortcutIcon.type === 'internal') {
    ctx.shortcutIcon.url = 'assets/img/' + ctx.shortcutIcon.url;
    copyShortcutIcon = true;
  }

  // render the index template and copy the static assets.
  var promises = [
    render(nunjucksEnv, indexTemplate, indexDest, ctx),
    copy(
      path.join(assets, '/**/*.{css,js,svg,png,eot,woff,woff2,ttf,ico}'),
      path.join(dest, 'assets')
    ).then(function () {
      if (copyShortcutIcon) {
        return copy(ctx.shortcutIcon.path, path.resolve(dest, 'assets/img/'));
      }
    })
  ];

  // Render a template for each group, too. The group template is passed the
  // main context with an added `data.currentGroup` key which contains the name
  // of the current group.
  Object.getOwnPropertyNames(ctx.data.byGroupAndType).forEach(
    function (groupName) {
      var groupDest = path.join(dest, groupName + '.html');
      var groupData = extend({ currentGroup: groupName }, ctx.data);
      var groupCtx = extend({}, ctx);
      groupCtx.data = groupData;
      promises.push(render(nunjucksEnv, groupTemplate, groupDest, groupCtx));
    }
  );

  return Promise.all(promises);
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
