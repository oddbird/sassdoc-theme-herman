'use strict';

const assert = require('assert');
const sinon = require('sinon');
const nunjucks = require('nunjucks');

const getNunjucksEnv = require('../lib/getNunjucksEnv.js');

describe('getNunjucksEnv', function() {
  it('uses an existing nunjucksEnv first', function() {
    const env = {
      herman: {
        nunjucksEnv: 'some value',
      },
    };
    const actual = getNunjucksEnv(null, env, null);
    assert.equal(actual, 'some value');
  });

  it('returns null if env.herman missing', function() {
    const env = {
      logger: {
        warn() {},
      },
    };
    const actual = getNunjucksEnv(null, env, null);
    assert.equal(actual, null);
  });

  it('runs nunjucks.configure if all is good', function() {
    const configure = sinon.stub(nunjucks, 'configure');
    const env = {
      herman: {
        templatepath: 'some value',
      },
    };
    // Look for side-effects:
    getNunjucksEnv(null, env, null);
    assert(configure.calledWith('some value'));
  });
});
