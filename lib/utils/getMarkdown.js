'use strict';

const MarkdownIt = require('markdown-it');
const namedHeaders = require('markdown-it-named-headers');

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  langPrefix: 'lang-',
  typographer: true,
});
markdown.use(namedHeaders, {
  slugify: str => str.toLowerCase().replace(/[^\w]+/g, '-'),
});

module.exports = markdown;
