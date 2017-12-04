'use strict';

const extend = require('extend');
const fs = require('fs');
const lunr = require('lunr');
const path = require('path');
const Promise = require('bluebird');
const tinycolor = require('tinycolor2');

const copy = require('./utils/assets');
const parse = require('./utils/parse');
const render = require('./utils/render');
const { nunjucksEnv, templates } = require('./utils/templates');

const writeFile = Promise.promisify(fs.writeFile);

const makeNunjucksColors = ctx => input => {
  const color = tinycolor(input);
  if (!color.isValid()) {
    return null;
  }
  const obj = {};
  const formats = ctx.herman.displayColors || ['hex', 'rgb', 'hsl'];
  formats.forEach(format => {
    let fn;
    switch (format) {
      case 'hex':
        fn = 'toHexString';
        break;
      case 'rgb':
        fn = 'toRgbString';
        break;
      case 'rgba':
        format = 'rgb';
        fn = 'toRgbString';
        break;
      case 'hsl':
        fn = 'toHslString';
        break;
      case 'hsla':
        format = 'hsl';
        fn = 'toHslString';
        break;
    }
    if (fn) {
      obj[format] = color[fn]();
    }
  });
  return obj;
};

const renderHerman = (dest, ctx) => {
  const indexDest = path.join(dest, 'index.html');
  const assetsSrc = path.resolve(__dirname, '../dist');

  // Store array of rendered text (for site-wide search)
  const rendered = [];

  // Accepts a color (in any format) and returns an object with hex, rgba, and
  // hsla strings.
  nunjucksEnv.addFilter('colors', makeNunjucksColors(ctx));

  dest = path.resolve(dest);

  // check if we need to copy a favicon file or use the default
  let copyShortcutIcon = false;
  if (!ctx.shortcutIcon) {
    ctx.shortcutIcon = { type: 'internal', url: 'assets/img/favicon.ico' };
  } else if (ctx.shortcutIcon.type === 'internal') {
    ctx.shortcutIcon.url = `assets/img/${ctx.shortcutIcon.url}`;
    copyShortcutIcon = true;
  }

  // render the index template and copy the static assets.
  const promises = [
    render(nunjucksEnv, templates.index, indexDest, ctx, rendered),
    copy(
      path.join(assetsSrc, '/**/*.{css,js,ico,map}'),
      path.join(dest, 'assets')
    ).then(() => {
      if (copyShortcutIcon) {
        return copy(ctx.shortcutIcon.path, path.resolve(dest, 'assets/img/'));
      }
      return Promise.resolve();
    }),
  ];

  if (ctx.customCSS) {
    promises.push(
      copy(ctx.customCSS.path, path.resolve(dest, 'assets/custom'), {
        parser: parse.customCSS,
        env: ctx,
      }).then(() => {
        if (ctx.customCSSFiles && ctx.customCSSFiles.length) {
          return copy(ctx.customCSSFiles, path.resolve(dest, 'assets/custom'), {
            base: ctx.dir,
          });
        }
        return Promise.resolve();
      })
    );
  }

  if (ctx.localFonts && ctx.localFonts.length) {
    promises.push(
      copy(ctx.localFonts, path.resolve(dest, 'assets/fonts/'), {
        base: path.resolve(ctx.dir, ctx.herman.fontpath),
      })
    );
  }

  // Render a page for each item in `extraDocs`.
  if (ctx.extraDocs) {
    for (const { filename, name, text } of ctx.extraDocs) {
      const docDest = path.join(dest, `${filename}.html`);
      const docCtx = extend({}, ctx, {
        pageTitle: name,
        activeGroup: filename,
        docText: text,
      });
      promises.push(
        render(nunjucksEnv, templates.extraDoc, docDest, docCtx, rendered)
      );
    }
  }

  const getRenderCtx = (context, groupName) =>
    extend({}, context, {
      pageTitle: context.groups[groupName],
      activeGroup: groupName,
      items: context.byGroup[groupName],
    });

  // Render a page for each group, too.
  Object.getOwnPropertyNames(ctx.byGroup).forEach(groupName => {
    const groupDest = path.join(dest, `${groupName}.html`);
    const groupCtx = getRenderCtx(ctx, groupName);
    promises.push(
      render(nunjucksEnv, templates.group, groupDest, groupCtx, rendered)
    );
  });

  // Render a search-results page.
  const searchDest = path.join(dest, 'search.html');
  const searchCtx = extend({}, ctx, { activeGroup: 'search' });
  promises.push(render(nunjucksEnv, templates.search, searchDest, searchCtx));

  return Promise.all(promises).then(() => {
    // Write lunr.js search index
    const store = {};
    const idx = lunr(function config() {
      this.ref('filename');
      this.field('title');
      this.field('contents');
      // Expose position data of search matches
      this.metadataWhitelist = ['position'];

      // Sort array for consistent search-data ordering (prevent junk diffs)
      rendered.sort((a, b) => {
        const nameA = a.filename.toLowerCase();
        const nameB = b.filename.toLowerCase();
        /* istanbul ignore next */
        return nameA < nameB ? -1 : 1;
      });
      rendered.forEach(doc => {
        this.add(doc);
        store[doc.filename] = doc;
      });
    });

    return writeFile(
      path.join(dest, 'search-data.json'),
      JSON.stringify({
        idx,
        store,
      }),
      'utf8'
    );
  });
};

module.exports = {
  makeNunjucksColors,
  renderHerman,
};
