'use strict';

const prepareContext = require('./lib/prepareContext');
const { renderHerman } = require('./lib/renderHerman');

const example = require('./lib/annotations/example');
const font = require('./lib/annotations/font');
const icons = require('./lib/annotations/icons');
const name = require('./lib/annotations/name');
const preview = require('./lib/annotations/preview');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
const herman = (dest, ctx) =>
  prepareContext(ctx).then(preparedContext =>
    renderHerman(dest, preparedContext)
  );

herman.annotations = [icons, preview, font, example, name];

// make sure sassdoc will preserve comments not attached to Sass
herman.includeUnknownContexts = true;

module.exports = herman;
