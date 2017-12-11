'use strict';

const fs = require('fs');
const nunjucks = require('nunjucks');
const path = require('path');
const Promise = require('bluebird');

const renderIframe = require('../renderIframe');
const { templates } = require('../utils/templates');

const nunjucksEnv = nunjucks.configure(templates.baseDir);
const readdir = Promise.promisify(fs.readdir);

/**
 * Custom `@icons` annotation. Expects one argument: `iconspath`.
 *
 * Argument should be the relative path to a directory of icon svg files.
 * Sends to template context an `icons` item which is a list of icons,
 * where each one is an object with properties `name`, `path`, and `rendered`
 * (where the latter is the result of rendering the icon macro
 * with the icon's name as first argument).
 */
module.exports = env => ({
  name: 'icons',
  multiple: false,
  parse: raw => raw.trim(),
  resolve: data => {
    const promises = [];
    data.forEach(item => {
      if (!item.icons) {
        return;
      }
      let iconsPath = item.icons;
      if (!iconsPath.endsWith(path.sep)) {
        iconsPath = `${iconsPath}${path.sep}`;
      }
      item.iconsPath = iconsPath;
      const promise = readdir(iconsPath)
        .then(iconFiles => {
          const renderTpl =
            `{% import "utility.macros.njk" as it %}` +
            `{{ it.icon(iconName) }}`;
          item.icons = [];
          iconFiles.forEach(iconFile => {
            if (path.extname(iconFile) === '.svg') {
              const iconName = path.basename(iconFile, '.svg');
              const icon = {
                name: iconName,
                path: iconsPath,
                rendered: nunjucksEnv
                  .renderString(renderTpl, { iconName })
                  .trim(),
              };
              item.icons.push(icon);
            }
          });
          return renderIframe(env, item, 'icon');
        })
        .catch(err => {
          env.logger.warn(
            `Error reading directory: ${iconsPath}\n${err.message}`
          );
        });
      promises.push(promise);
    });
    return Promise.all(promises);
  },
});
