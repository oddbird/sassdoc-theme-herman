'use strict';

const extend = require('extend');
const path = require('path');
const Promise = require('bluebird');
const tinycolor = require('tinycolor2');

const copy = require('./utils/assets');
const parse = require('./utils/parse');
const render = require('./utils/render');
const { nunjucksEnv, templates } = require('./utils/templates');

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

  // Construct a list of all pages-to-be-rendered,
  // to be scraped for sitewide search (Tipue.js)
  let pagesToIndex = [
    '/',
    ...Object.getOwnPropertyNames(ctx.byGroup).map(
      groupName => `/${groupName}.html`
    ),
  ];
  if (ctx.extraDocs) {
    pagesToIndex = pagesToIndex.concat(
      ...ctx.extraDocs.map(doc => `/${doc.filename}.html`)
    );
  }
  ctx.pagesToIndex = JSON.stringify(pagesToIndex);

  // render the index template and copy the static assets.
  const promises = [
    render(nunjucksEnv, templates.index, indexDest, ctx),
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
      copy(ctx.customCSS.path, path.resolve(dest, 'assets/css/custom'), {
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
      promises.push(render(nunjucksEnv, templates.extraDoc, docDest, docCtx));
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
    promises.push(render(nunjucksEnv, templates.group, groupDest, groupCtx));
  });

  // Render a search-results page.
  const searchDest = path.join(dest, 'search.html');
  promises.push(render(nunjucksEnv, templates.search, searchDest, ctx));

  return Promise.all(promises);
};

module.exports = {
  makeNunjucksColors,
  renderHerman,
};
