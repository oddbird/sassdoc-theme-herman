/* eslint-disable no-sync, global-require */

'use strict';

const extend = require('extend');
const fs = require('fs');
const nunjucks = require('nunjucks');
const path = require('path');
const Promise = require('bluebird');
const sass = require('node-sass');
const sassdoc = require('sassdoc');
const stripIndent = require('strip-indent');
const tinycolor = require('tinycolor2');
const yaml = require('js-yaml');

const copy = require('./lib/assets.js');
const parse = require('./lib/parse.js');
const render = require('./lib/render.js');

const base = path.resolve(__dirname, './templates');
const example_iFrameTpl = path.join(base, 'example', 'base.j2');
const icons_iFrameTpl = path.join(base, 'icons', 'base.j2');
const fonts_iFrameTpl = path.join(base, 'fonts', 'base.j2');
const fontFaceTpl = path.join(base, 'fonts', 'font_face.j2');

nunjucks.installJinjaCompat();
const nunjucksEnv = nunjucks.configure(base, { noCache: true });
nunjucksEnv.addFilter('split', (str, separator) => str.split(separator));
nunjucksEnv.addFilter('isString', val => typeof val === 'string');

/**
 * SassDoc extras (providing Markdown and other filters, and different way to
 * index SassDoc data).
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
const extras = require('sassdoc-extras');

const byGroup = data => {
  const sorted = {};
  data.forEach(item => {
    const group = item.group[0];
    if (!(group in sorted)) {
      sorted[group] = [];
    }
    sorted[group].push(item);
  });
  return sorted;
};

const prepareContext = ctx => {
  const def = {
    display: {
      access: ['public', 'private'],
      alias: false,
      watermark: true,
    },
    groups: {
      undefined: 'General',
    },
    sort: ['group', 'file', 'line', 'access'],
    herman: { sass: {} },
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
  if (ctx.herman.sass && ctx.herman.sass.jsonfile && !ctx.sassjson) {
    ctx.sassjson = parse.sassJson(fs.readFileSync(ctx.herman.sass.jsonfile));
  }

  /**
   * Remove the bogus context from any standalone sassdoc comments.
   * (We detect these if the context starts more than one line after the
   * sassdoc comment ends.)
   */
  ctx.data.forEach(item => {
    if (!item.context || !item.context.line) {
      return;
    }
    if (item.context.type === 'unknown') {
      item.context.type = 'prose';
      item.context.line.end = item.context.line.start;
    }
    // Consider it to be prose if it's separated from the next Sass block
    // by any blank lines.
    const name = item.context.origName || item.context.name || '';
    const lineCount = name.split('\n').length;
    if (!name || item.context.line.start > item.commentRange.end + lineCount) {
      item.context = {
        type: 'prose',
        line: item.commentRange,
      };
    }
  });

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
  ctx.groupOrder = Object.keys(ctx.groups);

  return ctx;
};

