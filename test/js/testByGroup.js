'use strict';

const assert = require('assert');

const byGroup = require('../../lib/utils/byGroup');

describe('byGroup', () => {
  it('returns data ordered by groups', () => {
    const data = [
      { id: 1, group: ['g1'] },
      { id: 2, group: ['g2'] },
      { id: 3, group: ['g1'] },
      { id: 4, group: ['g2'] },
    ];
    const orderedGroups = [
      'g2',
      { parent: 'Group 1', subgroups: ['g1'] },
      'fail',
      { parent: 'Fake', subgroups: ['group'] },
    ];
    const actual = byGroup(data, orderedGroups);
    const expected = {
      g2: [
        { id: 2, group: ['g2'] },
        { id: 4, group: ['g2'] },
      ],
      g1: [
        { id: 1, group: ['g1'] },
        { id: 3, group: ['g1'] },
      ],
    };
    assert.deepStrictEqual(actual, expected, JSON.stringify(actual));
  });
});
