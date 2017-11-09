'use strict';

const assert = require('assert');

const byGroup = require('../../lib/utils/byGroup');

describe('byGroup', function() {
  it('returns data ordered by groups', function() {
    const data = [
      { id: 1, group: ['g1'] },
      { id: 2, group: ['g2'] },
      { id: 3, group: ['g1'] },
      { id: 4, group: ['g2'] },
    ];
    const orderedGroups = {
      g2: null,
      g1: null,
    };
    const actual = byGroup(data, orderedGroups);
    const expected = {
      g2: [{ id: 2, group: ['g2'] }, { id: 4, group: ['g2'] }],
      g1: [{ id: 1, group: ['g1'] }, { id: 3, group: ['g1'] }],
    };
    assert.deepEqual(actual, expected, JSON.stringify(actual));
  });
});
