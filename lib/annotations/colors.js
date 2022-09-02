'use strict';

const Promise = require('bluebird');

const renderIframe = require('../renderIframe');
const ensureSassJson = require('../utils/ensureSassJson');

/**
 * Custom `@colors` annotation. Accepts optional
 * map-variable name (used to access data from Sass JSON).
 */
module.exports = (env) => ({
  name: 'colors',
  multiple: false,
  parse: (raw) => ({ key: raw.trim() }),
  resolve: (data) => {
    const promises = [];
    data.forEach((item) => {
      if (!item.colors) {
        return;
      }
      let promise = ensureSassJson(env, '@colors');
      promise = promise.then(() => {
        const key =
          item.colors.key ||
          (item.context && item.context.origName) ||
          (item.context && item.context.name);
        item.colors.key = key;
        const colorsData =
          env.sassjson && env.sassjson.colors && env.sassjson.colors[key];
        if (!colorsData) {
          env.logger.warn(
            `Sassjson file is missing colors "${key}" data. ` +
              'Did you forget to `@include herman.add()` for these colors?',
          );
          return Promise.reject();
        }
        return Promise.resolve();
      });
      promise = promise.then(() => renderIframe(env, item, 'colors'));
      promises.push(promise);
    });
    return Promise.all(promises);
  },
});
