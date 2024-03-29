'use strict';

const fs = require('fs/promises');
const path = require('path');

const lunr = require('lunr');

const copy = require('./utils/assets');
const parse = require('./utils/parse');
const render = require('./utils/render');
const { getNunjucksEnv, templates } = require('./utils/templates');

const renderHerman = (origDest, ctx) => {
  const indexDest = path.join(origDest, 'index.html');
  const assetsSrc = path.resolve(__dirname, '../dist');
  const nunjucksEnv = getNunjucksEnv(ctx);

  // Store array of rendered text (for site-wide search)
  const rendered = [];

  const dest = path.resolve(origDest);

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
      path.join(dest, 'assets'),
    ).then(() => {
      if (copyShortcutIcon) {
        return copy(ctx.shortcutIcon.path, path.resolve(dest, 'assets/img/'));
      }
      return Promise.resolve();
    }),
  ];

  // Copy custom CSS asset
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
      }),
    );
  }

  // Copy custom source-map asset
  if (
    (ctx.customCSS || ctx.herman.customSourceMap) &&
    ctx.herman.customSourceMap !== false
  ) {
    promises.push(
      copy(
        ctx.herman.customSourceMap || `${ctx.customCSS.path}.map`,
        path.resolve(dest, 'assets/custom'),
      ),
    );
  }

  if (ctx.localFonts && ctx.localFonts.length) {
    promises.push(
      copy(ctx.localFonts, path.resolve(dest, 'assets/fonts/'), {
        base: path.resolve(ctx.dir, ctx.herman.fontPath),
      }),
    );
  }

  // Render a page for each item in `extraDocs`.
  if (ctx.extraDocs) {
    for (const { filename, name, text } of ctx.extraDocs) {
      const docDest = path.join(dest, `${filename}.html`);
      const docCtx = Object.assign({}, ctx, {
        pageTitle: name,
        activeGroup: filename,
        docText: text,
      });
      promises.push(
        render(nunjucksEnv, templates.extraDoc, docDest, docCtx, rendered),
      );
    }
  }

  const getRenderCtx = (context, groupName) => {
    let title;
    if (Object.prototype.hasOwnProperty.call(context.groups, groupName)) {
      title = context.groups[groupName];
    } else if (
      Object.prototype.hasOwnProperty.call(context.subgroupsByGroup, groupName)
    ) {
      title = context.groups[context.subgroupsByGroup[groupName]][groupName];
    }
    return Object.assign({}, context, {
      pageTitle: title,
      activeGroup: groupName,
      items: context.byGroup[groupName],
    });
  };

  // Render a page for each group, too.
  Object.getOwnPropertyNames(ctx.byGroup).forEach((groupName) => {
    const groupDest = path.join(dest, `${groupName}.html`);
    const groupCtx = getRenderCtx(ctx, groupName);
    promises.push(
      render(nunjucksEnv, templates.group, groupDest, groupCtx, rendered),
    );
  });

  // Render a search-results page.
  const searchDest = path.join(dest, 'search.html');
  const searchCtx = Object.assign({}, ctx, { activeGroup: 'search' });
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
      rendered.forEach((doc) => {
        this.add(doc);
        store[doc.filename] = doc;
      });
    });

    return fs.writeFile(
      path.join(dest, 'search-data.json'),
      JSON.stringify({
        idx,
        store,
      }),
      'utf8',
    );
  });
};

module.exports = {
  renderHerman,
};
