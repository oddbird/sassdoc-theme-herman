'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const Promise = require('bluebird');

const prepareContext = require('../lib/prepareContext');
const renderHerman = require('../lib/renderHerman');

const rmdir = Promise.promisify(fs.rmdir);
const mkdir = Promise.promisify(fs.mkdir);
const access = Promise.promisify(fs.access);

describe('renderHerman', function() {
  beforeEach(function(done) {
    this.dest = `${__dirname}/dest`;
    rmdir(this.dest)
      .then(
        () => {
          return mkdir(this.dest);
        },
        error => {}
      )
      .then(done, done);
  });

  it('does the herman things', function(done) {
    prepareContext({
      data: [],
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        fs.access(`${this.dest}/index.html`, err => {
          assert.equal(err, undefined);

          del(`${this.dest}/*`).then(() => {
            done();
          });
        });
      });
  });

  it('copies an internal shortcutIcon', function(done) {
    const shortcutIcon = `${__dirname}/assets/img/favicon.ico`;
    const expectedShortcutIcon = `${__dirname}/dest/assets/img/favicon.ico`;
    prepareContext({
      data: [],
      shortcutIcon,
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        return access(shortcutIcon);
      })
      .then(() => {
        // We only get here if the file is accessible.
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('ignores an external shortcutIcon', function(done) {
    prepareContext({
      data: [],
      shortcutIcon: 'http://example.com/img/favicon.ico',
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });

  it('handles customCSS', function(done) {
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/dest/assets/css/main.css`,
      },
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });

  it('handles customCSS and customCSSFiles', function(done) {
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/dest/assets/css/main.css`,
      },
      customCSSFiles: [`${__dirname}/dest/assets/css/main.css`],
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });

  it('resolves local fonts', function(done) {
    prepareContext({
      herman: {
        fontpath: '/path',
      },
      dir: '.',
      data: [],
      localFonts: [`${__dirname}/dest/assets/fonts/sample.ttf`],
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });

  it('renders extraDocs', function(done) {
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
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });

  it('renders a page for each group', function(done) {
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
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });

  it('renders subprojects', function(done) {
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
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => {
        // TODO
        // assert something?
        done();
      });
  });
});
