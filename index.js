'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sass = require('node-sass');
const stripIndent = require('strip-indent');

const herman = require('./lib/herman');
const parse = require('./lib/parse');
const renderIframe = require('./lib/renderIframe');
const { nunjucksEnv, templates } = require('./lib/templates');

// get nunjucks env lazily so that we only throw an error on missing
// templatepath if annotation was actually used.
const getNunjucksEnv = require('./lib/getNunjucksEnv');

const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);
const renderSass = Promise.promisify(sass.render);

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
        const promises = [];
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
          const promise = readdir(iconsPath)
            .then(iconFiles => {
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
              return renderIframe(env, item, 'icon');
            })
            .catch(err => {
              env.logger.warn(
                `Error reading directory: ${iconsPath}\n${err.message}`
              );
            });
          promises.push(promise);
        });
        return Promise.all(promises);
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
          if (!env.fontsHTML || !env.fontsHTML.includes(obj.html)) {
            env.fontsHTML = `${env.fontsHTML || ''}\n${obj.html}`;
          }
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
        const promises = [];
        data.forEach(item => {
          if (!item.font) {
            return;
          }
          if (item.font.formats && item.font.formats.length) {
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
            let promise = Promise.resolve();
            if (!env.sassjson) {
              const filepath = env.herman.sass.jsonfile;
              promise = readFile(filepath, 'utf-8')
                .then(fileData => {
                  env.sassjson = parse.sassJson(fileData);
                })
                .catch(err => {
                  env.logger.warn(
                    `File not found: ${filepath}\n${err.message}`
                  );
                });
            }
            promise.then(() => {
              const fontData =
                env.sassjson.fonts && env.sassjson.fonts[item.font.key];
              if (!fontData) {
                env.logger.warn(
                  `Sassjson file is missing font "${item.font.key}" data. ` +
                    'Did you forget to `@include herman-add()` for this font?'
                );
                return Promise.reject();
              }
              // For each font variant, return ctx object (for rendering
              // `@font-face` CSS) and src path (for copying into `assets/`).
              const variants = parse.localFont(item.font, fontData);
              const css = [];
              env.localFonts = env.localFonts || [];
              for (const variant of variants) {
                // Render custom `@font-face` CSS
                css.push(nunjucksEnv.render(templates.fontFace, variant.ctx));
                const baseFontPath = path.resolve(env.dir, env.herman.fontpath);
                for (const format of item.font.formats) {
                  if (valid_formats.includes(format)) {
                    // Store src path for local font files to copy in
                    env.localFonts.push(
                      `${baseFontPath}/${variant.src_path}.${format}`
                    );
                  }
                }
              }
              // Concatenate `@font-face` CSS to insert into iframe `<head>`
              item.font.localFontCSS = css.join('\n');
              return renderIframe(env, item, 'font');
            });
            promises.push(promise);
          }
        });
        return Promise.all(promises);
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
    // eslint-disable-next-line global-require
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
        const iFramePromises = [];
        const sassPromises = [];
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
                if (env.herman.sass.includes) {
                  const arr = env.herman.sass.includes;
                  for (let i = arr.length - 1; i >= 0; i = i - 1) {
                    sassData = `@import '${arr[i]}';\n${sassData}`;
                  }
                }
                const promise = renderSass({
                  data: sassData,
                  importer: url => {
                    if (url[0] === '~') {
                      url = path.resolve('node_modules', url.substr(1));
                    }
                    return { file: url };
                  },
                  includePaths: env.herman.sass.includepaths || [],
                  outputStyle: 'expanded',
                })
                  .then(rendered => {
                    const encoded = rendered.css.toString('utf-8');
                    exampleItem.rendered = encoded;
                  })
                  .catch(err => {
                    env.logger.warn(
                      'Error compiling @example scss: \n' +
                        `${err.message}\n${sassData}`
                    );
                  });
                sassPromises.push(promise);
              }
            }
            const iframePromise = Promise.all(sassPromises).then(() =>
              renderIframe(env, exampleItem, 'example')
            );
            iFramePromises.push(iframePromise);
          });
        });
        return Promise.all(iFramePromises);
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
