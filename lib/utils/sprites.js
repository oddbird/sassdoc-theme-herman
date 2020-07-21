'use strict';

const { Transform } = require('readable-stream');
const Promise = require('bluebird');
const svg = require('gulp-svg-symbols');
const vfs = require('vinyl-fs');

const { templates } = require('./templates');

module.exports = (path) => {
  let result;

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
