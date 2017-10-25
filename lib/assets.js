'use strict';

const Promise = require('bluebird');
const vfs = require('vinyl-fs');
const through = require('through2');

module.exports = function assets(src, dest, opts = {}) {
  const { parser, env } = opts;
  Reflect.deleteProperty(opts, 'parser');
  Reflect.deleteProperty(opts, 'env');
  return new Promise((resolve, reject) => {
    let stream = vfs.src(src, opts);
    if (parser) {
      const transform = (file, enc, cb) => {
        if (!file.isBuffer()) {
          return cb();
        }
        parser(file, enc, env);
        return cb(null, file);
      };
      stream = stream.pipe(through.obj(transform));
    }
    stream
      .pipe(vfs.dest(dest))
      .on('error', reject)
      .on('finish', resolve);
  });
};
