'use strict';

const path = require('path');

const opts = {
  weight: new Set([
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    'bold',
  ]),
  style: new Set(['italic', 'oblique']),
  other: new Set(['normal', 'regular']),
};

module.exports = {
  sassJson: contents => {
    // Parse the contents of a file containing SassJSON output and return the
    // first SassJSON line found as a JS object.
    const startMarker = '/*! json-encode:';
    const endMarker = '*/';
    const start = contents.indexOf(startMarker);
    const end = contents.indexOf(endMarker, start);
    const jsondata = contents.slice(start + startMarker.length, end);
    return JSON.parse(jsondata);
  },
  localFont: (font, data) => {
    // Parse a local font object (key, variants, formats) and return a list of
    // parsed font ctx (family, dest_path, formats, svgid, style, weight) and
    // src_path for each variant.
    const resp = [];
    const family = data.name || font.key;
    const svgid = data.svgid || family;
    const variants =
      font.variants && font.variants.length ? font.variants : Object.keys(data);
    for (const variant of variants) {
      const splitVariant = variant.split(' ');
      const isValid =
        data[variant] &&
        font.formats.length &&
        (opts.weight.has(splitVariant[0]) ||
          opts.style.has(splitVariant[0]) ||
          opts.other.has(splitVariant[0]));
      if (isValid) {
        const dest_path = `assets/fonts/${data[variant]}`;
        let weight = 'normal';
        let style = 'normal';
        for (const variantBit of splitVariant) {
          if (opts.weight.has(variantBit)) {
            weight = variantBit;
          }
          if (opts.style.has(variantBit)) {
            style = variantBit;
          }
        }
        const ctx = {
          family,
          dest_path,
          formats: font.formats,
          svgid,
          style,
          weight,
        };
        resp.push({
          ctx,
          src_path: data[variant],
        });
      }
    }
    return resp;
  },
  customCSS: (file, enc, env) => {
    env.customCSSFiles = env.customCSSFiles || [];
    const src_dir = file.path.substring(0, file.path.lastIndexOf('/'));
    let css = file.contents.toString(enc);
    const regex = /url\(([^)]*)\)/g;
    const matches = [];
    let nextMatch = regex.exec(css);
    while (nextMatch !== null) {
      matches.unshift({
        text: nextMatch[0],
        index: nextMatch.index,
      });
      nextMatch = regex.exec(css);
    }
    for (const match of matches) {
      const src_path = match.text.substring(5, match.text.length - 2);
      const index = match.index + 5;
      if (!(src_path.startsWith('http') || src_path.startsWith('//'))) {
        const abs_path = path.resolve(src_dir, src_path);
        const rel_path = path.relative(env.dir, abs_path);
        const dest_path = `../../custom/${rel_path}`;
        const pre = css.substr(0, index);
        const post = css.substr(index + src_path.length);
        css = `${pre}${dest_path}${post}`;
        env.customCSSFiles.push(abs_path);
      }
    }
    file.contents = Buffer.from(css);
  },
};