const parseSubprojects = ctx => {
  const promises = [];
  if (ctx.herman.subprojects) {
    ctx.subprojects = {};
    ctx.herman.subprojects.forEach(name => {
      const prjPath = `./node_modules/${name}/`;
      const configFile = `${prjPath}.sassdocrc`;
      const packageFile = `${prjPath}package.json`;
      let config = {};
      let packageJSON = {};
      try {
        // Load .sassdocrc configuration from subproject directory
        config = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
      } catch (err) {
        ctx.logger.warn(
          `Invalid or no .sassdocrc found for subproject: ${name}`
        );
      }
      try {
        // Load package.json data from subproject directory
        packageJSON = yaml.safeLoad(fs.readFileSync(packageFile, 'utf-8'));
      } catch (err) {
        ctx.logger.warn(
          `Invalid or no package.json found for subproject: ${name}`
        );
      }
      if (!config.description && !config.descriptionPath) {
        // Set default descriptionPath for subproject
        config.descriptionPath = `${prjPath}README.md`;
      }
      let src;
      if (config.src) {
        // Set subproject src files based on .sassdocrc `src` option
        src = path.isAbsolute(config.src) ? config.src : prjPath + config.src;
      } else {
        // Fall back to all subproject `.scss` files
        src = `${prjPath}**/*.scss`;
      }
      // Remove unused/unnecessary config options
      config.src = undefined;
      config.theme = undefined;
      config.dest = undefined;
      const prjCtx = extend({}, config);
      const promise = sassdoc.parse(src, prjCtx).then(data => {
        prjCtx.subpackage = packageJSON;
        prjCtx.package = ctx.package;
        prjCtx.basePath = '../';
        prjCtx.activeProject = name;
        prjCtx.data = data;
        prjCtx.subprojects = ctx.subprojects;
        prjCtx.topGroups = ctx.groups;
        prjCtx.topGroupOrder = ctx.groupOrder;
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
const renderHerman = (dest, ctx) => {
  const indexTemplate = path.join(base, 'index.j2');
  const indexDest = path.join(dest, 'index.html');
  const groupTemplate = path.join(base, 'group.j2');
  const assets = path.resolve(__dirname, './dist');

  // Accepts a color (in any format) and returns an object with hex, rgba, and
  // hsla strings.
  nunjucksEnv.addFilter('colors', input => {
    const color = tinycolor(input);
    if (!color.isValid()) {
      return null;
    }
    const obj = {};
    const formats = ctx.herman.displayColors || ['hex', 'rgb', 'hsl'];
    formats.forEach(format => {
      let fn;
      switch (format) {
        case 'hex':
          fn = 'toHexString';
          break;
        case 'rgb':
          fn = 'toRgbString';
          break;
        case 'rgba':
          format = 'rgb';
          fn = 'toRgbString';
          break;
        case 'hsl':
          fn = 'toHslString';
          break;
        case 'hsla':
          format = 'hsl';
          fn = 'toHslString';
          break;
      }
      if (fn) {
        obj[format] = color[fn]();
      }
    });
    return obj;
  });

  dest = path.resolve(dest);

  // set (external) base path for links
  ctx.basePath = '';
  ctx.activeProject = null;
  ctx.topGroups = ctx.groups;
  ctx.topGroupOrder = ctx.groupOrder;
  ctx.topByGroup = ctx.byGroup;

  // check if we need to copy a favicon file or use the default
  let copyShortcutIcon = false;
  if (!ctx.shortcutIcon) {
    ctx.shortcutIcon = { type: 'internal', url: 'assets/img/favicon.ico' };
  } else if (ctx.shortcutIcon.type === 'internal') {
    ctx.shortcutIcon.url = `assets/img/${ctx.shortcutIcon.url}`;
    copyShortcutIcon = true;
  }

  // render the index template and copy the static assets.
  const promises = [
    render(nunjucksEnv, indexTemplate, indexDest, ctx),
    copy(path.join(assets, '/**/*.{css,js,ico,map}'), path.join(dest, 'assets'))
      .then(() => {
        if (copyShortcutIcon) {
          return copy(ctx.shortcutIcon.path, path.resolve(dest, 'assets/img/'));
        }
        return Promise.resolve();
      })
      .then(() => {
        if (ctx.customCSS) {
          return copy(
            ctx.customCSS.path,
            path.resolve(dest, 'assets/css/custom')
          );
        }
        return Promise.resolve();
      }),
  ];

  if (ctx.localFonts && ctx.localFonts.length) {
    for (const localFont of ctx.localFonts) {
      promises.push(copy(localFont, path.resolve(dest, 'assets/fonts/')));
    }
  }

  const getRenderCtx = (context, groupName) =>
    extend({}, context, {
      pageTitle: context.groups[groupName],
      activeGroup: groupName,
      items: context.byGroup[groupName],
    });

  // Render a page for each group, too.
  Object.getOwnPropertyNames(ctx.byGroup).forEach(groupName => {
    const groupDest = path.join(dest, `${groupName}.html`);
    const groupCtx = getRenderCtx(ctx, groupName);
    promises.push(render(nunjucksEnv, groupTemplate, groupDest, groupCtx));
  });

  if (ctx.subprojects) {
    // Render pages for subprojects.
    Object.getOwnPropertyNames(ctx.subprojects).forEach(prjName => {
      const prjCtx = ctx.subprojects[prjName];
      const prjDest = path.join(dest, prjName);
      const pageDest = path.join(prjDest, 'index.html');
      promises.push(render(nunjucksEnv, indexTemplate, pageDest, prjCtx));

      Object.getOwnPropertyNames(prjCtx.byGroup).forEach(groupName => {
        const groupDest = path.join(prjDest, `${groupName}.html`);
        const groupCtx = getRenderCtx(prjCtx, groupName);
        promises.push(render(nunjucksEnv, groupTemplate, groupDest, groupCtx));
      });
    });
  }

  return Promise.all(promises);
};

// get nunjucks env lazily so that we only throw an error on missing
// templatepath if annotation was actually used.
const getNunjucksEnv = (name, env, warned) => {
  if (env.herman && env.herman.nunjucksEnv) {
    return env.herman.nunjucksEnv;
  }
  if (!env.herman || !env.herman.templatepath) {
    if (!warned) {
      env.logger.warn(`Must pass in a templatepath if using ${name}.`);
    }
    return null;
  }
  return nunjucks.configure(env.herman.templatepath);
};

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
const herman = (dest, ctx) => {
  ctx = prepareContext(ctx);

  return parseSubprojects(ctx).then(() => renderHerman(dest, ctx));
};

const renderIframe = (env, item, type) => {
  let shouldRender = false;
  let includeIcons = false;
  let includeCustomCSS = false;
  let includeSassJSON = false;
  switch (type) {
    case 'example':
      shouldRender = item.rendered;
      includeIcons = true;
      includeCustomCSS = true;
      break;
    case 'icon':
      shouldRender = item.icons && item.icons.length;
      includeIcons = true;
      break;
    case 'font':
      shouldRender = item.font && item.font.key;
      includeSassJSON = true;
      break;
  }

  if (shouldRender) {
    // if needed, read in minified icons SVG
    if (includeIcons && env.herman.minifiedIcons && !env.iconsSvg) {
      env.iconsSvg = fs.readFileSync(env.herman.minifiedIcons);
    }

    // if needed, prepare custom css file
    if (includeCustomCSS && env.herman.customCSS && !env.customCSS) {
      const srcPath = path.resolve(env.dir, env.herman.customCSS);
      const cssUrl = `assets/css/custom/${path.basename(env.herman.customCSS)}`;
      env.customCSS = {
        path: srcPath,
        url: cssUrl,
      };
    }

    if (
      includeSassJSON &&
      env.herman &&
      env.herman.sass &&
      env.herman.sass.jsonfile &&
      !env.sassjson
    ) {
      env.sassjson = parse.sassJson(fs.readFileSync(env.herman.sass.jsonfile));
    }

    const ctx = extend({}, env, { item });

    let tpl;
    switch (type) {
      case 'example':
        tpl = example_iFrameTpl;
        break;
      case 'icon':
        tpl = icons_iFrameTpl;
        break;
      case 'font':
        tpl = fonts_iFrameTpl;
        break;
    }

    item.iframed = nunjucksEnv.render(tpl, ctx);
  }
};

herman.annotations = [
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
      parse: raw => {
        // expects e.g. 'forms.macros.js.j2:label'
        // returns object {
        //   file: 'forms.macros.js.j2',
        //   name: 'label'
        // }
        const bits = raw.split(':');
        return { file: bits[0], name: bits[1] };
      },
      resolve: data => {
        let customNjkEnv;
        let warned = false;
        data.forEach(item => {
          if (!item.macro) {
            return;
          }
          if (!customNjkEnv) {
            customNjkEnv = getNunjucksEnv('@macro', env, warned);
          }
          if (!customNjkEnv) {
            warned = true;
            return;
          }
          const prefix = `{% import "${item.macro.file}" as it %}`;
          const docTpl = `${prefix}{{ it.${item.macro.name}_doc }}`;
          item.macro.doc = customNjkEnv.renderString(docTpl);
        });
      },
    };
  },

  /**
   * Custom `@icons` annotation. Expects `iconspath macrofile:macroname`.
   *
   * First argument should be the relative path to a directory of icon svg
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
      parse: raw => {
        // expects e.g. 'icons/ utility.macros.j2:icon'
        // returns {
        //   iconsPath: 'icons/',
        //   macroFile: 'utility.macros.j2',
        //   macroName: 'icon'
        // }
        const bits = raw.split(' ');
        const macrobits = bits[1].split(':');
        return {
          iconsPath: bits[0],
          macroFile: macrobits[0],
          macroName: macrobits[1],
        };
      },
      resolve: data => {
        let customNjkEnv;
        let warned = false;
        data.forEach(item => {
          if (!item.icons) {
            return;
          }
          if (!customNjkEnv) {
            customNjkEnv = getNunjucksEnv('@icons', env, warned);
          }
          if (!customNjkEnv) {
            warned = true;
            return;
          }
          const inData = item.icons;
          const iconsPath = inData.iconsPath;
          const iconFiles = fs.readdirSync(iconsPath);
          const renderTpl =
            `{% import "${inData.macroFile}" as it %}` +
            `{{ it.${inData.macroName}(iconName) }}`;
          item.icons = [];
          iconFiles.forEach(iconFile => {
            if (path.extname(iconFile) === '.svg') {
              const iconName = path.basename(iconFile, '.svg');
              const icon = {
                name: iconName,
                path: path.join(inData.iconsPath, iconFile),
                rendered: customNjkEnv
                  .renderString(renderTpl, { iconName })
                  .trim(),
              };
              item.icons.push(icon);
            }
          });
          renderIframe(env, item, 'icon');
        });
      },
    };
  },

  /**
   * Custom `@preview` annotation. Expects preview type followed by
   * semicolon-separated list of `key: value` arguments.
   */
  function preview() {
    return {
      name: 'preview',
      multiple: false,
      parse: raw => {
        // expects e.g. 'color-palette; key: sans; sizes: text-sizes;'
        // returns object {
        //   type: "color-palette",
        //   key: "sans",
        //   sizes: "text-sizes"
        // }
        const options = {};
        let key, value;
        raw.split(';').forEach(option => {
          const parts = option.split(':');
          key = parts[0].trim();
          value = parts[1] ? parts[1].trim() : null;
          if (options.type === undefined) {
            options.type = key;
          } else if (key) {
            options[key] = value;
          }
        });
        return options;
      },
    };
  },

  /**
   * Custom `@font` annotation.
   * For remotely-hosted fonts, expects font name followed by parenthetical list
   * of variants to display on first line, with optional html head as nested
   * block.
   * For locally-hosted fonts, expects font name and bracketed list of formats
   * on first line, optionally followed by parenthetical list of variants
   * (defaults to all variants).
   * NOTE: Locally-hosted fonts require global `fontpath` Herman setting.
   */
  function font(env) {
    const valid_formats = ['ttf', 'otf', 'woff', 'woff2', 'svg', 'svgz', 'eot'];
    // Matches first occurence of text within `''` or `""`
    const keyRE = /(["'])(?:(?=(\\?))\2.)*?\1/;
    // Matches text within `()`
    const variantsRE = /\(([^)]*)\)/;
    // Matches text within `{}`
    const formatsRE = /{([^}]*)}/;
    return {
      name: 'font',
      multiple: false,
      parse: raw => {
        // expects e.g.:
        // 'body' (regular, bold, italic, bold italic)
        //   <link href="..." rel="stylesheet">
        // returns object {
        //   key: 'sans',
        //   variants: ['regular', 'bold', 'italic', 'bold italic'],
        //   formats: [],
        //   html: '<link href="..." rel="stylesheet">'
        // }
        const obj = {
          key: '',
          variants: [],
          formats: [],
          html: '',
        };
        const linebreak = raw.indexOf('\n');
        let args = raw;
        if (linebreak > -1) {
          // Multiline annotation; separate first-line args from following HTML
          args = raw.substr(0, linebreak);
          const html = raw.substr(linebreak + 1);
          obj.html = stripIndent(html.replace(/^\n|\n$/g, ''));
          // Concatenate all font HTML to include in `@example` annotations
          env.fontsHTML = `${env.fontsHTML || ''}\n${obj.html}`;
        }
        const keyBits = args.match(keyRE);
        if (!keyBits) {
          return undefined;
        }
        const key = keyBits[0];
        obj.key = key.substring(1, key.length - 1).trim();
        // Strip `key` before parsing variants and formats
        args = args.substr(key.length);
        const variantsBits = args.match(variantsRE);
        if (variantsBits) {
          obj.variants = variantsBits[1].split(', ');
        }
        const formatsBits = args.match(formatsRE);
        if (formatsBits) {
          obj.formats = formatsBits[1].split(', ');
        }
        return obj;
      },
      resolve: data => {
        data.forEach(item => {
          if (!item.font) {
            return;
          }
          if (item.font.formats.length) {
            // Local font
            if (!(env.herman && env.herman.fontpath)) {
              env.logger.warn(
                'Must pass in a `fontpath` if using @font ' +
                  'annotation with local fonts.'
              );
              return;
            }
            if (!(env.herman.sass && env.herman.sass.jsonfile)) {
              env.logger.warn(
                'Must pass in a `sassjson` file if using @font ' +
                  'annotation with local fonts.'
              );
              return;
            }
            if (!env.sassjson) {
              env.sassjson = parse.sassJson(
                fs.readFileSync(env.herman.sass.jsonfile)
              );
            }
            const fontData =
              env.sassjson.fonts && env.sassjson.fonts[item.font.key];
            if (!fontData) {
              env.logger.warn(
                `Sassjson file is missing font "${item.font.key}" data. ` +
                  'Did you forget to `@include herman-add()` for this font?'
              );
              return;
            }
            const variants = parse.localFont(item.font, fontData);
            const css = [];
            env.localFonts = env.localFonts || [];
            for (const variant of variants) {
              // Render custom `@font-face` CSS
              css.push(nunjucksEnv.render(fontFaceTpl, variant.ctx));
              const fontpath = path.resolve(env.dir, env.herman.fontpath);
              for (const format of item.font.formats) {
                if (valid_formats.includes(format)) {
                  // Store src path for local font files to copy in
                  env.localFonts.push(
                    `${fontpath}/**/${variant.src}.${format}`
                  );
                }
              }
            }
            // Concatenate `@font-face` CSS to insert into iframe `<head>`
            item.font.localFontCSS = css.join('\n');
          }
          renderIframe(env, item, 'font');
        });
      },
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
    let baseExampleFn = require('sassdoc/dist/annotation/annotations/example');
    if (typeof baseExampleFn !== 'function') {
      baseExampleFn = baseExampleFn.default;
    }
    const baseExample = baseExampleFn();
    return {
      name: 'example',
      parse: baseExample.parse,
      resolve: data => {
        let customNjkEnv;
        let warned = false;
        data.forEach(item => {
          if (!item.example) {
            return;
          }
          item.example.forEach(exampleItem => {
            if (exampleItem.type === 'html') {
              exampleItem.rendered = exampleItem.code;
            } else if (exampleItem.type === 'njk') {
              if (!customNjkEnv) {
                customNjkEnv = getNunjucksEnv('Nunjucks @example', env, warned);
              }
              if (!customNjkEnv) {
                warned = true;
                return;
              }
              exampleItem.rendered = customNjkEnv
                .renderString(exampleItem.code)
                .trim();
            } else if (exampleItem.type === 'scss') {
              let sassData = exampleItem.code;
              exampleItem.rendered = undefined;
              if (env.herman && env.herman.sass) {
                try {
                  if (env.herman.sass.includes) {
                    const arr = env.herman.sass.includes;
                    for (let i = arr.length - 1; i >= 0; i = i - 1) {
                      sassData = `@import '${arr[i]}';\n${sassData}`;
                    }
                  }
                  const rendered = sass.renderSync({
                    data: sassData,
                    importer: url => {
                      if (url[0] === '~') {
                        url = path.resolve('node_modules', url.substr(1));
                      }
                      return { file: url };
                    },
                    includePaths: env.herman.sass.includepaths || [],
                    outputStyle: 'expanded',
                  });
                  const encoded = rendered.css.toString('utf-8');
                  exampleItem.rendered = encoded;
                } catch (err) {
                  env.logger.warn(
                    'Error compiling @example scss: \n' +
                      `${err.message}\n${sassData}`
                  );
                }
              }
            }
            renderIframe(env, exampleItem, 'example');
          });
        });
      },
    };
  },

  /**
   * Override `@name` annotation to preserve the original name
   */
  function name() {
    return {
      name: 'name',
      multiple: false,
      parse: text => text.trim(),
      // Abuse the autofill feature to rewrite the `item.context`
      autofill: item => {
        if (item.name) {
          item.context.origName = item.context.name;
          item.context.name = item.name;
          // Cleanup
          delete item.name;
        }
      },
    };
  },
];

// make sure sassdoc will preserve comments not attached to Sass
herman.includeUnknownContexts = true;

module.exports = herman;
