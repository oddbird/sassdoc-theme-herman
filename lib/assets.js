'use strict';

var path = require('path');
var vfs = require('vinyl-fs');

module.exports = function (src, dest) {
  return new Promise(function (resolve, reject) {
    vfs.src(path.join(src, '/**/*.{css,js,svg,png,eot,woff,woff2,ttf}'))
      .pipe(vfs.dest(path.join(dest, 'assets')))
      .on('error', reject)
      .on('end', resolve);
  });
};
