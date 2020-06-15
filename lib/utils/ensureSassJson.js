'use strict';

const fs = require('fs');
const Promise = require('bluebird');

const parse = require('./parse');

const readFile = Promise.promisify(fs.readFile);

module.exports = function ensureSassJson(env, annotation) {
  let promise = Promise.resolve();
  if (!env.sassjson) {
    if (!(env.herman && env.herman.sass && env.herman.sass.jsonfile)) {
      env.logger.warn(
        `Must pass in a \`sassjson\` file if using ${annotation} annotation.`
      );
      return Promise.reject();
    }
    // Read sassjson file and parse as JSON
    const filepath = env.herman.sass.jsonfile;
    promise = readFile(filepath, 'utf-8')
      .then(fileData => {
        env.sassjson = parse.sassJson(fileData);
      })
      .catch(err => {
        env.logger.warn(`Error reading file: ${filepath}\n${err.message}`);
      });
  }
  return promise;
};
