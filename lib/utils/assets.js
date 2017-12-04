'use strict';

const Promise = require('bluebird');
const through = require('through2');
const vfs = require('vinyl-fs');

module.exports = function assets(src, dest, options = {}) {
  const { parser, env } = options;
  Reflect.deleteProperty(options, 'parser');
  Reflect.deleteProperty(options, 'env');
  const opts = Object.assign({ allowEmpty: true }, options);
  return new Promise((resolve, reject) => {
    let stream = vfs.src(src, opts);
    if (parser) {
      const transform = (file, enc, cb) => {
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
