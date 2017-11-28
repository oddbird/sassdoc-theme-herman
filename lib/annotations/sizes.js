'use strict';

const css2obj = require('../utils/css2obj.js');

/**
 * Custom `@sizes` annotation. Expects optional
 * semicolon-separated list of `key:value` arguments.
 */
module.exports = () => ({
  name: 'sizes',
  multiple: false,
  // expects e.g. 'style: ruler'
  // returns object {
  //   style: "ruler",
  // }
  parse: raw => css2obj(raw),
});
