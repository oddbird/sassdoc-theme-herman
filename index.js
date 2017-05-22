'use strict';

var extend = require('extend');
var fs = require('fs');
var nunjucks = require('nunjucks');
var path = require('path');
var Promise = require('bluebird');
var sass = require('node-sass');
var sassdoc = require('sassdoc');
var yaml = require('js-yaml');

var copy = require('./lib/assets.js');
var parse = require('./lib/parse.js');
var render = require('./lib/render.js');

var base = path.resolve(__dirname, './templates');
var iframeTpl = path.join(base, 'example', 'base.j2');

nunjucks.installJinjaCompat();

/**
 * SassDoc extras (providing Markdown and other filters, and different way to
 * index SassDoc data).
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
var extras = require('sassdoc-extras');

var byGroup = function(data) {
  var sorted = {};
  data.forEach(function(item) {
    var group = item.group[0];
    if (!(group in sorted)) {
      sorted[group] = [];
    }
    sorted[group].push(item);
  });
  return sorted;
};

var prepareContext = function(ctx) {
  var def = {
    display: {
      access: ['public', 'private'],
      alias: false,
      watermark: true
    },
    groups: {
      undefined: 'general'
    },
    sort: ['group', 'file', 'line', 'access'],
    herman: { sass: {} }
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
   * Load a `sass-json file` (if one is given in the context) and add its
   * contents under the `sassjson` key of the context.
   */
  if (ctx.herman.sass.jsonfile) {
    ctx.sassjson = parse.sassJson(fs.readFileSync(ctx.herman.sass.jsonfile));
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
   * Index the data by group, so we have the following structure:
   *
   *     {
   *       "group-slug": [...],
   *       "another-group": [...]
   *     }
   *
   * You can then use `data.byGroup` instead of `data` in your
   * templates to manipulate the indexed object.
   */
  ctx.byGroup = byGroup(ctx.data);

  return ctx;
};

var parseSubprojects = function(ctx) {
  var promises = [];
  if (ctx.herman.subprojects) {
    ctx.subprojects = {};
    ctx.herman.subprojects.forEach(function(name) {
      var prjPath = './node_modules/' + name + '/';
      var configFile = prjPath + '.sassdocrc';
      var config = {};
      try {
        // Load .sassdocrc configuration from subproject directory
        config = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
      } catch (err) {
        ctx.logger.warn(
          'Invalid or no .sassdocrc found for subproject: ' + name
        );
      }
      if (!config.description && !config.descriptionPath) {
        // Set default descriptionPath for subproject
        config.descriptionPath = prjPath + 'README.md';
      }
      var src;
      if (config.src) {
        // Set subproject src files based on .sassdocrc `src` option
        src = path.isAbsolute(config.src) ? config.src : prjPath + config.src;
      } else {
        // Fall back to all subproject `.scss` files
        src = prjPath + '**/*.scss';
      }
      // Remove unused/unnecessary config options
      config.src = undefined;
      config.theme = undefined;
      config.dest = undefined;
      var prjCtx = extend({}, config);
      var promise = sassdoc.parse(src, prjCtx).then(function(data) {
        prjCtx.package = ctx.package;
        prjCtx.basePath = '../';
        prjCtx.activeProject = name;
        prjCtx.data = data;
        prjCtx.subprojects = ctx.subprojects;
        prjCtx.topGroups = ctx.groups;
        prjCtx.topByGroup = ctx.byGroup;
        ctx.subprojects[name] = prepareContext(prjCtx);
      });
      promises.push(promise);
    });
  }
  return Promise.all(promises);
};

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
var renderHerman = function(dest, ctx) {
  var indexTemplate = path.join(base, 'index.j2');
  var indexDest = path.join(dest, 'index.html');
  var groupTemplate = path.join(base, 'group.j2');
  var assets = path.resolve(__dirname, './dist');

  var nunjucksEnv = nunjucks.configure(base, { noCache: true });
  nunjucksEnv.addFilter('split', function(str, separator) {
    return str.split(separator);
  });

  dest = path.resolve(dest);

  // set (external) base path for links
  ctx.basePath = '';
  ctx.activeProject = null;
  ctx.topByGroup = ctx.byGroup;
  ctx.topGroups = ctx.groups;

  // check if we need to copy a favicon file or use the default
  var copyShortcutIcon = false;
  if (!ctx.shortcutIcon) {
    ctx.shortcutIcon = { type: 'internal', url: 'assets/img/favicon.ico' };
  } else if (ctx.shortcutIcon.type === 'internal') {
    ctx.shortcutIcon.url = 'assets/img/' + ctx.shortcutIcon.url;
    copyShortcutIcon = true;
  }

  // if needed, copy in a custom css file
  var copyCustomCSS = false;
  if (ctx.herman.customCSS) {
    var srcPath = path.resolve(ctx.dir, ctx.herman.customCSS);
    var cssUrl = 'assets/css/custom/' + path.basename(ctx.herman.customCSS);
    ctx.customCSS = {
      path: srcPath,
      url: cssUrl
    };
    copyCustomCSS = true;
  }

  // if needed, read in minified icons SVG
  ctx.iconsSvg = '';
  if (ctx.herman.templatepath && ctx.herman.minifiedIcons) {
    ctx.iconsSvg = fs.readFileSync(
      path.join(ctx.herman.templatepath, ctx.herman.minifiedIcons)
    );
  }

  // render the index template and copy the static assets.
  var promises = [
    render(nunjucksEnv, indexTemplate, indexDest, ctx),
    copy(
      path.join(assets, '/**/*.{css,js,png,eot,woff,woff2,ttf,ico,map}'),
      path.join(dest, 'assets')
    )
      .then(function() {
        if (copyShortcutIcon) {
          return copy(ctx.shortcutIcon.path, path.resolve(dest, 'assets/img/'));
        }
        return Promise.resolve();
      })
      .then(function() {
        if (copyCustomCSS) {
          return copy(
            ctx.customCSS.path,
            path.resolve(dest, 'assets/css/custom')
          );
        }
        return Promise.resolve();
      })
  ];

  var getRenderCtx = function(context, groupName) {
    return extend({}, context, {
      pageTitle: context.groups[groupName],
      activeGroup: groupName,
      items: context.byGroup[groupName]
    });
  };

  // Render a page for each group, too.
  Object.getOwnPropertyNames(ctx.byGroup).forEach(function(groupName) {
    var groupDest = path.join(dest, groupName + '.html');
    var groupCtx = getRenderCtx(ctx, groupName);
    promises.push(render(nunjucksEnv, groupTemplate, groupDest, groupCtx));
  });

  // Render pages for subprojects.
  Object.getOwnPropertyNames(ctx.subprojects).forEach(function(prjName) {
    var prjCtx = ctx.subprojects[prjName];
    var prjDest = path.join(dest, prjName);
    var pageDest = path.join(prjDest, 'index.html');
    promises.push(render(nunjucksEnv, indexTemplate, pageDest, prjCtx));

    Object.getOwnPropertyNames(prjCtx.byGroup).forEach(function(groupName) {
      var groupDest = path.join(prjDest, groupName + '.html');
      var groupCtx = getRenderCtx(prjCtx, groupName);
      promises.push(render(nunjucksEnv, groupTemplate, groupDest, groupCtx));
    });
  });

  return Promise.all(promises);
};

