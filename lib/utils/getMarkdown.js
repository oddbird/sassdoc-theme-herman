'use strict';

const MarkdownIt = require('markdown-it');
const anchor = require('markdown-it-anchor');

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  langPrefix: 'lang-',
  typographer: true,
});
markdown.use(anchor, {
  slugify: (str) => str.toLowerCase().replace(/[^\w]+/g, '-'),
});

module.exports = markdown;
