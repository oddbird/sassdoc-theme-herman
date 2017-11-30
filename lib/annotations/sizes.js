'use strict';

/**
 * Custom `@sizes` annotation. Accepts optional
 * map-variable name (used to access data from Sass JSON),
 * followed by optional curly-bracketed `style` argument
 * (defaults to `text`).
 */
module.exports = () => {
  // Matches first word and text within `{}`
  const RE = /([\w-]+)?\s*(?:\{(.*)\})?/;
  return {
    name: 'sizes',
    multiple: false,
    // expects e.g. 'my-style {ruler}'
    // returns object {
    //   key: "my-style",
    //   style: "ruler",
    // }
    parse: raw => {
      const obj = {
        key: '',
        style: '',
      };
      const match = RE.exec(raw.trim());
      if (match[1]) {
        obj.key = match[1];
      }
      if (match[2]) {
        obj.style = match[2];
      }
      return obj;
    },
  };
};
