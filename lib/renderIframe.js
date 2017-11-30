'use strict';

const extend = require('extend');
const fs = require('fs');
const imagemin = require('gulp-imagemin');
const path = require('path');
const Promise = require('bluebird');
const svg = require('gulp-svg-symbols');
const through = require('through2');
const vfs = require('vinyl-fs');

const parse = require('./utils/parse');
const { nunjucksEnv, templates } = require('./utils/templates');

const readFile = Promise.promisify(fs.readFile);

module.exports = (env, item, type) => {
  let shouldRender = false;
  let includeIcons = false;
  let includeCustomCSS = false;
  let includeCustomHTML = false;
  let includeSassJSON = false;
  const promises = [];
  switch (type) {
    case 'example':
      shouldRender = item.rendered;
      includeCustomHTML = true;
      includeCustomCSS = true;
      break;
    case 'icon':
      shouldRender = item.icons && item.icons.length;
      includeIcons = true;
      break;
    case 'font':
      shouldRender = item.font;
      includeSassJSON = true;
      break;
  }

  if (shouldRender) {
    // if needed, prepare minified icons SVG
    if (includeIcons && item.iconsPath && !env.iconsSvg) {
      const transform = function(file, enc, cb) {
        env.iconsSvg = file.contents.toString(enc);
        return cb(null, file);
      };
      const stream = through.obj(transform);
      const promise = new Promise((resolve, reject) => {
        vfs
          .src(`${item.iconsPath}**/*.svg`)
          .pipe(imagemin([imagemin.svgo()]))
          .pipe(
            svg({
              id: 'icon-%f',
              title: '%f icon',
              templates: [templates.icons_tpl],
            })
          )
          .pipe(stream)
          .on('error', reject)
          .on('finish', resolve);
      });
      promises.push(promise);
    }

    // if needed, prepare custom html file
    if (includeCustomHTML && env.herman.customHTML && !env.customHTML) {
      const promise = readFile(env.herman.customHTML, 'utf-8')
        .then(data => {
          env.customHTML = data;
        })
        .catch(err => {
          env.customHTML = env.herman.customHTML;
          env.logger.log(
            `Error reading "herman.customHTML" file: ${err.code}\n` +
              'Interpreting as a string of markup and inserting directly.'
          );
        });
      promises.push(promise);
    }

    // if needed, prepare custom css file
    if (includeCustomCSS && env.herman.customCSS && !env.customCSS) {
      const srcPath = path.resolve(env.dir, env.herman.customCSS);
      const cssUrl = `assets/custom/${path.basename(env.herman.customCSS)}`;
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
      const promise = readFile(env.herman.sass.jsonfile, 'utf-8')
        .then(data => {
          env.sassjson = parse.sassJson(data);
        })
        .catch(err => {
          env.logger.warn(
            `File not found: ${env.herman.sass.jsonfile}\n${err.message}`
          );
        });
      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      const ctx = extend({}, env, { item });

      let tpl;
      switch (type) {
        case 'example':
          tpl = templates.example_iFrame;
          break;
        case 'icon':
          tpl = templates.icons_iFrame;
          break;
        case 'font':
          tpl = templates.fonts_iFrame;
          break;
      }
      item.iframed = nunjucksEnv.render(tpl, ctx);
    });
  }

  return Promise.resolve();
};
