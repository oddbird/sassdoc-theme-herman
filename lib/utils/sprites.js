'use strict';

const { Transform } = require('readable-stream');
const Promise = require('bluebird');
const svg = require('gulp-svg-symbols');
const SVGO = require('svgo');
const vfs = require('vinyl-fs');

const { templates } = require('./templates');

const svgo = new SVGO({
  plugins: [{ removeViewBox: false }],
});

module.exports = (path) => {
  let result;

  const optimize = new Transform({
    objectMode: true,
    transform: (file, enc, cb) => {
      svgo.optimize(file.contents.toString(enc), { path: file.path }).then(
        (optimized) => {
          file.contents = Buffer.from(optimized.data, enc);
          cb(null, file);
        },
        /* istanbul ignore next */ (error) => {
          cb(error);
        },
      );
    },
  });

  const storeSprite = new Transform({
    objectMode: true,
    transform: (file, enc, cb) => {
      /* istanbul ignore else */
      if (!result) {
        result = file.contents.toString(enc);
      }
      return cb(null, file);
    },
  });

  return new Promise((resolve, reject) => {
    vfs
      .src(`${path}**/*.svg`)
      .pipe(optimize)
      .pipe(
        svg({
          id: 'icon-%f',
          templates: [templates.icons_tpl],
        }),
      )
      .pipe(storeSprite)
      .on('error', reject)
      .on('finish', () => {
        resolve(result);
      });
  });
};
