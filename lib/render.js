'use strict';

var minify = require('html-minifier').minify;
var path = require('path');
var Promise = require('bluebird');
var rename = require('gulp-rename');
var through = require('through2');
var vfs = require('vinyl-fs');

// Asynchronously render the template ``tpl`` to the file ``dest`` using
// Nunjucks env ``env`` and context ``ctx``.
module.exports = function(env, tpl, dest, ctx) {
  var parsedDest = path.parse(dest);
  var renderStr = Promise.promisify(env.renderString, { context: env });
  var transform = function(file, enc, cb) {
    if (!file.isBuffer()) {
      return cb();
    }

    return renderStr(file.contents.toString(enc), ctx)
      .then(function(html) {
        return minify(html, { collapseWhitespace: true });
      })
      .then(function(html) {
        file.contents = new Buffer(html);
        cb(null, file);
      })
      .catch(function(err) {
        cb(err);
      });
  };

  var stream = through.obj(transform);

  return new Promise(function(resolve, reject) {
    vfs
      .src(tpl)
      .pipe(stream)
      .pipe(rename(parsedDest.base))
      .pipe(vfs.dest(parsedDest.dir))
      .on('error', reject)
      .on('finish', resolve);
  });
};
