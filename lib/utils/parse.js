'use strict';

const path = require('path');
const unixify = require('unixify');

const fontUtils = require('./fonts');

const getFormats = (formats, src_path) => {
  const validFormats = {};
  if (typeof formats === 'string') {
    formats = [formats];
  }
  for (const format of formats) {
    if (fontUtils.isValidFormat(format)) {
      let src = src_path;
      let dest = src_path;
      if (src && !src.startsWith('data:')) {
        src = `${src}.${format}`;
        dest = `assets/fonts/${src}`;
      }
      // Store format type and src/dest paths to file
      // For embedded fonts (e.g. `data:...`) the dest path will equal src.
      validFormats[format] = { src, dest };
    }
  }
  return validFormats;
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
  font: (font, data) => {
    // Parse a local font object (key, variants) and return a list of variants,
    // each with a parsed font ctx (family, formats with filepaths, svgid,
    // style, weight, and list of `local` keys).
    const resp = [];
    const variants =
      font.variants && font.variants.length ? font.variants : Object.keys(data);
    for (const variant of variants) {
      let isLocal = false;
      let hasEmbedded = false;
      const isValid = fontUtils.isValidVariant(variant);
      if (isValid) {
        const family = data.name || font.key;
        let svgid = family;
        // Set weight and style from variant key
        let weight = 'normal';
        let style = 'normal';
        for (const variantBit of variant.split(' ')) {
          if (fontUtils.constants.weight.has(variantBit)) {
            weight = variantBit;
          }
          if (fontUtils.constants.style.has(variantBit)) {
            style = variantBit;
          }
        }
        let formats = {};
        let local;
        if (data[variant]) {
          // Local or embedded font
          isLocal = true;
          // Get base path to variant font files
          const src_path =
            typeof data[variant] === 'string'
              ? data[variant]
              : data[variant].path;
          if (data.formats) {
            formats = getFormats(data.formats, src_path);
          }
          if (typeof data[variant] !== 'string') {
            // Set variant-specific `local` setting
            if (data[variant].local) {
              local =
                typeof data[variant].local === 'string'
                  ? [data[variant].local]
                  : data[variant].local;
            }
            // Set variant-specific `svgid` setting
            if (data[variant].svgid) {
              svgid = data[variant].svgid;
            }
            for (const key of Object.keys(data[variant])) {
              // For each format specified, store format type and filepath
              if (fontUtils.isValidFormat(key)) {
                let src = data[variant][key];
                let dest = src;
                if (src.startsWith('data:')) {
                  hasEmbedded = true;
                } else {
                  dest = `assets/fonts/${unixify(src)}.${key}`;
                  src = path.normalize(`${src}.${key}`);
                }
                formats[key] = { src, dest };
              }
            }
          }
        }
        if (!isLocal || Object.keys(formats).length) {
          const ctx = {
            isLocal,
            hasEmbedded,
            variant,
            family,
            formats,
            svgid,
            style,
            weight,
            local,
          };
          resp.push(ctx);
        }
      }
    }
    return resp;
  },
  customCSS: (file, enc, env) => {
    // Parse the contents of a file containing CSS output. For any occurences of
    // `url(...)` with relative paths, store the paths (for later copying) and
    // replace them with the eventual destination paths.
    env.customCSSFiles = env.customCSSFiles || [];
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
      const doNotRewrite = /^(?:https?:|data:|\/)/i;
      if (!doNotRewrite.test(src_path)) {
        const src_dir = unixify(path.parse(file.path).dir);
        const abs_path = path.posix.resolve(src_dir, src_path);
        let new_path;
        if (
          env.localFonts &&
          env.localFonts.includes(path.normalize(abs_path))
        ) {
          // This is a font which has already been included with the `@font`
          // annotation, so point toward that location and do not copy again.
          const baseFontPath = `${path.posix.resolve(
            env.dir,
            env.herman.fontpath
          )}/`;
          const rel_path = abs_path.substr(baseFontPath.length);
          new_path = `../fonts/${rel_path}`;
        } else {
          const rel_path = path.posix.relative(env.dir, abs_path);
          new_path = `./${rel_path}`;
          // Store reference to original path for later copying of assets
          env.customCSSFiles.push(path.normalize(abs_path));
        }
        const pre = css.substr(0, start_index);
        const post = css.substr(start_index + src_path.length);
        css = pre + new_path + post;
      }
    }
    file.contents = Buffer.from(css);
  },
};
