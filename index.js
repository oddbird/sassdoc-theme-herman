'use strict';

const sassdocAnnotations = require('sassdoc/dist/annotation/annotations');

const access = require('./lib/annotations/access');
const colors = require('./lib/annotations/colors');
const example = require('./lib/annotations/example');
const font = require('./lib/annotations/font');
const icons = require('./lib/annotations/icons');
const name = require('./lib/annotations/name');
const ratios = require('./lib/annotations/ratios');
const sizes = require('./lib/annotations/sizes');
const prepareContext = require('./lib/prepareContext');
const { renderHerman } = require('./lib/renderHerman');
const { isProse } = require('./lib/utils/prose');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
const herman = (dest, ctx) =>
  prepareContext(ctx).then((preparedContext) =>
    renderHerman(dest, preparedContext),
  );

// Because Herman handles "prose" blocks differently than SassDoc,
// autofilled annotations are often incorrect when used with Herman.
// So we iterate through the core annotations that have autofill logic,
// and override that to abort if the item will be treated as "prose" by Herman.
// See: https://www.oddbird.net/herman/docs/demo_test-sassdoc#extra-commentary
const customAnnotationNames = [
  'access',
  'colors',
  'example',
  'font',
  'icons',
  'name',
  'ratios',
  'sizes',
];
const annotations = sassdocAnnotations
  .filter((a) => {
    const obj = a({ logger: console });
    return (
      !customAnnotationNames.includes(obj.name) &&
      Object.prototype.hasOwnProperty.call(obj, 'autofill')
    );
  })
  .map((a) => () => {
    const obj = a({ logger: console });
    return {
      ...obj,
      autofill: (item) => {
        if (isProse(item)) {
          return undefined;
        }
        return obj.autofill(item);
      },
    };
  });

herman.annotations = [
  ...annotations,
  access,
  colors,
  example,
  font,
  icons,
  name,
  ratios,
  sizes,
];

// make sure sassdoc will preserve comments not attached to Sass
herman.includeUnknownContexts = true;

module.exports = herman;
