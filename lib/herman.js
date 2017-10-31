'use strict';

const prepareContext = require('./prepareContext');

const parseSubprojects = require('./parseSubprojects');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
const renderHerman = require('./renderHerman');

module.exports = (dest, ctx) => {
  ctx = prepareContext(ctx);

  return parseSubprojects(ctx).then(() => renderHerman(dest, ctx));
};
