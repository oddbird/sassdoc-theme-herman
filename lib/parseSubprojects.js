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
      try {
        // Load .sassdocrc configuration from subproject directory
        config = yaml.safeLoad(fs.readFileSync(configFile, 'utf-8'));
      } catch (err) {
        ctx.logger.warn(
          `Invalid or no .sassdocrc found for subproject: ${name}`
        );
      }
      try {
        // Load package.json data from subproject directory
        packageJSON = yaml.safeLoad(fs.readFileSync(packageFile, 'utf-8'));
      } catch (err) {
        ctx.logger.warn(
          `Invalid or no package.json found for subproject: ${name}`
        );
      }
      if (!config.description && !config.descriptionPath) {
        // Set default descriptionPath for subproject
        config.descriptionPath = `${prjPath}README.md`;
      }
      let src;
      if (config.src) {
        // Set subproject src files based on .sassdocrc `src` option
        src = path.isAbsolute(config.src) ? config.src : prjPath + config.src;
      } else {
        // Fall back to all subproject `.scss` files
        src = `${prjPath}**/*.scss`;
      }
      // Remove unused/unnecessary config options
      config.src = undefined;
      config.theme = undefined;
      config.dest = undefined;
      const prjCtx = extend({}, config);
      const promise = sassdoc.parse(src, prjCtx).then(data => {
        prjCtx.subpackage = packageJSON;
        prjCtx.package = ctx.package;
        prjCtx.basePath = '../';
        prjCtx.activeProject = name;
        prjCtx.data = data;
        prjCtx.subprojects = ctx.subprojects;
        prjCtx.topGroups = ctx.groups;
        prjCtx.topByGroup = ctx.byGroup;
        ctx.subprojects[name] = prepareContext(prjCtx);
      });
      promises.push(promise);
    });
  }
  return Promise.all(promises);
};
