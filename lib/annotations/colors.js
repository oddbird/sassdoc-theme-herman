'use strict';

const css2obj = require('../utils/css2obj.js');

/**
 * Custom `@colors` annotation. Expects optional
 * semicolon-separated list of `key:value` arguments.
 */
module.exports = () => ({
  name: 'colors',
  multiple: false,
  // expects e.g. 'key: my-colors'
  // returns object {
  //   key: "my-colors",
  // }
  parse: raw => css2obj(raw),
});
