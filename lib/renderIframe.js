'use strict';

const fs = require('fs');
const path = require('path');

const Promise = require('bluebird');
const extend = require('extend');

const getCustomProps = require('./utils/getCustomProps');
const parse = require('./utils/parse');
const generateSprites = require('./utils/sprites');
const { getNunjucksEnv, templates } = require('./utils/templates');

const readFile = Promise.promisify(fs.readFile);

module.exports = (env, item, type) => {
  let shouldRender = false;
  let includeIcons = false;
  let includeCustomCSS = false;
  let includeCustomCSSProps = false;
  let includeCustomHTML = false;
  let includeSassJSON = false;
  const promises = [];
  switch (type) {
    case 'colors':
      shouldRender = item.colors;
      includeSassJSON = true;
      includeCustomCSSProps = true;
      break;
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
      includeCustomCSSProps = true;
      break;
    case 'sizes':
      shouldRender = item.sizes;
      includeSassJSON = true;
      includeCustomCSSProps = true;
      break;
    case 'ratios':
      shouldRender = item.ratios;
      includeSassJSON = true;
      includeCustomCSSProps = true;
      break;
  }

  if (shouldRender) {
    // if needed, prepare minified icons SVG
    if (includeIcons && item.iconsPath && !env.iconsSvg) {
      const promise = generateSprites(item.iconsPath).then((result) => {
        env.iconsSvg = result;
        return result;
      });
      promises.push(promise);
    }

    // if needed, prepare custom html file
    if (
      includeCustomHTML &&
      env.herman &&
      env.herman.customHTML &&
      !env.customHTML
    ) {
      const promise = readFile(env.herman.customHTML, 'utf-8')
        .then((data) => {
          env.customHTML = data;
        })
        .catch((err) => {
          env.customHTML = env.herman.customHTML;
          env.logger.log(
            `Error reading "herman.customHTML" file: ${err.code}\n` +
              'Interpreting as a string of markup and inserting directly.',
          );
        });
      promises.push(promise);
    }

    // if needed, prepare custom css file
    if (
      includeCustomCSS &&
      env.herman &&
      env.herman.customCSS &&
      !env.customCSS
    ) {
      const srcPath = path.resolve(env.dir, env.herman.customCSS);
      const cssUrl = `assets/custom/${path.basename(env.herman.customCSS)}`;
      env.customCSS = {
        path: srcPath,
        url: cssUrl,
      };
    }

    // if needed, prepare custom css properties file
    if (
      includeCustomCSSProps &&
      env.herman &&
      env.herman.customCSS &&
      !env.customCSSProps
    ) {
      const promise = readFile(env.herman.customCSS, 'utf-8')
        .then((data) => {
          // console.log(data);
          const css = getCustomProps(data);
          env.customCSSProps = css;
        })
        .catch((err) => {
          env.customCSSProps = '[data-herman-preview="colors"] {}';
          env.logger.log(
            `Error reading "herman.customCSS" file: ${err.code}\n`,
          );
        });
      promises.push(promise);
    }

    if (
      includeSassJSON &&
      env.herman &&
      env.herman.sass &&
      env.herman.sass.jsonFile &&
      !env.sassjson
    ) {
      const promise = readFile(env.herman.sass.jsonFile, 'utf-8')
        .then((data) => {
          env.sassjson = parse.sassJson(data);
        })
        .catch((err) => {
          env.logger.warn(
            `Error reading file: ${env.herman.sass.jsonFile}\n${err.message}`,
          );
        });
      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      const nunjucksEnv = getNunjucksEnv(env);
      const ctx = extend({}, env, { item });

      let tpl;
      switch (type) {
        case 'colors':
          tpl = templates.colors_iFrame;
          break;
        case 'example':
          tpl = templates.example_iFrame;
          break;
        case 'icon':
          tpl = templates.icons_iFrame;
          break;
        case 'font':
          tpl = templates.fonts_iFrame;
          break;
        case 'sizes':
          tpl = templates.sizes_iFrame;
          break;
        case 'ratios':
          tpl = templates.ratios_iFrame;
          break;
      }
      if (type === 'ratios') {
        /* istanbul ignore else */
        if (
          env.sassjson &&
          env.sassjson.ratios &&
          item.ratios &&
          item.ratios.key
        ) {
          /* istanbul ignore next */
          const data = env.sassjson.ratios[item.ratios.key] || {};
          item.iframed = {};
          for (const key of Object.keys(data)) {
            item.iframed[key] = nunjucksEnv.render(
              tpl,
              extend({}, ctx, { ratio: data[key] }),
            );
          }
        }
      } else {
        item.iframed = nunjucksEnv.render(tpl, ctx);
      }
    });
  }

  return Promise.resolve();
};
