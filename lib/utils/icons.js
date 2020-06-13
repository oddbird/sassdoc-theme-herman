'use strict';

const Promise = require('bluebird');
const svg = require('gulp-svg-symbols');
const SVGO = require('svgo');
const through = require('through2');
const vfs = require('vinyl-fs');

const { templates } = require('./templates');

const svgo = new SVGO({
  plugins: [{ removeViewBox: false }],
});

module.exports = (path) => {
  let result;

  const optimize = function (file, enc, cb) {
    svgo.optimize(file.contents.toString(enc), { path: file.path }).then(
      (optimized) => {
        file.contents = Buffer.from(optimized.data, enc);
        cb(null, file);
      },
      (error) => {
        cb(error);
      },
    );
  };

  const storeSprite = function (file, enc, cb) {
    if (!result) {
      result = file.contents.toString(enc);
    }
    return cb(null, file);
  };

  return new Promise((resolve, reject) => {
    vfs
      .src(`${path}**/*.svg`)
      .pipe(through.obj(optimize))
      .pipe(
        svg({
          id: 'icon-%f',
          templates: [templates.icons_tpl],
        }),
      )
      .pipe(through.obj(storeSprite))
      .on('error', reject)
      .on('finish', () => {
        resolve(result);
      });
  });
};
