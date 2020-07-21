'use strict';

const assert = require('assert');

const MarkdownIt = require('markdown-it');

const markdown = require('../../lib/utils/getMarkdown');

describe('getMarkdown', () => {
  it('returns instance of markdown-it', () => {
    assert.ok(markdown instanceof MarkdownIt);
  });
});
