'use strict';

const extend = require('extend');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sassdoc = require('sassdoc');
const yaml = require('js-yaml');

const prepareContext = require('./prepareContext');

module.exports = ctx => {
  const promises = [];
  if (ctx.herman.subprojects) {
    ctx.subprojects = {};
    ctx.herman.subprojects.forEach(name => {
      const prjPath = `./node_modules/${name}/`;
      const configFile = `${prjPath}.sassdocrc`;
      const packageFile = `${prjPath}package.json`;
      let config = {};
      let packageJSON = {};
      // Load .sassdocrc configuration from subproject directory
      fs.readFile(configFile, 'utf-8', (configErr, configData) => {
        if (configErr) {
          ctx.logger.warn(
            `Invalid or no .sassdocrc found for subproject: ${name}`
          );
        } else {
          config = yaml.safeLoad(configData);
          if (!config.description && !config.descriptionPath) {
            // Set default descriptionPath for subproject
            config.descriptionPath = `${prjPath}README.md`;
          }
          let src;
          if (config.src) {
            // Set subproject src files based on .sassdocrc `src` option
            src = path.isAbsolute(config.src)
              ? config.src
              : prjPath + config.src;
          } else {
            // Fall back to all subproject `.scss` files
            src = `${prjPath}**/*.scss`;
          }
          // Remove unused/unnecessary config options
          config.src = undefined;
          config.theme = undefined;
          config.dest = undefined;
          const prjCtx = extend({}, config);

          // Load package.json data from subproject directory
          fs.readFile(
            packageFile,
            'utf-8',
            (packageJsonErr, packageJsonData) => {
              if (packageJsonErr) {
                ctx.logger.warn(
                  `Invalid or no package.json found for subproject: ${name}`
                );
              } else {
                packageJSON = yaml.safeLoad(packageJsonData);
              }
              const promise = sassdoc.parse(src, prjCtx).then(data => {
                prjCtx.subpackage = packageJSON;
                prjCtx.package = ctx.package;
                prjCtx.basePath = '../';
                prjCtx.activeProject = name;
                prjCtx.data = data;
                prjCtx.subprojects = ctx.subprojects;
                prjCtx.topGroups = ctx.groups;
                prjCtx.topByGroup = ctx.byGroup;
                return prepareContext(prjCtx).then(preparedContext => {
                  ctx.subprojects[name] = preparedContext;
                });
              });
              promises.push(promise);
            }
          );
        }
      });
    });
  }
  return Promise.all(promises);
};
