'use strict';

const css2obj = require('../utils/css2obj.js');

/**
 * Custom `@sizes` annotation. Expects sizes type followed by
 * semicolon-separated list of `key: value` arguments.
 */
module.exports = () => ({
  name: 'sizes',
  multiple: false,
  parse: raw => {
    // expects e.g. 'color-palette; key: sans; sizes: text-sizes;'
    // returns object {
    //   type: "color-palette",
    //   key: "sans",
    //   sizes: "text-sizes"
    // }
    const options = {
      type: 'sizes',
    };
    return css2obj(raw, options);
  },
});
