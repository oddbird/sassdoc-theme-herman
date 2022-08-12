'use strict';

const { isProse } = require('./../utils/prose');

module.exports = (env) => {
  const defaultPrivatePrefixTest = RegExp.prototype.test.bind(/^[_-]/);
  const baseAccessFn =
    // eslint-disable-next-line global-require
    require('sassdoc/dist/annotation/annotations/access').default;
  const baseAccess = baseAccessFn();

  return {
    ...baseAccess,

    autofill(item) {
      if (isProse(item)) {
        return undefined;
      }

      if (item.access !== 'auto') {
        return undefined;
      }

      if (env.privatePrefix === false) {
        return undefined;
      }

      let testFunc = defaultPrivatePrefixTest;

      if (typeof env.privatePrefix !== 'undefined') {
        testFunc = RegExp.prototype.test.bind(new RegExp(env.privatePrefix));
      }

      if (testFunc(item.context.name)) {
        return 'private';
      }

      return 'public';
    },
  };
};
