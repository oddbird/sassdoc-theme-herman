'use strict';

const fs = require('fs');

const assert = require('assert');
const del = require('del');
const Promise = require('bluebird');

const prepareContext = require('../../lib/prepareContext');
const { renderHerman, makeNunjucksColors } = require('../../lib/renderHerman');

const access = Promise.promisify(fs.access);

describe('makeNunjucksColors', function () {
  before(function () {
    this.colors = makeNunjucksColors({
      herman: {
        displayColors: undefined,
      },
    });
  });

  it('exits early on invalid colors', function () {
    const actual = this.colors('not a color');
    assert.equal(actual, undefined);
  });

  it('switches on formats', function () {
    const actual = this.colors('#fefced');
    const expected = {
      hex: '#fefced',
      rgb: 'rgb(254, 252, 237)',
      hsl: 'hsl(53, 89%, 96%)',
    };
    assert.deepEqual(actual, expected);
  });

  it('handles rgba and hsla', function () {
    const colors = makeNunjucksColors({
      herman: {
        displayColors: ['rgba', 'hsla'],
      },
    });
    const actual = colors('#fefced');
    const expected = {
      rgb: 'rgb(254, 252, 237)',
      hsl: 'hsl(53, 89%, 96%)',
    };
    assert.deepEqual(actual, expected);
  });

  it('passes on unknown format', function () {
    const colors = makeNunjucksColors({
      herman: {
        displayColors: ['blorble'],
      },
    });
    const actual = colors('#fefced');
    const expected = {};
    assert.deepEqual(actual, expected);
  });
});

describe('renderHerman', function () {
  before(function () {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function () {
    del.sync(`${this.dest}/*`);
  });

  it('renders index template', function (done) {
    prepareContext({
      data: [],
    })
      .then((ctx) => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/index.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('copies an internal shortcutIcon', function (done) {
    const shortcutIcon = `${__dirname}/fixtures/img/favicon.ico`;
    const expectedShortcutIcon = `${this.dest}/assets/img/favicon.ico`;
    prepareContext({
      data: [],
      shortcutIcon,
    })
      .then((ctx) => renderHerman(this.dest, ctx))
      .then(() => access(expectedShortcutIcon))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('ignores an external shortcutIcon', function (done) {
    const expectedShortcutIcon = `${this.dest}/assets/img/favicon.ico`;
    prepareContext({
      data: [],
      shortcutIcon: 'http://example.com/img/favicon.ico',
    })
      .then((ctx) => renderHerman(this.dest, ctx))
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

  it('handles customCSS', function (done) {
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/fixtures/css/main.css`,
      },
    })
      .then((ctx) => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/assets/custom/main.css`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('handles customCSSFiles', function (done) {
    prepareContext({
      data: [],
      customCSS: {
        path: `${__dirname}/fixtures/css/main.css`,
      },
      customCSSFiles: [`${__dirname}/fixtures/icons/not-an-svg-icon.png`],
    })
      .then((ctx) => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/assets/custom/not-an-svg-icon.png`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('resolves local fonts', function (done) {
    prepareContext({
      herman: {
        fontpath: 'fixtures/fonts',
      },
      data: [],
      localFonts: [`${__dirname}/fixtures/fonts/sample.ttf`],
    })
      .then((ctx) => {
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

  it('renders extraDocs', function (done) {
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
      .then((ctx) => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/simple.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('renders a page for each group', function (done) {
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
        {
          description: 'This is more text',
          context: {
            type: 'variable',
          },
          group: ['group2'],
          access: 'public',
        },
        {
          description: 'This is yet more text',
          context: {
            type: 'variable',
          },
          group: ['fail'],
          access: 'public',
        },
      ],
      groups: {
        'Group 1 Parent': {
          group1: 'Group 1',
        },
        group2: 'Group 2',
      },
      display: {
        access: ['private', 'public'],
      },
    })
      .then((ctx) => {
        // Test group that doesn't exist
        delete ctx.groups.fail;
        return renderHerman(this.dest, ctx);
      })
      .then(() => access(`${this.dest}/group1.html`))
      .then(() => access(`${this.dest}/group2.html`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('generates search data', function (done) {
    prepareContext({
      data: [],
    })
      .then((ctx) => renderHerman(this.dest, ctx))
      .then(() => access(`${this.dest}/search-data.json`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });
});
