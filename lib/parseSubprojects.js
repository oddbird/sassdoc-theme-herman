'use strict';

const extend = require('extend');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sassdoc = require('sassdoc');
const yaml = require('js-yaml');

const prepareContext = require('./prepareContext');

const readFile = Promise.promisify(fs.readFile);

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
      let prjCtx = {};

      // Load .sassdocrc configuration from subproject directory
      const gettingConfigFile = readFile(configFile, 'utf-8').catch(() => {
        ctx.logger.warn(
          `Invalid or no .sassdocrc or found for subproject: ${name}`
        );
      });

      // Load package.json data from subproject directory
      const gettingPackageFile = readFile(packageFile, 'utf-8').catch(() => {
        ctx.logger.warn(
          `Invalid or no package.json or found for subproject: ${name}`
        );
      });

      const promise = Promise.all([gettingConfigFile, gettingPackageFile])
        .then((configData, packageJsonData) => {
          packageJSON = yaml.safeLoad(packageJsonData);
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
          prjCtx = extend({}, config);

          return sassdoc.parse(src, prjCtx).catch(err => {
            ctx.logger.warn(err);
          });
        })
        .then(data => {
          prjCtx.subpackage = packageJSON;
          prjCtx.package = ctx.package;
          prjCtx.basePath = '../';
          prjCtx.activeProject = name;
          prjCtx.data = data;
          prjCtx.subprojects = ctx.subprojects;
          prjCtx.topGroups = ctx.groups;
          prjCtx.topByGroup = ctx.byGroup;
          return prepareContext(prjCtx);
        })
        .then(preparedContext => {
          ctx.subprojects[name] = preparedContext;
        });
      promises.push(promise);
    });
  }
  return Promise.all(promises);
};
