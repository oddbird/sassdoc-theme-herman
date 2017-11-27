'use strict';

/**
 * Custom `@colors` annotation. Expects colors type followed by
 * semicolon-separated list of `key: value` arguments.
 */
module.exports = () => ({
  name: 'colors',
  multiple: false,
  parse: raw => {
    // expects e.g. 'color-palette; key: sans; sizes: text-sizes;'
    // returns object {
    //   type: "color-palette",
    //   key: "sans",
    //   sizes: "text-sizes"
    // }
    const options = {
      type: 'color-palette',
    };
    let key, value;
    raw.split(';').forEach(option => {
      const parts = option.split(':');
      key = parts[0].trim();
      value = parts[1] ? parts[1].trim() : null;
      if (key) {
        options[key] = value;
      }
    });
    return options;
  },
});
