'use strict';

/**
 * SassDoc extras (providing Markdown and other filters, and different way to
 * index SassDoc data).
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
const extend = require('extend');
const extras = require('sassdoc-extras');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const applyMarkdown = require('./utils/markdown');
const byGroup = require('./utils/byGroup');
const markdown = require('./utils/getMarkdown');
const parse = require('./utils/parse');

const readFile = Promise.promisify(fs.readFile);

module.exports = ctx => {
  const promises = [];
  const def = {
    display: {
      access: ['public', 'private'],
      alias: false,
      watermark: true,
    },
    groups: {
      undefined: 'General',
    },
    sort: ['group', 'file', 'line', 'access'],
    herman: {
      nunjucks: {},
      sass: {},
    },
  };

  // Apply default values for groups and display.
  ctx.groups = extend(def.groups, ctx.groups);
  ctx.display = extend(def.display, ctx.display);

  if (!ctx.description) {
    def.descriptionPath = './README.md';
  }

  // Extend top-level context keys.
  ctx = extend({}, def, ctx);

  /**
   * Load `extraDocs` files, and parse contents as markdown.
   */
  if (ctx.herman.extraDocs && ctx.herman.extraDocs.length) {
    ctx.extraDocs = [];
    for (const doc of ctx.herman.extraDocs) {
      let filepath, filename, name;
      if (typeof doc === 'string') {
        filepath = path.resolve(ctx.dir, doc);
        name = filename = path.parse(filepath).name;
      } else {
        filepath = path.resolve(ctx.dir, doc.path);
        filename = path.parse(filepath).name;
        name = doc.name;
      }
      const obj = { filename, name };
      ctx.extraDocs.push(obj);
      promises.push(
        readFile(filepath, 'utf-8')
          .then(data => {
            const text = markdown.render(data);
            obj.text = text;
          })
          .catch(err => {
            ctx.extraDocs.splice(ctx.extraDocs.indexOf(obj), 1);
            ctx.logger.warn(`File not found: ${filepath}\n${err.message}`);
          })
      );
    }
  }

  /**
   * Add `extraLinks` to context.
   */
  if (ctx.herman.extraLinks && ctx.herman.extraLinks.length) {
    ctx.extraLinks = ctx.herman.extraLinks;
  }

  /**
   * Load a `sass-json file` (if one is given in the context) and add its
   * contents under the `sassjson` key of the context.
   */
  if (ctx.herman.sass && ctx.herman.sass.jsonfile && !ctx.sassjson) {
    promises.push(
      readFile(ctx.herman.sass.jsonfile, 'utf-8')
        .then(data => {
          ctx.sassjson = parse.sassJson(data);
        })
        .catch(err => {
          ctx.logger.warn(
            `File not found: ${ctx.herman.sass.jsonfile}\n${err.message}`
          );
        })
    );
  }

  /**
   * Remove the bogus context from any standalone sassdoc comments.
   * (We detect these if the context starts more than one line after the
   * sassdoc comment ends.)
   */
  ctx.data.forEach(item => {
    if (!item.context || !item.context.line) {
      return;
    }
    if (item.context.type === 'unknown') {
      item.context.type = 'prose';
      item.context.line.end = item.context.line.start;
    }
    // Consider it to be prose if it's separated from the next Sass block
    // by any blank lines.
    const name = item.context.origName || item.context.name || '';
    const lineCount = name.split('\n').length;
    if (!name || item.context.line.start > item.commentRange.end + lineCount) {
      item.context = {
        type: 'prose',
        line: item.commentRange,
      };
    }
  });

  /**
   * Add `description` and `descriptionPath` from configuration.
   * Note: `descriptionPath` will override `description`.
   *
   * See
   * <http://sassdoc.com/extra-tools/#description-description-descriptionpath>.
   */
  extras.description(ctx);

  /**
   * Parse text data (like descriptions) as Markdown.
   *
   * For example, `ctx.package.description` will be parsed as Markdown.
   *
   * Uses <https://github.com/markdown-it/markdown-it>.
   */
  applyMarkdown(ctx);

  /**
   * Add a `display` property for each data item regarding of display
   * configuration (hide private items and aliases for example).
   *
   * You'll need to add default values in your `.sassdocrc` before
   * using this filter:
   *
   *     {
   *       "display": {
   *         "access": ["public", "private"],
   *         "alias": false
   *       }
   *     }
   *
   * See <http://sassdoc.com/extra-tools/#display-toggle-display>.
   */
  extras.display(ctx);

  /**
   * Allow the user to give a name to the documentation groups.
   *
   * We can then have `@group slug` in the docblock, and map `slug`
   * to `Some title string` in the theme configuration.
   *
   * **Note:** all items without a group are in the `undefined` group.
   *
   * See <http://sassdoc.com/extra-tools/#groups-aliases-groupname>.
   */
  extras.groupName(ctx);

  /**
   * Converts `shortcutIcon` config option into an object:
   *
   *       {
   *         "type": "external",
   *         "url": "http://absolute.path/to/icon.png"
   *       }
   *
   *       {
   *         "type": "internal",
   *         "url": "icon.png",
   *         "path": "/complete/relative/path/to/icon.png"
   *       }
   *
   * See <http://sassdoc.com/extra-tools/#shortcut-icon-shortcuticon>.
   */
  extras.shortcutIcon(ctx);

  /**
   * Sorts items based on the `sort` config value.
   * Sort order is determined by the last character: > (desc) or < (asc).
   *
   *       {
   *         "sort": [
   *            "access",
   *            "line>",
   *            "group",
   *            "file"
   *          ]
   *       }
   *
   * See <http://sassdoc.com/extra-tools/#sort-sort>.
   */
  extras.sort(ctx);

  /**
   * Connects aliased variables to their original value.
   * Adds `resolvedValue` key:
   *
   *       {
   *         "description": "<p>Main color</p>\n",
   *         "context": {
   *           "type": "variable",
   *           "name": "color-main",
   *           "value": "$color-blue"
   *         },
   *         "type": "Color",
   *         "resolvedValue": "#22b8dc"
   *       }
   *
   * See <http://sassdoc.com/extra-tools/#resolved-variables-resolvevariables>.
   */
  extras.resolveVariables(ctx);

  /**
   * Index the data by group, so we have the following structure:
   *
   *     {
   *       "group-slug": [...],
   *       "another-group": [...]
   *     }
   *
   * You can then use `data.byGroup` instead of `data` in your
   * templates to manipulate the indexed object.
   */
  ctx.byGroup = byGroup(ctx.data, ctx.groups);

  return Promise.all(promises).then(() => ctx);
};
