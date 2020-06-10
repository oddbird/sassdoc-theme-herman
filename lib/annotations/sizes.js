'use strict';

const ensureSassJson = require('../utils/ensureSassJson');
const renderIframe = require('../renderIframe');

/**
 * Custom `@sizes` annotation. Accepts optional
 * map-variable name (used to access data from Sass JSON),
 * followed by optional curly-bracketed `style` argument
 * (defaults to `text`).
 */
module.exports = (env) => {
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
    parse: (raw) => {
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
    resolve: (data) => {
      const promises = [];
      data.forEach((item) => {
        if (!item.sizes) {
          return;
        }
        let promise = ensureSassJson(env, '@sizes');
        promise = promise.then(() => {
          const key =
            item.sizes.key ||
            (item.context && item.context.origName) ||
            (item.context && item.context.name);
          item.sizes.key = key;
          const sizesData =
            env.sassjson && env.sassjson.sizes && env.sassjson.sizes[key];
          if (!sizesData) {
            env.logger.warn(
              `Sassjson file is missing sizes "${key}" data. ` +
                'Did you forget to `@include herman-add()` for these sizes?',
            );
            return Promise.reject();
          }
          return Promise.resolve();
        });
        promise = promise.then(() => renderIframe(env, item, 'sizes'));
        promises.push(promise);
      });
      return Promise.all(promises);
    },
  };
};
