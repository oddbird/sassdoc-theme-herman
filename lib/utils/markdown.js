'use strict';

const markdown = require('./getMarkdown');

/**
 * Based on sassdoc-extras `markdown`,
 * but uses `markdown-it` (https://github.com/markdown-it/markdown-it) parser.
 * See http://sassdoc.com/extra-tools/#markdown-markdown
 * and https://github.com/SassDoc/sassdoc-extras/blob/master/src/markdown.js
 */

module.exports = ctx => {
  /**
   * Wrapper for `markdown-it` that takes only one argument to avoid
   * problem with `map` additional arguments.
   */
  const md = str => markdown.render(str);

  /**
   * Return a function that will apply `fn` on `obj[key]` to generate
   * `obj[newKey]`.
   */
  const applyKey = (fn, key) => obj => {
    if (key in obj) {
      obj[key] = fn(obj[key]);
    }

    return obj;
  };

  if (ctx.package && ctx.package.description) {
    ctx.package.description = md(ctx.package.description);
  }

  if (ctx.description) {
    ctx.description = md(ctx.description);
  }

  ctx.data.forEach(item => {
    if ('description' in item) {
      item.description = md(item.description);
    }

    if ('output' in item) {
      item.output = md(item.output);
    }

    if ('content' in item && item.content.description) {
      item.content.description = md(item.content.description);
    }

    if ('return' in item && item.return.description) {
      item.return.description = md(item.return.description);
    }

    if ('deprecated' in item) {
      item.deprecated = md(item.deprecated);
    }

    if ('author' in item) {
      item.author = item.author.map(md);
    }

    if ('throw' in item) {
      item.throw = item.throw.map(md);
    }

    if ('todo' in item) {
      item.todo = item.todo.map(md);
    }

    if ('example' in item) {
      item.example = item.example.map(applyKey(md, 'description'));
    }

    if ('parameter' in item) {
      item.parameter = item.parameter.map(applyKey(md, 'description'));
    }

    if ('property' in item) {
      item.property = item.property.map(applyKey(md, 'description'));
    }

    if ('since' in item) {
      item.since = item.since.map(applyKey(md, 'description'));
    }
  });
};
