'use strict';

const beautify = require('html').prettyPrint;
const stripIndent = require('strip-indent');

const renderIframe = require('../renderIframe');
const getCustomNunjucksEnv = require('../utils/getCustomNunjucksEnv');

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
module.exports = (env) => {
  const baseExampleFn =
    // eslint-disable-next-line global-require
    require('sassdoc/dist/annotation/annotations/example').default;
  const baseExample = baseExampleFn();
  let sass, sassCompiler;
  return {
    ...baseExample,
    resolve: (data) => {
      let customNjkEnv;
      let warned = false;
      const iFramePromises = [];
      const sassPromises = [];
      data.forEach((item) => {
        if (!item.example) {
          return;
        }
        item.example.forEach((exampleItem) => {
          if (exampleItem.type === 'html') {
            exampleItem.rendered = beautify(
              stripIndent(exampleItem.code),
              beautifyOpts,
            );
          } else if (exampleItem.type === 'njk') {
            if (!customNjkEnv) {
              customNjkEnv = getCustomNunjucksEnv(
                'Nunjucks @example',
                env,
                warned,
              );
            }
            if (!customNjkEnv) {
              warned = true;
              return;
            }
            exampleItem.rendered = beautify(
              stripIndent(customNjkEnv.renderString(exampleItem.code)),
              beautifyOpts,
            ).trim();
          } else if (exampleItem.type === 'scss') {
            exampleItem.rendered = undefined;
            /* istanbul ignore else */
            if (!sass) {
              if (
                env.herman?.sass?.implementation &&
                typeof env.herman.sass.implementation !== 'string'
              ) {
                sass = env.herman.sass.implementation;
              } else {
                const sassPkg = env.herman?.sass?.implementation ?? 'sass';
                try {
                  // eslint-disable-next-line global-require
                  sass = require(sassPkg);
                } catch (err) /* istanbul ignore next */ {
                  env.logger.warn(
                    `Cannot find Dart Sass (\`${sassPkg}\`) dependency, ` +
                      'which is required when using the `@example scss` annotation.',
                  );
                  env.logger.warn(err);
                  return;
                }
              }
            }
            /* istanbul ignore else */
            if (sass && !sassCompiler) {
              try {
                sassCompiler = sass.initAsyncCompiler();
              } catch (err) /* istanbul ignore next */ {
                env.logger.warn(
                  'Cannot find Sass `initAsyncCompiler`,' +
                    ' which is available since Dart Sass v1.70.0.',
                );
                env.logger.warn(err);
                return;
              }
            }
            let sassData = exampleItem.code;
            let sassOptions = {};
            /* istanbul ignore else */
            if (env.herman && env.herman.sass) {
              if (env.herman.sass.use) {
                const arr = env.herman.sass.use;
                for (let i = arr.length - 1; i >= 0; i = i - 1) {
                  const use = arr[i];
                  const isString = typeof use === 'string';
                  const isObj = !isString && use.file && use.namespace;
                  if (isObj) {
                    // eslint-disable-next-line max-len
                    sassData = `@use '${use.file}' as ${use.namespace};\n${sassData}`;
                  } else if (isString) {
                    sassData = `@use '${use}';\n${sassData}`;
                  }
                }
              }
              if (sass && !env.herman.sass.sassOptions?.importers) {
                try {
                  sassOptions.importers = [new sass.NodePackageImporter()];
                } catch (err) /* istanbul ignore next */ {
                  env.logger.warn(
                    'Cannot find default importer `sass.NodePackageImporter`,' +
                      ' which is available since Dart Sass v1.71.0.',
                  );
                  env.logger.warn(err);
                  return;
                }
              }
              sassOptions = {
                ...sassOptions,
                ...env.herman.sass.sassOptions,
              };
            }
            /* istanbul ignore else */
            if (sass && sassCompiler) {
              const promise = sassCompiler
                .then((compiler) =>
                  compiler.compileStringAsync(sassData, sassOptions),
                )
                .then(({ css }) => {
                  exampleItem.rendered = css;
                })
                .catch((err) => {
                  env.logger.warn(
                    'Error compiling @example scss: \n' +
                      `${err.message}\n${sassData}`,
                  );
                });
              sassPromises.push(promise);
            }
          }
          const iframePromise = Promise.all(sassPromises)
            .then(() => {
              if (sassCompiler) {
                sassCompiler.then((compiler) => {
                  compiler.dispose();
                });
                sassCompiler = undefined;
              }
            })
            .then(() => renderIframe(env, exampleItem, 'example'));
          iFramePromises.push(iframePromise);
        });
      });
      return Promise.all(iFramePromises);
    },
  };
};
