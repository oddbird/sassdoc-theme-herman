/* eslint-disable no-sync, no-console */

'use strict';

const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const set = require('lodash/set');
const sassdoc = require('sassdoc');

const getAsset = function (entry, ext = 'css') {
  if (!entry) {
    return undefined;
  }
  let asset;
  for (const thisPath of entry) {
    if (thisPath.slice(0 - (ext.length + 1)) === `.${ext}`) {
      asset = thisPath;
    }
  }
  return asset;
};

class SassDocPlugin {
  constructor(opts, pluginOptions) {
    let options = opts;
    if (!options) {
      try {
        // Load .sassdocrc configuration
        options = yaml.load(
          fs.readFileSync(path.join(process.cwd(), '.sassdocrc'), 'utf-8'),
        );
      } catch (err) {
        console.warn(err);
        throw new Error(`Invalid or no .sassdocrc found in: ${process.cwd()}`);
      }
    }

    if (!options.src) {
      throw new Error('SassDoc Webpack Plugin: `src` is not defined');
    }

    this.options = options;
    this.pluginOptions = pluginOptions;
  }

  apply(compiler) {
    const self = this;

    compiler.hooks.afterEmit.tapPromise('SassDocPlugin', (compilation) => {
      if (self.pluginOptions && self.pluginOptions.assetPaths) {
        const statsJSON = compilation.getStats().toJson();
        const outputPath = self.pluginOptions.outputPath || process.cwd();
        for (const { entry, ext, optPath } of self.pluginOptions.assetPaths) {
          const asset = getAsset(statsJSON.assetsByChunkName[entry], ext);
          if (asset) {
            set(self.options, optPath, path.join(outputPath, asset));
          }
        }
      }

      return sassdoc(self.options.src, self.options).catch(console.error);
    });
  }
}

module.exports = SassDocPlugin;
