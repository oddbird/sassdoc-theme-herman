'use strict';

const herman = require('./lib/herman');

const example = require('./lib/annotations/example');
const font = require('./lib/annotations/font');
const icons = require('./lib/annotations/icons');
const macro = require('./lib/annotations/macro');
const name = require('./lib/annotations/name');
const preview = require('./lib/annotations/preview');

herman.annotations = [macro, icons, preview, font, example, name];

// make sure sassdoc will preserve comments not attached to Sass
herman.includeUnknownContexts = true;

module.exports = herman;
