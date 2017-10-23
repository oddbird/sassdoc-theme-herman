'use strict';

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
};
