'use strict';

const assert = require('assert');
const extend = require('extend');
const sinon = require('sinon');

const prepareContext = require('../../lib/prepareContext');

describe('prepareContext', () => {
  it('resolves to a context', (done) => {
    prepareContext({
      data: [],
      description: 'foo',
    })
      .then((ctx) => {
        const expected = {
          display: {
            access: ['public', 'private'],
            alias: false,
            watermark: true,
          },
          groups: {
            undefined: 'General',
          },
          orderedGroups: ['undefined'],
          subgroupsByGroup: {},
          sort: ['group', 'file', 'line', 'access'],
          herman: {
            nunjucks: {},
            sass: {},
          },
          description: '<p>foo</p>\n',
          data: [],
          byGroup: {},
        };

        assert.deepEqual(ctx, expected);
        done();
      })
      .catch(done);
  });

  it('sets extraDocs', (done) => {
    const warn = sinon.fake();
    prepareContext({
      data: [],
      herman: {
        extraDocs: [
          `${__dirname}/fixtures/markdown/simple.md`,
          {
            path: `${__dirname}/fixtures/markdown/complex.md`,
            name: 'A complex doc',
          },
          {
            path: `${__dirname}/fixtures/markdown/complex.md`,
          },
          `${__dirname}/no/such/file`,
        ],
      },
      logger: {
        warn,
      },
    })
      .then((ctx) => {
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
        const complex2 = {
          filename: 'complex',
          name: 'complex',
          text: '<h1 id="a-complex-file">A complex file</h1>\n',
        };
        assert.deepEqual(ctx.extraDocs, [simple, complex, complex2]);
        sinon.assert.calledOnce(warn);
        done();
      })
      .catch(done);
  });

  it('sets extraLinks', (done) => {
    prepareContext({
      data: [],
      herman: {
        extraLinks: ['http://oddbird.net'],
      },
    })
      .then((ctx) => {
        assert.deepEqual(ctx.extraLinks, ['http://oddbird.net']);
        done();
      })
      .catch(done);
  });

  it('loads a Sass JSON file', (done) => {
    prepareContext({
      data: [],
      herman: {
        sass: {
          jsonFile: `${__dirname}/fixtures/css/json.css`,
        },
      },
    })
      .then((ctx) => {
        assert.ok(ctx.sassjson.colors !== undefined);
        done();
      })
      .catch(done);
  });

  it('logs a missing Sass JSON file', (done) => {
    const warn = sinon.fake();
    prepareContext({
      data: [],
      logger: { warn },
      herman: {
        sass: {
          jsonFile: `${__dirname}/fixtures/css/missing-json.css`,
        },
      },
    })
      .then(() => {
        sinon.assert.calledOnce(warn);
        done();
      })
      .catch(done);
  });

  it('removes bogus context', (done) => {
    const item = {
      commentRange: {
        start: 0,
        end: 5,
      },
      context: {
        type: 'unknown',
        line: {
          start: 10,
          end: 15,
        },
      },
      file: {},
      group: ['test'],
      access: 'public',
    };
    const item2 = {
      commentRange: {
        start: 0,
        end: 5,
      },
      context: {
        name: 'Test\nItem',
        line: {
          start: 6,
          end: 7,
        },
      },
      file: {},
      group: ['test'],
      access: 'public',
    };
    const expected = [
      extend({}, item, {
        context: {
          type: 'prose',
          line: {
            start: 0,
            end: 5,
          },
        },
        groupName: {
          test: 'test',
        },
      }),
      extend({}, item2, {
        groupName: {
          test: 'test',
        },
      }),
    ];
    prepareContext({
      data: [item, item2],
    })
      .then((ctx) => {
        assert.deepEqual(ctx.data, expected);
        done();
      })
      .catch(done);
  });

  it('warns if prose block uses custom annotation with key', (done) => {
    const logger = { warn: sinon.fake() };
    const item = {
      commentRange: {
        start: 0,
        end: 5,
      },
      context: {
        name: 'Test\nItem',
        line: {
          start: 8,
          end: 10,
        },
      },
      colors: { key: '' },
      file: {},
      group: ['test'],
      access: 'public',
    };
    const expected = [
      extend({}, item, {
        context: {
          type: 'prose',
          line: {
            start: 0,
            end: 5,
          },
        },
        groupName: {
          test: 'test',
        },
      }),
    ];
    prepareContext({
      logger,
      data: [item],
    })
      .then((ctx) => {
        assert.deepEqual(ctx.data, expected);
        sinon.assert.calledOnce(logger.warn);
        done();
      })
      .catch(done);
  });
});
