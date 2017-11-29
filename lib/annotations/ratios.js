'use strict';

/**
 * Custom `@ratios` annotation. Accepts optional
 * map-variable name (used to access data from Sass JSON).
 */
module.exports = () => ({
  name: 'ratios',
  multiple: false,
  parse: raw => ({ key: raw.trim() }),
});
