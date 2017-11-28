'use strict';

const nunjucks = require('nunjucks');
const path = require('path');

const baseDir = path.resolve(__dirname, '../../templates');
const docTpl = path.join(baseDir, 'doc.njk');
const example_iFrameTpl = path.join(baseDir, 'example', 'base.njk');
const fontFaceTpl = path.join(baseDir, 'fonts', 'font_face.njk');
const fonts_iFrameTpl = path.join(baseDir, 'fonts', 'base.njk');
const groupTpl = path.join(baseDir, 'group.njk');
const icons_iFrameTpl = path.join(baseDir, 'icons', 'base.njk');
const icons_tpl = path.join(baseDir, '_icon_template.lodash');
const indexTpl = path.join(baseDir, 'index.njk');
const searchTpl = path.join(baseDir, 'search.njk');

const templates = {
  baseDir,
  index: indexTpl,
  search: searchTpl,
  group: groupTpl,
  extraDoc: docTpl,
  example_iFrame: example_iFrameTpl,
  fonts_iFrame: fonts_iFrameTpl,
  icons_iFrame: icons_iFrameTpl,
  fontFace: fontFaceTpl,
  icons_tpl,
};

nunjucks.installJinjaCompat();
const nunjucksEnv = nunjucks.configure(baseDir, { noCache: true });
nunjucksEnv.addFilter('split', (str, separator) => str.split(separator));
nunjucksEnv.addFilter('isString', val => typeof val === 'string');

module.exports = {
  nunjucksEnv,
  templates,
};
