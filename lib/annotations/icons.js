'use strict';

const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const getNunjucksEnv = require('../utils/getNunjucksEnv');
const renderIframe = require('../renderIframe');

const readdir = Promise.promisify(fs.readdir);

/**
 * Custom `@icons` annotation. Expects `iconspath macrofile:macroname`.
 *
 * First argument should be the relative path to a directory of icon svg
 * files. Will render given macroname (from given macrofile) with that icon's
 * name as first argument. Sends to template context an `icons` item which is
 * a list of icons, where each one is an object with properties `name`,
 * `path`, and `rendered` (where the latter is the result of rendering the
 * icon macro).
 */
module.exports = env => ({
  name: 'icons',
  multiple: false,
  parse: raw => {
    // expects e.g. 'icons/ utility.macros.j2:icon'
    // returns {
    //   iconsPath: 'icons/',
    //   macroFile: 'utility.macros.j2',
    //   macroName: 'icon'
    // }
    const bits = raw.split(' ');
    const macrobits = bits[1].split(':');
    return {
      iconsPath: bits[0],
      macroFile: macrobits[0],
      macroName: macrobits[1],
    };
  },
  resolve: data => {
    let customNjkEnv;
    let warned = false;
    const promises = [];
    data.forEach(item => {
      if (!item.icons) {
        return;
      }
      if (!customNjkEnv) {
        customNjkEnv = getNunjucksEnv('@icons', env, warned);
      }
      if (!customNjkEnv) {
        warned = true;
        return;
      }
      const inData = item.icons;
      const iconsPath = inData.iconsPath;
      const promise = readdir(iconsPath)
        .then(iconFiles => {
          const renderTpl =
            `{% import "${inData.macroFile}" as it %}` +
            `{{ it.${inData.macroName}(iconName) }}`;
          item.icons = [];
          iconFiles.forEach(iconFile => {
            if (path.extname(iconFile) === '.svg') {
              const iconName = path.basename(iconFile, '.svg');
              const icon = {
                name: iconName,
                path: path.join(inData.iconsPath, iconFile),
                rendered: customNjkEnv
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
