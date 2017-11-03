'use strict';

const parseSubprojects = require('./parseSubprojects');
const prepareContext = require('./prepareContext');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
const renderHerman = require('./renderHerman');

module.exports = (dest, ctx) =>
  prepareContext(ctx).then(preparedContext =>
    parseSubprojects(preparedContext).then(() =>
      renderHerman(dest, preparedContext)
    )
  );
