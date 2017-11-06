'use strict';

const nunjucks = require('nunjucks');

// get nunjucks env lazily so that we only throw an error on missing
// templatepath if annotation was actually used.
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
