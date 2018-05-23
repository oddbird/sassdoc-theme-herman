'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const sinon = require('sinon');

const assets = require('../../lib/utils/assets');

const access = Promise.promisify(fs.access);

describe('assets', function() {
  before(function() {
    this.dest = `${__dirname}/dest`;
  });

  afterEach(function() {
    del.sync(`${this.dest}/*`);
  });

  it('Copies file from src to dest', function(done) {
    assets(__filename, this.dest)
      .then(() => access(`${this.dest}/${path.parse(__filename).base}`))
      .then(() => {
        assert.ok(true);
        done();
      })
      .catch(done);
  });

  it('Parses file', function(done) {
    const parser = sinon.fake();
    const env = 'foo';
    const opts = { parser, env };

    assets(__filename, this.dest, opts).then(() => {
      const contents = parser.args[0][0].contents.toString();

      sinon.assert.calledOnce(parser);
      assert.ok(contents.includes('Parses file'));
      assert.equal(parser.args[0][2], env);

      done();
    });
  });
});
