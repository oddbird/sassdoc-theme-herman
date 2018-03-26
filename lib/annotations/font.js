'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const stripIndent = require('strip-indent');

const parse = require('../utils/parse');
const renderIframe = require('../renderIframe');
const { constants } = require('../utils/fonts');
const { nunjucksEnv, templates } = require('../utils/templates');

const readFile = Promise.promisify(fs.readFile);

/**
 * Custom `@font` annotation.
 * For remotely-hosted fonts, accepts optional font name, followed by optional
 * parenthetical list of variants to display on first line (defaults to all
 * variants), with optional html head as nested block.
 * For locally-hosted fonts, accepts optional font name, followed by optional
 * parenthetical list of variants (defaults to all variants).
 * NOTE: Locally-hosted fonts require global `fontpath` Herman setting.
 */
module.exports = env => {
  // Matches first word and text within `()`, and text within `{}`
  const RE = /([\w-'"]+)?\s*(?:\(([^\]]*)\))?/;
  return {
    name: 'font',
    multiple: false,
    parse: raw => {
      // expects e.g.:
      // body (normal, bold, italic, bold italic)
      //   <link href="..." rel="stylesheet">
      // returns object {
      //   key: 'sans',
      //   variants: ['normal', 'bold', 'italic', 'bold italic'],
      //   html: '<link href="..." rel="stylesheet">'
      // }
      const obj = {
        key: '',
        variants: [],
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
      const match = RE.exec(args.trim());
      if (match[1]) {
        const quoted =
          (match[1].startsWith("'") && match[1].endsWith("'")) ||
          (match[1].startsWith('"') && match[1].endsWith('"'));
        if (quoted) {
          obj.key = match[1].substring(1, match[1].length - 1);
        } else {
          obj.key = match[1];
        }
      }
      if (match[2]) {
        obj.variants = match[2].split(', ');
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
        if (!env.sassjson) {
          if (!(env.herman.sass && env.herman.sass.jsonfile)) {
            env.logger.warn(
              'Must pass in a `sassjson` file if using @font annotation.'
            );
            return;
          }
          // Read sassjson file and parse as JSON
          const filepath = env.herman.sass.jsonfile;
          promise = readFile(filepath, 'utf-8')
            .then(fileData => {
              env.sassjson = parse.sassJson(fileData);
            })
            .catch(err => {
              env.logger.warn(`File not found: ${filepath}\n${err.message}`);
            });
        }
        promise = promise.then(() => {
          const key =
            item.font.key ||
            (item.context && item.context.origName) ||
            (item.context && item.context.name) ||
            item.name;
          item.font.key = key;
          const fontData =
            env.sassjson && env.sassjson.fonts && env.sassjson.fonts[key];
          if (!fontData) {
            env.logger.warn(
              `Sassjson file is missing font "${key}" data. ` +
                'Did you forget to `@include herman-add()` for this font?'
            );
            return Promise.reject();
          }
          // For each font variant, get ctx object (for rendering
          // `@font-face` CSS) and src path (for copying into `assets/`).
          const variants = parse.font(item.font, fontData);
          item.font.parsedVariants = variants;
          const css = [];
          env.localFonts = env.localFonts || [];
          const localFonts = [];
          for (const variant of variants) {
            if (variant.isLocal) {
              // Local or embedded font...
              for (const format of Object.keys(variant.formats)) {
                const thisFormat = variant.formats[format];
                // For each local (not embedded `data:`) filepath, store src
                // (for copying file into `assets/`).
                if (thisFormat.src !== thisFormat.dest) {
                  localFonts.push(variant.formats[format].src);
                }
              }
              // Create sorted list of formats
              variant.orderedFormats = [];
              for (const ext of constants.format) {
                if (variant.formats[ext]) {
                  variant.orderedFormats.push(ext);
                }
              }
              if (localFonts.length) {
                if (!(env.herman && env.herman.fontpath)) {
                  env.logger.warn(
                    'Must pass in a `fontpath` if using @font ' +
                      'annotation with local fonts.'
                  );
                  return Promise.reject();
                }
                const baseFontPath = path.resolve(env.dir, env.herman.fontpath);
                for (const src of localFonts) {
                  // Store src path for local font files to copy in
                  env.localFonts.push(`${baseFontPath}${path.sep}${src}`);
                }
              }
              // Render custom `@font-face` CSS
              css.push(nunjucksEnv.render(templates.fontFace, variant));
            }
          }
          if (css.length) {
            // Concatenate `@font-face` CSS to insert into iframe `<head>`
            item.font.localFontCSS = css.join('\n');
          }
          return Promise.resolve();
        });
        promise = promise.then(() => renderIframe(env, item, 'font'));
        promises.push(promise);
      });
      return Promise.all(promises);
    },
  };
};
