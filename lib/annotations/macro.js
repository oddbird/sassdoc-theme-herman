'use strict';

const getNunjucksEnv = require('../utils/getNunjucksEnv');

/**
 * Custom `@macro` annotation. Expects macrofile:macroname.
 *
 * The referenced macro should have a `macroname_doc` (a string containing
 * documentation for the macro) var defined in the same macro file.
 */
module.exports = env => ({
  name: 'macro',
  multiple: false,
  parse: raw => {
    // expects e.g. 'forms.macros.js.j2:label'
    // returns object {
    //   file: 'forms.macros.js.j2',
    //   name: 'label'
    // }
    const bits = raw.split(':');
    return { file: bits[0], name: bits[1] };
  },
  resolve: data => {
    let customNjkEnv;
    let warned = false;
    data.forEach(item => {
      if (!item.macro) {
        return;
      }
      if (!customNjkEnv) {
        customNjkEnv = getNunjucksEnv('@macro', env, warned);
      }
      if (!customNjkEnv) {
        warned = true;
        return;
      }
      const prefix = `{% import "${item.macro.file}" as it %}`;
      const docTpl = `${prefix}{{ it.${item.macro.name}_doc }}`;
      item.macro.doc = customNjkEnv.renderString(docTpl);
    });
  },
});
