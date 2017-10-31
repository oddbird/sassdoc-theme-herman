'use strict';

const extend = require('extend');
const fs = require('fs');
const path = require('path');

const parse = require('./parse.js');

const {
  nunjucksEnv,
  example_iFrameTpl,
  icons_iFrameTpl,
  fonts_iFrameTpl,
} = require('../constants');

module.exports = (env, item, type) => {
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
