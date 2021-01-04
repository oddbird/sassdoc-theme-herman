'use strict';

const assert = require('assert');

const sinon = require('sinon');

const groupName = require('../../lib/utils/groupName');

const expected = require('./fixtures/groupName/expected');
const input = require('./fixtures/groupName/input');

describe('groupName', () => {
  it('adds groupName, ctx.orderedGroups, ctx.subgroupsByGroup', () => {
    input.logger = { warn: sinon.fake() };
    groupName(input);

    sinon.assert.calledOnce(input.logger.warn);

    delete input.logger;

    assert.deepEqual(input, expected);
  });
});
