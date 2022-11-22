'use strict';

const beautify = require('html').prettyPrint;
const stripIndent = require('strip-indent');

const renderIframe = require('../renderIframe');
const getCustomNunjucksEnv = require('../utils/getCustomNunjucksEnv');
const sassImporter = require('../utils/sassImporter');

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
  let sass;
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
              try {
                // eslint-disable-next-line global-require
                sass = require('sass');
              } catch (err) /* istanbul ignore next */ {
                env.logger.warn(
                  'Cannot find Dart Sass (`sass`) dependency, which is ' +
                    'required when using `@example scss` annotation.',
                );
                env.logger.warn(err);
                return;
              }
            }
            let sassData = exampleItem.code;
            let sassOptions = { importers: [sassImporter] };
            /* istanbul ignore else */
            if (env.herman && env.herman.sass) {
              if (env.herman.sass.includes) {
                const arr = env.herman.sass.includes;
                for (let i = arr.length - 1; i >= 0; i = i - 1) {
                  sassData = `@import '${arr[i]}';\n${sassData}`;
                }
              }
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
              if (env.herman.sass.importers) {
                sassOptions.importers = env.herman.sass.importers;
              }
              sassOptions = {
                ...sassOptions,
                ...env.herman.sass.sassOptions,
              };
            }
            /* istanbul ignore else */
            if (sass) {
              const promise = sass
                .compileStringAsync(sassData, sassOptions)
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
          const iframePromise = Promise.all(sassPromises).then(() =>
            renderIframe(env, exampleItem, 'example'),
          );
          iFramePromises.push(iframePromise);
        });
      });
      return Promise.all(iFramePromises);
    },
  };
};
