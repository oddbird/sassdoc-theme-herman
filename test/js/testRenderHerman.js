'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const Promise = require('bluebird');

const prepareContext = require('../../lib/prepareContext');
const renderHerman = require('../../lib/renderHerman');

const access = Promise.promisify(fs.access);

describe('renderHerman', function() {
  before(function() {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function() {
    del.sync(`${this.dest}/*`);
  });

  it('does the herman things', function(done) {
    prepareContext({
      data: [],
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/index.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('copies an internal shortcutIcon', function(done) {
    const shortcutIcon = `${__dirname}/files/favicon.ico`;
    const expectedShortcutIcon = `${this.dest}/assets/img/favicon.ico`;
    prepareContext({
      data: [],
      shortcutIcon,
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => access(expectedShortcutIcon))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('ignores an external shortcutIcon', function(done) {
    const expectedShortcutIcon = `${this.dest}/assets/img/favicon.ico`;
    prepareContext({
      data: [],
      shortcutIcon: 'http://example.com/img/favicon.ico',
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => access(expectedShortcutIcon))
      .then(() => {
        // The file should not have been copied
        assert.fail();
        done();
      })
      .catch(() => {
        assert.ok(true);
        done();
      });
  });

  it('handles customCSS', function(done) {
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/files/main.css`,
      },
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/assets/css/custom/main.css`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('handles customCSSFiles', function(done) {
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/files/main.css`,
      },
      customCSSFiles: [`${__dirname}/files/icons/not-an-svg-icon.png`],
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/assets/custom/not-an-svg-icon.png`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('resolves local fonts', function(done) {
    prepareContext({
      herman: {
        fontpath: 'files/fonts',
      },
      data: [],
      localFonts: [`${__dirname}/files/fonts/sample.ttf`],
    })
      .then(ctx => {
        ctx.dir = __dirname;
        return renderHerman(this.dest, ctx);
      })
      .then(() => access(`${this.dest}/assets/fonts/sample.ttf`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('renders extraDocs', function(done) {
    prepareContext({
      data: [],
      extraDocs: [
        {
          filename: 'simple',
          name: 'simple',
          text: '<h1 id="a-simple-file">A simple file</h1>\n',
        },
      ],
    })
      .then(ctx => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/simple.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
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
      .then(() => access(`${this.dest}/group1.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });
});
