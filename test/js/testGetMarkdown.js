'use strict';

const assert = require('assert');
const MarkdownIt = require('markdown-it');

const markdown = require('../../lib/utils/getMarkdown');

describe('getMarkdown', function() {
  it('returns instance of markdown-it', function() {
    assert.ok(markdown instanceof MarkdownIt);
  });
});
