'use strict';

const assert = require('assert');

const nunjucks = require('nunjucks');
const sinon = require('sinon');

const getNunjucksEnv = require('../../lib/utils/getNunjucksEnv');

describe('getNunjucksEnv', () => {
  it('uses an existing nunjucksEnv first', () => {
    const env = {
      herman: {
        nunjucks: {
          environment: 'some value',
        },
      },
    };
    const actual = getNunjucksEnv(null, env, null);
    assert.strictEqual(actual, 'some value');
  });

  it('returns null if env.herman missing', () => {
    const env = {
      logger: {
        warn: sinon.fake(),
      },
    };
    const actual = getNunjucksEnv(null, env, null);
    assert.strictEqual(actual, null);
    sinon.assert.calledOnce(env.logger.warn);
  });

  it('runs nunjucks.configure if all is good', () => {
    const configure = sinon.stub(nunjucks, 'configure');
    const env = {
      herman: {
        nunjucks: {
          templatePath: 'some value',
        },
      },
    };
    // Look for side-effects:
    getNunjucksEnv(null, env, null);
    assert(configure.calledWith('some value'));
  });
});
