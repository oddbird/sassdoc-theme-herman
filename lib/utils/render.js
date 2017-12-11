'use strict';

const $ = require('cheerio');
const path = require('path');
const Promise = require('bluebird');
const rename = require('gulp-rename');
const through = require('through2');
const typogr = require('typogr');
const vfs = require('vinyl-fs');

// Asynchronously render the template ``tpl`` to the file ``dest`` using
// Nunjucks env ``nunjucksEnv`` and context ``ctx``.
module.exports = function render(nunjucksEnv, tpl, dest, ctx, rendered) {
  const parsedDest = path.parse(dest);
  const renderStr = Promise.promisify(nunjucksEnv.renderString, {
    context: nunjucksEnv,
  });
  const transform = function(file, enc, cb) {
    return renderStr(file.contents.toString(enc), ctx)
      .then(html => typogr(html).widont())
      .then(html => {
        // Store page title and contents for site search indexing
        if (rendered) {
          let title = $('title', html)
            .first()
            .text()
            .trim();
          // Strip " | <name> Documentation" from page titles
          if (title.includes(' | ') && title.endsWith(' Documentation')) {
            title = title.substring(0, title.indexOf(' | '));
          }
          const contents = $('[data-sassdoc-page]', html)
            .text()
            .replace(/\s+/g, ' ')
            .trim();
          rendered.push({
            filename: parsedDest.base,
            title,
            contents,
          });
        }
        file.contents = Buffer.from(html);
        cb(null, file);
      })
      .catch(cb);
  };

  const stream = through.obj(transform);

  return new Promise((resolve, reject) => {
    vfs
      .src(tpl)
      .pipe(stream)
      .pipe(rename(parsedDest.base))
      .pipe(vfs.dest(parsedDest.dir))
      .on('error', reject)
      .on('finish', resolve);
  });
};
