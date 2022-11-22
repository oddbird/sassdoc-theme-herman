'use strict';

const path = require('path');
const { pathToFileURL } = require('url');

let pnp;

/* istanbul ignore else */
if (process.versions.pnp) {
  try {
    // eslint-disable-next-line global-require
    const { findPnpApi } = require('module');
    pnp = findPnpApi(process.cwd());
  } catch (error) {
    // not in PnP; not a problem
  }
}

const resolved = new Map();

module.exports = {
  findFileUrl(url) {
    if (url.startsWith('~')) {
      /* istanbul ignore else */
      if (pnp) {
        // We need to resolve the imported path to a node module path. Instead of
        // re-creating the Sass import rules (where, for example,
        // ``@import 'foo'`` can be shorthand for ``@import 'foo/_index.scss'``),
        // we extract the module name from the full path, resolve that, then
        // re-add the rest of the path.
        const components = url.substring(1).split('/');
        // Adjust for scoped packages (e.g. ``@foo/bar``)...
        if (components[0].startsWith('@') && components.length > 1) {
          components[0] = components.slice(0, 2).join('/');
          components.splice(1, 1);
        }
        let res;
        if (resolved.has(components[0])) {
          res = resolved.get(components[0]);
        } else {
          res = pnp.resolveToUnqualified(components[0], `${process.cwd()}/`);
          resolved.set(components[0], res);
        }
        /* istanbul ignore if */
        if (res === null) {
          // No resolved module found... fall back to default Sass importer
          return null;
        }
        components[0] = res;
        return new URL(pathToFileURL(components.join('/')));
      }
      // Try loading file from "node_modules" dir
      /* istanbul ignore next */
      return new URL(
        pathToFileURL(path.resolve('node_modules', url.substring(1))),
      );
    }
    // Fall back to default Sass importer
    return null;
  },
};
