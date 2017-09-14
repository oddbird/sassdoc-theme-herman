'use strict';

const Promise = require('bluebird');
const vfs = require('vinyl-fs');

module.exports = function assets(src, dest) {
  return new Promise((resolve, reject) => {
    vfs
      .src(src)
      .pipe(vfs.dest(dest))
      .on('error', reject)
      .on('finish', resolve);
  });
};
