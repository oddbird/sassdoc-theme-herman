'use strict';

const nunjucks = require('nunjucks');

module.exports = (name, env, warned) => {
  if (env.herman && env.herman.nunjucksEnv) {
    return env.herman.nunjucksEnv;
  }
  if (!env.herman || !env.herman.templatepath) {
    if (!warned) {
      env.logger.warn(`Must pass in a templatepath if using ${name}.`);
    }
    return null;
  }
  return nunjucks.configure(env.herman.templatepath);
};
