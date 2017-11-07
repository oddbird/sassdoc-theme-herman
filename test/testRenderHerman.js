'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');

const prepareContext = require('../lib/prepareContext');
const renderHerman = require('../lib/renderHerman');

describe('renderHerman', function() {
  it('does the herman things', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        fs.access(`${dest}/index.html`, err => {
          assert.equal(err, undefined);

          del(`${dest}/*`).then(() => {
            done();
          });
        });
      });
  });

  it('copies an internal shortcutIcon', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      shortcutIcon: `${__dirname}/assets/img/favicon.ico`,
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('ignores an external shortcutIcon', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      shortcutIcon: 'http://example.com/img/favicon.ico',
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('handles customCSS', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/dest/assets/css/main.css`,
      },
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('handles customCSS and customCSSFiles', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/dest/assets/css/main.css`,
      },
      customCSSFiles: [`${__dirname}/dest/assets/css/main.css`],
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('resolves local fonts', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      herman: {
        fontpath: '/path',
      },
      dir: '.',
      data: [],
      localFonts: [`${__dirname}/dest/assets/fonts/sample.ttf`],
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('renders extraDocs', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [],
      extraDocs: [
        {
          filename: '',
          name: '',
          text: '',
        },
      ],
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('renders a page for each group', function(done) {
    const dest = `${__dirname}/dest`;
    prepareContext({
      data: [
        {
          description: 'This is some text',
          context: {
            type: 'variable',
          },
          group: ['group1'],
          access: 'public',
        },
      ],
      groups: {
        group1: 'Group 1',
      },
      display: {
        access: ['private', 'public'],
      },
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });

  it('renders subprojects', function(done) {
    const dest = `${__dirname}/dest`;
    const item = {
      description: 'This is some text',
      context: {
        type: 'variable',
      },
      group: ['group1'],
      access: 'public',
    };
    prepareContext({
      data: [],
      subprojects: {
        subproj: {
          data: [item],
          groups: {
            group1: 'Group 1',
          },
          display: {
            access: ['private', 'public'],
          },
          // @@@ I think this denotes a bug; for top-level projects, we don't
          // have to set byGroup explicitly, but on this nested project, we
          // must:
          byGroup: {
            group1: item,
          },
        },
      },
    })
      .then(ctx => renderHerman(dest, ctx))
      .then(() => {
        // assert something?
        done();
      });
  });
});
