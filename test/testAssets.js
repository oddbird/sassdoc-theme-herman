'use strict';

const assert = require('assert');
const del = require('del');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');

const assets = require('../lib/utils/assets');

describe('assets', function() {
  it('Copies file from src to dest', function(done) {
    const dest = `${__dirname}/dest`;

    assets(__filename, dest).then(() => {
      fs.access(`${dest}/${path.parse(__filename).base}`, err => {
        assert.equal(err, undefined);

        del(dest).then(() => {
          done();
        });
      });
    });
  });

  it('Parses file', function(done) {
    const dest = `${__dirname}/dest`;
    const parser = sinon.spy();
    const env = 'foo';
    const opts = { parser, env };

    assets(__filename, dest, opts).then(() => {
      const contents = parser.args[0][0].contents.toString();

      sinon.assert.calledOnce(parser);
      assert.ok(contents.includes('Parses file'));
      assert.equal(parser.args[0][2], env);

      del(dest).then(() => {
        done();
      });
    });
  });
});
