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
    'bolder',
    'lighter',
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
    // Parse the contents of a file containing CSS output. For any occurences of
    // `url(...)` with relative paths, store the paths (for later copying) and
    // replace them with the eventual destination paths.
    env.customCSSFiles = env.customCSSFiles || [];
    const src_dir = path.parse(file.path).dir;
    let css = file.contents.toString(enc);
    const regex = /url\((["']?)(?:(?=(\\?))\2.)*?\1\)/g;
    const matches = [];
    let nextMatch = regex.exec(css);
    while (nextMatch !== null) {
      // Store matches in reverse order for easier reverse-traversing of the css
      // string while replacing paths.
      matches.unshift({
        text: nextMatch[0],
        index: nextMatch.index,
      });
      nextMatch = regex.exec(css);
    }
    for (const match of matches) {
      // Ignore initial `url(` and final `)`
      let src_path = match.text.substring(4, match.text.length - 1);
      let start_index = match.index + 4;
      // Ignore quotes, if content is quoted
      if (src_path.startsWith("'") || src_path.startsWith('"')) {
        src_path = src_path.substring(1, src_path.length - 1);
        start_index = start_index + 1;
      }
      if (
        !src_path.startsWith('http') &&
        !src_path.startsWith('//') &&
        !src_path.startsWith('data:')
      ) {
        const abs_path = path.resolve(src_dir, src_path);
        let new_path;
        if (env.localFonts && env.localFonts.includes(abs_path)) {
          // This is a font which has already been included with the `@font`
          // annotation, so point toward that location and do not copy again.
          const baseFontPath = `${path.resolve(env.dir, env.herman.fontpath)}/`;
          const rel_path = abs_path.substr(baseFontPath.length);
          new_path = `../fonts/${rel_path}`;
        } else {
          const rel_path = path.relative(env.dir, abs_path);
          new_path = `./${rel_path}`;
          // Store reference to original path for later copying of assets
          env.customCSSFiles.push(abs_path);
        }
        const pre = css.substr(0, start_index);
        const post = css.substr(start_index + src_path.length);
        css = pre + new_path + post;
      }
    }
    file.contents = Buffer.from(css);
  },
};
