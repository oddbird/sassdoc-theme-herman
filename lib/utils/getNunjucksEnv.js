'use strict';

const nunjucks = require('nunjucks');

// Returns client Nunjucks environment (if passed in), or creates a new one.
module.exports = (name, env, warned) => {
  if (env.herman && env.herman.nunjucks && env.herman.nunjucks.environment) {
    return env.herman.nunjucks.environment;
  }
  if (
    !(env.herman && env.herman.nunjucks && env.herman.nunjucks.templatePath)
  ) {
    if (!warned) {
      env.logger.warn(`Must pass in a nunjucks.templatePath if using ${name}.`);
    }
    return null;
  }
  nunjucks.installJinjaCompat();
  return nunjucks.configure(env.herman.nunjucks.templatePath);
};
