'use strict';

const Promise = require('bluebird');

const renderIframe = require('../renderIframe');
const ensureSassJson = require('../utils/ensureSassJson');

/**
 * Custom `@ratios` annotation. Accepts optional
 * map-variable name (used to access data from Sass JSON).
 */
module.exports = (env) => ({
  name: 'ratios',
  multiple: false,
  parse: (raw) => ({ key: raw.trim() }),
  resolve: (data) => {
    const promises = [];
    data.forEach((item) => {
      if (!item.ratios) {
        return;
      }
      let promise = ensureSassJson(env, '@ratios');
      promise = promise.then(() => {
        const key =
          item.ratios.key ||
          (item.context && item.context.origName) ||
          (item.context && item.context.name);
        item.ratios.key = key;
        const ratiosData =
          env.sassjson && env.sassjson.ratios && env.sassjson.ratios[key];
        if (!ratiosData) {
          env.logger.warn(
            `Sassjson file is missing ratios "${key}" data. ` +
              'Did you forget to `@include herman.add()` for these ratios?',
          );
          return Promise.reject();
        }
        return Promise.resolve();
      });
      promise = promise.then(() => renderIframe(env, item, 'ratios'));
      promises.push(promise);
    });
    return Promise.all(promises);
  },
});
