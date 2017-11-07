'use strict';

const assert = require('assert');
const sinon = require('sinon');

const prepareContext = require('../lib/prepareContext');

describe('prepareContext', function() {
  it('resolves to a context', function(done) {
    prepareContext({
      data: [],
      description: 'foo',
    }).then(ctx => {
      const expected = {
        display: {
          access: ['public', 'private'],
          alias: false,
          watermark: true,
        },
        groups: {
          undefined: 'General',
        },
        sort: ['group', 'file', 'line', 'access'],
        herman: { sass: {} },
        description: '<p>foo</p>\n',
        data: [],
        byGroup: {},
      };

      assert.deepEqual(ctx, expected);
      done();
    });
  });

  it('sets extraDocs', function(done) {
    prepareContext({
      data: [],
      logger: {
        warn: sinon.spy(),
      },
      herman: {
        extraDocs: [
          // TODO these will have to point to real things:
          `${__dirname}/extraDocs/simple.md`,
          {
            path: `${__dirname}/extraDocs/complex.md`,
            name: 'A complex doc',
          },
          `${__dirname}/no/such/file`,
        ],
      },
    })
      .then(ctx => {
        const simple = {
          filename: 'simple',
          name: 'simple',
          text: '<h1 id="a-simple-file">A simple file</h1>\n',
        };
        const complex = {
          filename: 'complex',
          name: 'A complex doc',
          text: '<h1 id="a-complex-file">A complex file</h1>\n',
        };
        assert(ctx.extraDocs.length == 2);
        assert.deepEqual(ctx.extraDocs[0], simple);
        assert.deepEqual(ctx.extraDocs[1], complex);
        done();
      })
      .catch(done);
  });

  it('loads a Sass JSON file', function(done) {
    const expected = {
      colors: {
        'brand-colors': {
          'brand-blue': '#0d7fa5',
          'brand-orange': '#c75000',
          'brand-pink': '#e2127a',
        },
      },
    };
    prepareContext({
      data: [],
      logger: {
        warn: sinon.spy(),
      },
      herman: {
        sass: {
          jsonfile: `${__dirname}/dist/css/json.css`,
        },
      },
    })
      .then(ctx => {
        assert.deepEqual(ctx.sassjson, expected);
        done();
      })
      .catch(done);
  });

  it('logs a missing Sass JSON file', function(done) {
    const warn = sinon.spy();
    prepareContext({
      data: [],
      logger: { warn },
      herman: {
        sass: {
          jsonfile: `${__dirname}/dist/css/missing-json.css`,
        },
      },
    })
      .then(ctx => {
        assert(warn.calledOnce);
        done();
      })
      .catch(done);
  });

  it('removes bogus context', function(done) {
    const expected = {
      context: {
        type: 'prose',
        line: undefined,
      },
      group: [],
      groupName: {},
      access: 'public',
    };
    prepareContext({
      data: [
        {
          context: {
            type: 'unknown',
            line: {
              start: 0,
              end: 1,
            },
          },
          group: [],
          access: 'public',
        },
      ],
      display: {
        access: ['private', 'public'],
      },
    })
      .then(ctx => {
        assert.deepEqual(ctx.data[0], expected);
        done();
      })
      .catch(done);
  });
});
