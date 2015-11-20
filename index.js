'use strict';

var extend = require('extend');
var fs = require('fs');
var minify = require('html-minifier').minify;
var nunjucks = require('nunjucks');
var parse = require('./lib/parse.js');
var path = require('path');
var Promise = require('bluebird');
var rename = require('gulp-rename');
var through = require('through2');
var vfs = require('vinyl-fs');

/**
 * SassDoc extras (providing Markdown and other filters, and different way to
 * index SassDoc data).
 *
 * See <https://github.com/SassDoc/sassdoc-extras>.
 */
var extras = require('sassdoc-extras');

/**
 * Actual theme function. It takes the destination directory `dest`,
 * and the context variables `ctx`.
 */
module.exports = function (dest, ctx) {
  var index = path.resolve(__dirname, './views/index.j2');
  var base = path.resolve(__dirname, './views');
  var assets = path.resolve(__dirname, './assets');
  var env = nunjucks.configure(base, { noCache: true });
  var renderStr = Promise.promisify(env.renderString, { context: env });
  dest = path.resolve(dest);

  var render = function (context) {
    var transform = function (file, enc, cb) {
      if (!file.isBuffer()) {
        return cb();
      }

      renderStr(file.contents.toString(enc), context)
        .then(function (html) {
          return minify(html, { collapseWhitespace: true });
        })
        .then(function (html) {
          file.contents = new Buffer(html);
          cb(null, file);
        })
        .catch(function (err) {
          cb(err);
        });
    };

    var stream = through.obj(transform);

    return new Promise(function (resolve, reject) {
      vfs.src(index)
        .pipe(stream)
        .on('error', reject)
        .pipe(rename('index.html'))
        .pipe(vfs.dest(dest))
        .on('end', resolve);
    });
  };

  var copy = function (src, dst) {
    return new Promise(function (resolve, reject) {
      vfs.src(path.join(src, '/**/*.{css,js,svg,png,eot,woff,woff2,ttf}'))
        .pipe(vfs.dest(path.join(dst, 'assets')))
        .on('error', reject)
        .on('end', resolve);
    });
  };

  var def = {
    display: {
      access: [ 'public', 'private' ],
      alias: false,
      watermark: true
    },
    groups: {
      undefined: 'General'
    },
    shortcutIcon: 'http://sass-lang.com/favicon.ico'
  };

  // Apply default values for groups and display.
  ctx.groups = extend(def.groups, ctx.groups);
  ctx.display = extend(def.display, ctx.display);

  // Extend top-level context keys.
  ctx = extend({}, def, ctx);

  /**
   * Load a `sassyjsonfile` (if one is given in the context) and add its
   * contents under the `sassyjson` key of the context.
   */
  if (ctx.sassyjsonfile) {
    /* eslint-disable no-sync */
    ctx.sassyjson = parse.sassyJson(fs.readFileSync(ctx.sassyjsonfile));
    /* eslint-enable no-sync */
  }

  /**
   * Parse text data (like descriptions) as Markdown, and put the
   * rendered HTML in `html*` variables.
   *
   * For example, `ctx.package.description` will be parsed as Markdown
   * in `ctx.package.htmlDescription`.
   *
   * See <http://sassdoc.com/extra-tools/#markdown>.
   */
  extras.markdown(ctx);

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
   * See <http://sassdoc.com/extra-tools/#display-toggle>.
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
   * See <http://sassdoc.com/extra-tools/#groups-aliases>.
   */
  extras.groupName(ctx);

  /**
   * Use SassDoc indexer to index the data by group and type, so we
   * have the following structure:
   *
   *     {
   *       "group-slug": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       },
   *       "another-group": {
   *         "function": [...],
   *         "mixin": [...],
   *         "variable": [...]
   *       }
   *     }
   *
   * You can then use `data.byGroupAndType` instead of `data` in your
   * templates to manipulate the indexed object.
   */
  ctx.data.byGroupAndType = extras.byGroupAndType(ctx.data);

  return Promise.all([
    render(ctx),
    copy(assets, dest)
  ]);
};
