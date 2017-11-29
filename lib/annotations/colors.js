'use strict';

/**
 * Custom `@colors` annotation. Accepts optional
 * map-variable name (used to access data from Sass JSON).
 */
module.exports = () => ({
  name: 'colors',
  multiple: false,
  parse: raw => ({ key: raw.trim() }),
});
