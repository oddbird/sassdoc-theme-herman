'use strict';

const css2obj = require('../utils/css2obj.js');

/**
 * Custom `@ratios` annotation. Expects optional
 * semicolon-separated list of `key:value` arguments.
 */
module.exports = () => ({
  name: 'ratios',
  multiple: false,
  // expects e.g. 'count: 4'
  // returns object {
  //   count: "4",
  // }
  parse: raw => css2obj(raw),
});
