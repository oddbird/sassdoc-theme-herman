'use strict';

var Promise = require('bluebird');
var through = require('through2');
var vfs = require('vinyl-fs');

module.exports = function (src, dest) {
  // @@@ https://github.com/gulpjs/vinyl-fs/issues/120
  var stream = through.obj(function (file, enc, cb) {
    return cb();
  });

  return new Promise(function (resolve, reject) {
    vfs.src(src)
      .pipe(vfs.dest(dest))
      .pipe(stream)
      .on('error', reject)
      .on('finish', resolve);
  });
};
