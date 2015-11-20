'use strict';

var minify = require('html-minifier').minify;
var Promise = require('bluebird');
var rename = require('gulp-rename');
var through = require('through2');
var vfs = require('vinyl-fs');

module.exports = function (env, src, dest, ctx) {
  var renderStr = Promise.promisify(env.renderString, { context: env });
  var transform = function (file, enc, cb) {
    if (!file.isBuffer()) {
      return cb();
    }

    renderStr(file.contents.toString(enc), ctx)
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
    vfs.src(src)
      .pipe(stream)
      .on('error', reject)
      .pipe(rename('index.html'))
      .pipe(vfs.dest(dest))
      .on('end', resolve);
  });
};
