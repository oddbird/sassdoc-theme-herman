'use strict';

const { Transform } = require('readable-stream');
const Promise = require('bluebird');
const svg = require('gulp-svg-symbols');
const vfs = require('vinyl-fs');

const { templates } = require('./templates');

module.exports = (path, shouldOptimize) => {
  let result, optimize;

  /* istanbul ignore if */
  if (shouldOptimize) {
    // eslint-disable-next-line global-require
    const SVGO = require('svgo');
    const svgo = new SVGO({
      plugins: [{ removeViewBox: false }],
    });
    optimize = new Transform({
      objectMode: true,
      transform: (file, enc, cb) => {
        svgo.optimize(file.contents.toString(enc), { path: file.path }).then(
          (optimized) => {
            file.contents = Buffer.from(optimized.data, enc);
            cb(null, file);
          },
          (error) => {
            cb(error);
          },
        );
      },
    });
  }

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
    let stream = vfs.src(`${path}**/*.svg`);

    /* istanbul ignore if */
    if (shouldOptimize) {
      stream = stream.pipe(optimize);
    }

    stream
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
