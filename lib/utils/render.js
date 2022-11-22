'use strict';

const path = require('path');
const util = require('util');

const cheerio = require('cheerio');
const rename = require('gulp-rename');
const { Transform } = require('readable-stream');
const typogr = require('typogr');
const vfs = require('vinyl-fs');

// Asynchronously render the template ``tpl`` to the file ``dest`` using
// Nunjucks env ``nunjucksEnv`` and context ``ctx``.
module.exports = function render(nunjucksEnv, tpl, dest, ctx, rendered) {
  const parsedDest = path.parse(dest);
  const renderStr = util.promisify(nunjucksEnv.renderString);
  const transform = new Transform({
    objectMode: true,
    transform: (file, enc, cb) =>
      renderStr
        .call(nunjucksEnv, file.contents.toString(enc), ctx)
        .then((html) => typogr(html).widont())
        .then((html) => {
          // Store page title and contents for site search indexing
          if (rendered) {
            const $ = cheerio.load(html);
            let title = $('title').first().text().trim();
            // Strip " | <name> Documentation" from page titles
            if (title.includes(' | ') && title.endsWith(' Documentation')) {
              title = title.substring(0, title.indexOf(' | '));
            }
            const contents = $('[data-page]')
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
        .catch(cb),
  });

  return new Promise((resolve, reject) => {
    vfs
      .src(tpl)
      .pipe(transform)
      .pipe(rename(parsedDest.base))
      .pipe(vfs.dest(parsedDest.dir))
      .on('error', reject)
      .on('finish', resolve);
  });
};
