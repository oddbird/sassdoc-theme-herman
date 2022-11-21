'use strict';

const svg = require('gulp-svg-symbols');
const { Transform } = require('readable-stream');
const vfs = require('vinyl-fs');

const { templates } = require('./templates');

module.exports = (path, shouldOptimize) => {
  let result, doOptimize;

  /* istanbul ignore if */
  if (shouldOptimize) {
    // eslint-disable-next-line global-require
    const { optimize } = require('svgo');
    doOptimize = new Transform({
      objectMode: true,
      transform: (file, enc, cb) => {
        try {
          const optimized = optimize(file.contents.toString(enc), {
            path: file.path,
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          });
          file.contents = Buffer.from(optimized.data, enc);
          cb(null, file);
        } catch (error) {
          cb(error);
        }
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
      stream = stream.pipe(doOptimize);
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
