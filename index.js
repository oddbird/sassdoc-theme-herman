'use strict';

const sassdocAnnotations = require('sassdoc/dist/annotation/annotations');

const colors = require('./lib/annotations/colors');
const example = require('./lib/annotations/example');
const font = require('./lib/annotations/font');
const icons = require('./lib/annotations/icons');
const name = require('./lib/annotations/name');
const ratios = require('./lib/annotations/ratios');
const sizes = require('./lib/annotations/sizes');
const prepareContext = require('./lib/prepareContext');
const { renderHerman } = require('./lib/renderHerman');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
const herman = (dest, ctx) =>
  prepareContext(ctx).then((preparedContext) =>
    renderHerman(dest, preparedContext),
  );

let annotations = sassdocAnnotations;

// eslint-disable-next-line no-process-env
if (!process.env.HERMAN_ENABLE_AUTOFILL) {
  // Explicitly disable `autofill` fn for default annotations.
  // Because Herman handles "prose" blocks differently than SassDoc,
  // autofilled annotations are often incorrect when used with Herman.
  // See: https://www.oddbird.net/herman/docs/configuration#herman_enable_autofill-environment-variable
  annotations = sassdocAnnotations.map((a) => () => ({
    ...a(),
    autofill: undefined,
  }));
}

herman.annotations = [
  ...annotations,
  icons,
  colors,
  sizes,
  ratios,
  font,
  example,
  name,
];

// make sure sassdoc will preserve comments not attached to Sass
herman.includeUnknownContexts = true;

module.exports = herman;
