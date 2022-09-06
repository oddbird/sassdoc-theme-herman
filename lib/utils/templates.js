'use strict';

const path = require('path');

const nunjucks = require('nunjucks');
const tinycolor = require('tinycolor2');

const baseDir = path.resolve(__dirname, '../../templates');
const colors_iFrameTpl = path.join(baseDir, 'colors', 'base.njk');
const docTpl = path.join(baseDir, 'doc.njk');
const example_iFrameTpl = path.join(baseDir, 'example', 'base.njk');
const fontFaceTpl = path.join(baseDir, 'fonts', 'font_face.njk');
const fonts_iFrameTpl = path.join(baseDir, 'fonts', 'base.njk');
const groupTpl = path.join(baseDir, 'group.njk');
const icons_iFrameTpl = path.join(baseDir, 'icons', 'base.njk');
const icons_tpl = path.join(baseDir, '_icon_template.lodash');
const indexTpl = path.join(baseDir, 'index.njk');
const ratios_iFrameTpl = path.join(baseDir, 'ratios', 'base.njk');
const searchTpl = path.join(baseDir, 'search.njk');
const sizes_iFrameTpl = path.join(baseDir, 'sizes', 'base.njk');

const templates = {
  baseDir,
  colors_iFrame: colors_iFrameTpl,
  index: indexTpl,
  search: searchTpl,
  group: groupTpl,
  extraDoc: docTpl,
  example_iFrame: example_iFrameTpl,
  fonts_iFrame: fonts_iFrameTpl,
  icons_iFrame: icons_iFrameTpl,
  fontFace: fontFaceTpl,
  icons_tpl,
  ratios_iFrame: ratios_iFrameTpl,
  sizes_iFrame: sizes_iFrameTpl,
};

const makeNunjucksColors = (ctx) => (input) => {
  const color = tinycolor(input);
  if (!color.isValid()) {
    return null;
  }
  const obj = {};
  const formats = ctx.herman?.displayColors || ['hex', 'rgb', 'hsl'];
  formats.forEach((format) => {
    let fn;
    let fmt = format;
    switch (format) {
      case 'hex':
        fn = 'toHexString';
        break;
      case 'rgb':
        fn = 'toRgbString';
        break;
      case 'rgba':
        fmt = 'rgb';
        fn = 'toRgbString';
        break;
      case 'hsl':
        fn = 'toHslString';
        break;
      case 'hsla':
        fmt = 'hsl';
        fn = 'toHslString';
        break;
    }
    if (fn) {
      obj[fmt] = color[fn]();
    }
  });
  return obj;
};

nunjucks.installJinjaCompat();
let nunjucksEnv;

const getNunjucksEnv = (ctx) => {
  if (!nunjucksEnv) {
    nunjucksEnv = nunjucks.configure(baseDir, { noCache: true });
    nunjucksEnv.addFilter('split', (str, separator) => str.split(separator));
    nunjucksEnv.addFilter('isString', (val) => typeof val === 'string');
    nunjucksEnv.addFilter('startsWith', (str, search) =>
      str.startsWith(search),
    );

    // Accepts a color (in any format) and returns an object with hex, rgba, and
    // hsla strings.
    nunjucksEnv.addFilter('colors', makeNunjucksColors(ctx));
  }
  return nunjucksEnv;
};

module.exports = {
  getNunjucksEnv,
  makeNunjucksColors,
  templates,
};
