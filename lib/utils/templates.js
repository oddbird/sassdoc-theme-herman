'use strict';

const nunjucks = require('nunjucks');
const path = require('path');

const baseDir = path.resolve(__dirname, '../../templates');
const docTpl = path.join(baseDir, 'doc.j2');
const example_iFrameTpl = path.join(baseDir, 'example', 'base.j2');
const fontFaceTpl = path.join(baseDir, 'fonts', 'font_face.j2');
const fonts_iFrameTpl = path.join(baseDir, 'fonts', 'base.j2');
const groupTpl = path.join(baseDir, 'group.j2');
const icons_iFrameTpl = path.join(baseDir, 'icons', 'base.j2');
const icons_tpl = path.join(baseDir, '_icon_template.lodash');
const indexTpl = path.join(baseDir, 'index.j2');
const searchTpl = path.join(baseDir, 'search.j2');

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
