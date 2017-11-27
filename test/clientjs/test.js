'use strict';

describe('initializeToggles', function() {
  beforeEach(function() {
    const id = (this.id = 'some-id');
    var fixture =
      `<button aria-controls="${id}" data-toggle="button">show panel</button>` +
      `<nav data-toggle="target" data-target-id="${id}"></nav>`;

    document.body.insertAdjacentHTML('afterbegin', fixture);
  });

  it('listens to toggle:close', function() {
    const target = $(`[data-target-id="${this.id}"]`);
    const trigger = sinon.spy(target, 'trigger');
    $('body').trigger('toggle:close');
    expect(trigger).to.have.been.calledWith('target:close');
  });
});
