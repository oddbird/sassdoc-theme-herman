'use strict';

const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');

const del = require('del');
const sinon = require('sinon');

const assets = require('../../lib/utils/assets');

describe('assets', () => {
  before(function () {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function () {
    del.sync(`${this.dest}/*`);
  });

  it('Copies file from src to dest', function (done) {
    assets(__filename, this.dest)
      .then(() => fs.access(`${this.dest}/${path.parse(__filename).base}`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('Parses file', function (done) {
    const parser = sinon.fake();
    const env = 'foo';
    const opts = { parser, env };

    assets(__filename, this.dest, opts)
      .then(() => {
        const contents = parser.args[0][0].contents.toString();

        sinon.assert.calledOnce(parser);
        assert.ok(contents.includes('Parses file'));
        assert.strictEqual(parser.args[0][2], env);

        done();
      })
      .catch(done);
  });
});
