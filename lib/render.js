'use strict';

const minify = require('html-minifier').minify;
const path = require('path');
const Promise = require('bluebird');
const rename = require('gulp-rename');
const through = require('through2');
const vfs = require('vinyl-fs');

// Asynchronously render the template ``tpl`` to the file ``dest`` using
// Nunjucks env ``env`` and context ``ctx``.
module.exports = function render(env, tpl, dest, ctx) {
  const parsedDest = path.parse(dest);
  const renderStr = Promise.promisify(env.renderString, { context: env });
  const transform = function(file, enc, cb) {
    if (!file.isBuffer()) {
      return cb();
    }

    return renderStr(file.contents.toString(enc), ctx)
      .then(html => minify(html, { collapseWhitespace: true }))
      .then(html => {
        file.contents = Buffer.from(html);
        cb(null, file);
      })
      .catch(err => {
        cb(err);
      });
  };

  const stream = through.obj(transform);

  return new Promise((resolve, reject) => {
    vfs
      .src(tpl)
      .pipe(stream)
      .pipe(rename(parsedDest.base))
      .pipe(vfs.dest(parsedDest.dir))
      .on('error', reject)
      .on('finish', resolve);
  });
};
