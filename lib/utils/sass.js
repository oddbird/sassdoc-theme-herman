'use strict';

// Returns Sass implementation (or `null`)
const getSassImplementation = (env) => {
  if (
    env.herman?.sass?.implementation &&
    typeof env.herman.sass.implementation !== 'string'
  ) {
    return env.herman.sass.implementation;
  }
  const sassPkg = env.herman?.sass?.implementation ?? 'sass';
  try {
    // eslint-disable-next-line global-require
    return require(sassPkg);
  } catch (err) /* istanbul ignore next */ {
    env.logger.warn(
      `Cannot find Dart Sass (\`${sassPkg}\`) dependency, ` +
        'which is required when using the `@example scss` annotation.',
    );
    env.logger.warn(err);
    return null;
  }
};

// Returns Promise that resolves with Sass AsyncCompiler (or `null`)
const getSassCompilerPromise = (env, sass) => {
  try {
    return sass.initAsyncCompiler();
  } catch (err) /* istanbul ignore next */ {
    env.logger.warn(
      'Cannot find Sass `initAsyncCompiler`,' +
        ' which is available since Dart Sass v1.70.0.',
    );
    env.logger.warn(err);
    return null;
  }
};

// Returns array of default Sass importers (`NodePackageImporter`)
const getSassImporters = (env, sass) => {
  try {
    return [new sass.NodePackageImporter()];
  } catch (err) /* istanbul ignore next */ {
    env.logger.warn(
      'Cannot find default importer `sass.NodePackageImporter`,' +
        ' which is available since Dart Sass v1.71.0.',
    );
    env.logger.warn(err);
    return [];
  }
};

module.exports = {
  getSassImplementation,
  getSassCompilerPromise,
  getSassImporters,
};
