const path = require('path');
const nunjucks = require('nunjucks');


const base = path.resolve(__dirname, './templates');
const example_iFrameTpl = path.join(base, 'example', 'base.j2');
const icons_iFrameTpl = path.join(base, 'icons', 'base.j2');
const fonts_iFrameTpl = path.join(base, 'fonts', 'base.j2');
const fontFaceTpl = path.join(base, 'fonts', 'font_face.j2');

nunjucks.installJinjaCompat();
const nunjucksEnv = nunjucks.configure(base, { noCache: true });
nunjucksEnv.addFilter('split', (str, separator) => str.split(separator));
nunjucksEnv.addFilter('isString', val => typeof val === 'string');

module.exports = {
  base,
  nunjucksEnv,
  example_iFrameTpl,
  icons_iFrameTpl,
  fonts_iFrameTpl,
  fontFaceTpl,
};
