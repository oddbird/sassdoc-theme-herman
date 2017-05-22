'use strict';

var Promise = require('bluebird');
var vfs = require('vinyl-fs');

module.exports = function(src, dest) {
  return new Promise(function(resolve, reject) {
    vfs.src(src).pipe(vfs.dest(dest)).on('error', reject).on('finish', resolve);
  });
};