// get nunjucks env lazily so that we only throw an error on missing
// templatepath if annotation was actually used.
var getNunjucksEnv = function(name, env, warned) {
  if (env.herman.nunjucksEnv) {
    return env.herman.nunjucksEnv;
  }
  if (!env.herman.templatepath) {
    if (!warned) {
      env.logger.warn('Must pass in a templatepath if using ' + name + '.');
    }
    return null;
  }
  return nunjucks.configure(env.herman.templatepath);
};

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
module.exports = function(dest, ctx) {
  ctx = prepareContext(ctx);

  return parseSubprojects(ctx).then(function() {
    renderHerman(dest, ctx);
  });
};

var renderIframe = function(env, item) {
  if (item.rendered) {
    var nunjucksEnv = nunjucks.configure(base, { noCache: true });
    var ctx = extend({}, env, { example: item });
    item.iframed = nunjucksEnv.render(iframeTpl, ctx);
  }
};

module.exports.annotations = [
  /**
   * Custom `@macro` annotation. Expects macrofile:macroname.
   *
   * The referenced macro should have a `macroname_doc` (a string containing
   * documentation for the macro) var defined in the same macro file.
   */
  function macro(env) {
    return {
      name: 'macro',
      multiple: false,
      parse: function(raw) {
        // expects e.g. 'forms.macros.js.j2:label' and returns { file:
        // 'forms.macros.js.j2', name: 'label' }
        var bits = raw.split(':');
        return { file: bits[0], name: bits[1] };
      },
      resolve: function(data) {
        var nunjucksEnv;
        var warned = false;
        data.forEach(function(item) {
          if (!item.macro) {
            return;
          }
          if (!nunjucksEnv) {
            nunjucksEnv = getNunjucksEnv('@macro', env, warned);
          }
          if (!nunjucksEnv) {
            warned = true;
            return;
          }
          var prefix = '{% import "' + item.macro.file + '" as it %}';
          var docTpl = prefix + '{{ it.' + item.macro.name + '_doc }}';
          item.macro.doc = nunjucksEnv.renderString(docTpl);
        });
      }
    };
  },

  /**
   * Custom `@icons` annotation. Expects `iconspath macrofile:macroname`.
   *
   * First argument should be the template path to a directory of icon svg
   * files. Will render given macroname (from given macrofile) with that icon's
   * name as first argument. Sends to template context an `icons` item which is
   * a list of icons, where each one is an object with properties `name`,
   * `path`, and `rendered` (where the latter is the result of rendering the
   * icon macro).
   */
  function icons(env) {
    return {
      name: 'icons',
      multiple: false,
      parse: function(raw) {
        // expects e.g. 'icons/ utility.macros.js.j2:icon' and returns {
        // iconsPath: 'icons/', macroFile: 'utility.macros.js.j2', macroName:
        // 'icon' }
        var bits = raw.split(' ');
        var macrobits = bits[1].split(':');
        return {
          iconsPath: bits[0],
          macroFile: macrobits[0],
          macroName: macrobits[1]
        };
      },
      resolve: function(data) {
        var nunjucksEnv;
        var warned = false;
        data.forEach(function(item) {
          if (!item.icons) {
            return;
          }
          if (!nunjucksEnv) {
            nunjucksEnv = getNunjucksEnv('@icons', env, warned);
          }
          if (!nunjucksEnv) {
            warned = true;
            return;
          }
          var inData = item.icons;
          var iconsPath = path.join(env.herman.templatepath, inData.iconsPath);
          var iconFiles = fs.readdirSync(iconsPath);
          var renderTpl =
            '{% import "' +
            inData.macroFile +
            '" as it %}' +
            '{{ it.' +
            inData.macroName +
            '(iconName) }}';
          item.icons = [];
          iconFiles.forEach(function(iconFile) {
            if (path.extname(iconFile) === '.svg') {
              var iconName = path.basename(iconFile, '.svg');
              item.icons.push({
                name: iconName,
                path: path.join(inData.iconsPath, iconFile),
                rendered: nunjucksEnv
                  .renderString(renderTpl, { iconName: iconName })
                  .trim()
              });
            }
          });
        });
      }
    };
  },

  /**
   * Custom `@preview` annotation. Expects comma-separated list of names of
   * preview types.
   */
  function preview() {
    return {
      name: 'preview',
      multiple: false,
      parse: function(raw) {
        // expects e.g. 'color-palette; key: sans; sizes: text-sizes;'
        // and returns object {
        //   type: "color-palette", key: "sans", sizes: "text-sizes" }
        var options = {};
        var key, value;
        raw.split(';').forEach(function(option) {
          var parts = option.split(':');
          key = parts[0].trim();
          value = parts[1] ? parts[1].trim() : null;
          if (options.type === undefined) {
            options.type = key;
          } else if (key) {
            options[key] = value;
          }
        });
        return options;
      }
    };
  },

  /**
   * Custom `@example` annotation.
   *
   * Augments the normal sassdoc @example annotation.
   * If example language is 'njk' (nunjucks), render the example
   * and put the result in the `rendered` property of the parsed example.
   */
  function example(env) {
    var baseExampleFn = require('sassdoc/dist/annotation/annotations/example');
    if (typeof baseExampleFn !== 'function') {
      baseExampleFn = baseExampleFn.default;
    }
    var baseExample = baseExampleFn();
    return {
      name: 'example',
      parse: baseExample.parse,
      resolve: function(data) {
        var nunjucksEnv;
        var warned = false;
        data.forEach(function(item) {
          if (!item.example) {
            return;
          }
          item.example.forEach(function(exampleItem) {
            if (exampleItem.type === 'html') {
              exampleItem.rendered = exampleItem.code;
            } else if (exampleItem.type === 'njk') {
              if (!nunjucksEnv) {
                nunjucksEnv = getNunjucksEnv('Nunjucks @example', env, warned);
              }
              if (!nunjucksEnv) {
                warned = true;
                return;
              }
              exampleItem.rendered = nunjucksEnv
                .renderString(exampleItem.code)
                .trim();
            } else if (exampleItem.type === 'scss') {
              var sassData = exampleItem.code;
              exampleItem.rendered = undefined;
              try {
                if (env.herman.sass.includes) {
                  var arr = env.herman.sass.includes;
                  for (var i = arr.length - 1; i >= 0; i = i - 1) {
                    sassData = "@import '" + arr[i] + "';\n" + sassData;
                  }
                }
                var rendered = sass.renderSync({
                  data: sassData,
                  importer: function(url) {
                    if (url[0] === '~') {
                      url = path.resolve('node_modules', url.substr(1));
                    }
                    return { file: url };
                  },
                  includePaths: env.herman.sass.includepaths || [],
                  outputStyle: 'expanded'
                });
                var encoded = rendered.css.toString('utf-8');
                exampleItem.rendered = encoded;
              } catch (err) {
                env.logger.warn(
                  'Error compiling @example scss: \n' +
                    err.message +
                    '\n' +
                    sassData
                );
              }
            }
            renderIframe(env, exampleItem);
          });
        });
      }
    };
  }
];
