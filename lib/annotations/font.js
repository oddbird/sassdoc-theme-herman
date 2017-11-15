'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const stripIndent = require('strip-indent');

const parse = require('../utils/parse');
const renderIframe = require('../renderIframe');
const { nunjucksEnv, templates } = require('../utils/templates');

const readFile = Promise.promisify(fs.readFile);

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
module.exports = env => {
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
        let promise = Promise.resolve();
        if (item.font.formats && item.font.formats.length) {
          // Local font
          if (!(env.herman && env.herman.fontpath)) {
            env.logger.warn(
              'Must pass in a `fontpath` if using @font ' +
                'annotation with local fonts.'
            );
            return;
          }
          if (!env.sassjson) {
            if (!(env.herman.sass && env.herman.sass.jsonfile)) {
              env.logger.warn(
                'Must pass in a `sassjson` file if using @font ' +
                  'annotation with local fonts.'
              );
              return;
            }
            const filepath = env.herman.sass.jsonfile;
            promise = readFile(filepath, 'utf-8')
              .then(fileData => {
                env.sassjson = parse.sassJson(fileData);
              })
              .catch(err => {
                env.logger.warn(`File not found: ${filepath}\n${err.message}`);
                env.sassjson = {};
              });
          }
          promise = promise.then(() => {
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
            return Promise.resolve();
          });
        }
        promise = promise.then(() => renderIframe(env, item, 'font'));
        promises.push(promise);
      });
      return Promise.all(promises);
    },
  };
};
