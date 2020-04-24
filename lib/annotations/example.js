'use strict';

const beautify = require('html').prettyPrint;
const path = require('path');
const Promise = require('bluebird');
const stripIndent = require('strip-indent');

const getNunjucksEnv = require('../utils/getNunjucksEnv');
const renderIframe = require('../renderIframe');

const beautifyOpts = {
  indent_size: 2,
  max_char: 0,
};

/**
 * Custom `@example` annotation.
 *
 * Augments the normal sassdoc @example annotation.
 * If example language is 'njk' (nunjucks), render the example
 * and put the result in the `rendered` property of the parsed example.
 */
module.exports = env => {
  // eslint-disable-next-line global-require
  const baseExampleFn = require('sassdoc/dist/annotation/annotations/example')
    .default;
  const baseExample = baseExampleFn();
  let renderSass;
  return {
    name: 'example',
    parse: baseExample.parse,
    resolve: data => {
      let customNjkEnv;
      let warned = false;
      const iFramePromises = [];
      const sassPromises = [];
      data.forEach(item => {
        if (!item.example) {
          return;
        }
        item.example.forEach(exampleItem => {
          if (exampleItem.type === 'html') {
            exampleItem.rendered = beautify(
              stripIndent(exampleItem.code),
              beautifyOpts
            );
          } else if (exampleItem.type === 'njk') {
            if (!customNjkEnv) {
              customNjkEnv = getNunjucksEnv('Nunjucks @example', env, warned);
            }
            if (!customNjkEnv) {
              warned = true;
              return;
            }
            exampleItem.rendered = beautify(
              stripIndent(customNjkEnv.renderString(exampleItem.code)),
              beautifyOpts
            ).trim();
          } else if (exampleItem.type === 'scss') {
            exampleItem.rendered = undefined;
            if (!renderSass) {
              try {
                let implementation = 'node-sass';
                if (
                  env.herman &&
                  env.herman.sass &&
                  env.herman.sass.implementation
                ) {
                  implementation = env.herman.sass.implementation;
                }
                if (typeof implementation === 'string') {
                  // eslint-disable-next-line global-require
                  implementation = require(implementation);
                }
                renderSass = Promise.promisify(implementation.render);
              } catch (err) {
                env.logger.warn(
                  'Cannot find Sass module, which is required ' +
                    'when using `@example scss` annotation.'
                );
                env.logger.warn(err);
                return;
              }
            }
            let sassData = exampleItem.code;
            let includepaths = [];
            let outputStyle = 'expanded';
            if (env.herman && env.herman.sass) {
              if (env.herman.sass.includes) {
                const arr = env.herman.sass.includes;
                for (let i = arr.length - 1; i >= 0; i = i - 1) {
                  sassData = `@import '${arr[i]}';\n${sassData}`;
                }
              }
              if (env.herman.sass.includepaths) {
                includepaths = env.herman.sass.includepaths;
              }
              if (env.herman.sass.outputstyle) {
                outputStyle = env.herman.sass.outputstyle;
              }
            }
            const promise = renderSass({
              data: sassData,
              importer: url => {
                if (url[0] === '~') {
                  url = path.resolve('node_modules', url.substr(1));
                }
                return { file: url };
              },
              includePaths: includepaths,
              outputStyle,
            })
              .then(rendered => {
                const encoded = rendered.css.toString('utf-8');
                exampleItem.rendered = encoded;
              })
              .catch(err => {
                env.logger.warn(
                  'Error compiling @example scss: \n' +
                    `${err.message}\n${sassData}`
                );
              });
            sassPromises.push(promise);
          }
          const iframePromise = Promise.all(sassPromises).then(() =>
            renderIframe(env, exampleItem, 'example')
          );
          iFramePromises.push(iframePromise);
        });
      });
      return Promise.all(iFramePromises);
    },
  };
};
