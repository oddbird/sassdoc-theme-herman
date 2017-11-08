'use strict';

const assert = require('assert');
const extend = require('extend');
const sinon = require('sinon');

const prepareContext = require('../../lib/prepareContext');

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
    const warn = sinon.spy();
    prepareContext({
      data: [],
      herman: {
        extraDocs: [
          `${__dirname}/files/simple.md`,
          {
            path: `${__dirname}/files/complex.md`,
            name: 'A complex doc',
          },
          `${__dirname}/no/such/file`,
        ],
      },
      logger: {
        warn,
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
        assert.deepEqual(ctx.extraDocs.sort(), [simple, complex]);
        sinon.assert.calledOnce(warn);
        done();
      })
      .catch(done);
  });

  it('loads a Sass JSON file', function(done) {
    const expected = {
      colors: {
        'brand-colors': {
          'brand-orange': '#c75000',
        },
      },
    };
    prepareContext({
      data: [],
      herman: {
        sass: {
          jsonfile: `${__dirname}/files/json.css`,
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
          jsonfile: `${__dirname}/files/missing-json.css`,
        },
      },
    })
      .then(() => {
        sinon.assert.calledOnce(warn);
        done();
      })
      .catch(done);
  });

  it('removes bogus context', function(done) {
    const item = {
      commentRange: {
        start: 0,
        end: 5,
      },
      context: {
        type: 'unknown',
        name: 'Test\nItem',
        line: {
          start: 10,
          end: 15,
        },
      },
      group: [],
      access: 'public',
    };
    const expected = extend({}, item, {
      context: {
        type: 'prose',
        line: {
          start: 0,
          end: 5,
        },
      },
      groupName: {},
    });
    prepareContext({
      data: [item],
    })
      .then(ctx => {
        assert.deepEqual(ctx.data[0], expected);
        done();
      })
      .catch(done);
  });
});
