'use strict';

const assert = require('assert');
const sinon = require('sinon');

const expected = require('./fixtures/groupName/expected');
const groupName = require('../../lib/utils/groupName');
const input = require('./fixtures/groupName/input');

describe('groupName', function() {
  it('adds groupName, ctx.orderedGroups, ctx.subgroupsByGroup', function() {
    input.logger = { warn: sinon.fake() };
    groupName(input);

    sinon.assert.calledOnce(input.logger.warn);

    delete input.logger;

    assert.deepEqual(input, expected);
  });
});
