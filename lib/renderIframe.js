'use strict';

const extend = require('extend');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const parse = require('./parse');
const { nunjucksEnv, templates } = require('./templates');

const readFile = Promise.promisify(fs.readFile);

module.exports = (env, item, type) => {
  let shouldRender = false;
  let includeIcons = false;
  let includeCustomCSS = false;
  let includeSassJSON = false;
  const promises = [];
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
      const promise = readFile(env.herman.minifiedIcons, 'utf-8')
        .then(data => {
          env.iconsSvg = data;
        })
        .catch(err => {
          env.logger.warn(
            `File not found: ${env.herman.minifiedIcons}\n${err.message}`
          );
        });
      promises.push(promise);
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
