'use strict';

const assert = require('assert');
const sinon = require('sinon');

const normalizeGroups = require('../../lib/utils/normalizeGroups');

describe('normalizeGroups', function() {
  it('returns flattened group data', function() {
    const logger = { warn: sinon.spy() };
    const groups = {
      g1: 'g1',
      category1: {
        g2: 'g2',
      },
      category2: {
        g2: 'cat2-g2',
      },
    };
    const actual = normalizeGroups(groups, logger);
    const expected = {
      g1: 'g1',
      g2: 'g2',
    };

    assert.deepEqual(actual, expected, JSON.stringify(actual));
    sinon.assert.calledOnce(logger.warn);
  });
});
