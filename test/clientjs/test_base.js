import * as base from 'base';

describe('initializeToggles', function() {
  beforeEach(function() {
    this.toggle = $(
      '<div data-toggle="button" aria-controls="target &foo">'
    ).appendTo('body');
    this.toggle2 = $(
      '<div data-toggle="button" aria-controls="target &foo" ' +
        'aria-pressed="true">'
    ).appendTo('body');
    this.syncedToggle = $(
      '<div data-toggle="button" aria-controls="target &foo" ' +
        'data-toggle-synced="true">'
    ).appendTo('body');
    this.syncedToggle2 = $(
      '<div data-toggle="button" aria-controls="target &foo" ' +
        'data-toggle-synced="true">'
    ).appendTo('body');
    this.target = $(
      '<div data-toggle="target" data-target-id="target &foo">'
    ).appendTo('body');
    this.close = $(
      '<div data-toggle="close" aria-controls="target &foo">'
    ).appendTo('body');
    const toggleClose = (this.toggleClose = sinon.spy());
    const toggleOpen = (this.toggleOpen = sinon.spy());
    const targetClose = (this.targetClose = sinon.spy());
    const targetOpen = (this.targetOpen = sinon.spy());
    this.toggle.on('toggle:close', toggleClose);
    this.toggle2.on('toggle:close', toggleClose);
    this.toggle.on('toggle:open', toggleOpen);
    this.toggle2.on('toggle:open', toggleOpen);
    this.target.on('target:close', targetClose);
    this.target.on('target:open', targetOpen);
    base.initializeToggles();
  });

  afterEach(function() {
    this.toggle.remove();
    this.toggle2.remove();
    this.syncedToggle.remove();
    this.syncedToggle2.remove();
    this.target.remove();
    this.close.remove();
  });

  it('toggle click toggles aria-pressed and aria-expanded', function() {
    this.toggle.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'true');
    expect(this.toggle2).to.have.attr('aria-pressed', 'false');
    expect(this.target).to.have.attr('aria-expanded', 'true');
    expect(this.toggleOpen).to.have.been.calledOnce;
    expect(this.targetOpen).to.have.been.calledOnce;

    this.toggle2.attr('aria-pressed', 'true');
    this.toggle.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'false');
    expect(this.toggle2).to.have.attr('aria-pressed', 'false');
    expect(this.target).to.have.attr('aria-expanded', 'false');
    expect(this.toggleClose).to.have.been.calledOnce;
    expect(this.targetClose).to.have.been.calledOnce;
  });

  it('synced toggles remain in sync (both open or both closed)', function() {
    this.syncedToggle.click();

    expect(this.syncedToggle).to.have.attr('aria-pressed', 'true');
    expect(this.syncedToggle2).to.have.attr('aria-pressed', 'true');
    expect(this.target).to.have.attr('aria-expanded', 'true');

    this.syncedToggle2.click();

    expect(this.syncedToggle).to.have.attr('aria-pressed', 'false');
    expect(this.syncedToggle2).to.have.attr('aria-pressed', 'false');
    expect(this.target).to.have.attr('aria-expanded', 'false');
  });

  it(
    'toggle:close and toggle:open events do not change aria-expanded if ' +
      'triggered on nested elements',
    function() {
      const targetInner = $('<div data-toggle="target">').appendTo(this.target);
      targetInner.trigger('target:open');

      expect(targetInner).to.have.attr('aria-expanded', 'true');
      expect(this.target).not.to.have.attr('aria-expanded');
      expect(this.targetOpen).to.have.been.calledOnce;

      targetInner.trigger('target:close');

      expect(targetInner).to.have.attr('aria-expanded', 'false');
      expect(this.target).not.to.have.attr('aria-expanded');
      expect(this.targetClose).to.have.been.calledOnce;
    }
  );

  it('close click sets aria-pressed and aria-expanded to "false"', function() {
    this.toggle.attr('aria-pressed', 'true');
    this.close.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'false');
    expect(this.toggle2).to.have.attr('aria-pressed', 'false');
    expect(this.target).to.have.attr('aria-expanded', 'false');
    expect(this.toggleClose).to.have.been.calledTwice;
    expect(this.targetClose).to.have.been.calledTwice;

    this.targetClose.reset();
    this.target.attr('aria-expanded', 'true');
    this.close.click();

    expect(this.target).to.have.attr('aria-expanded', 'false');
    expect(this.targetClose).to.have.been.calledOnce;
  });

  describe('auto-closing', function() {
    beforeEach(function() {
      this.target.attr('data-auto-closing', 'true');
      this.toggle.click();
    });

    it('closes on any click outside the target', function() {
      this.target.click();

      expect(this.toggle).to.have.attr('aria-pressed', 'true');
      expect(this.target).to.have.attr('aria-expanded', 'true');
      expect(this.toggleClose).not.to.have.been.called;
      expect(this.targetClose).not.to.have.been.called;

      $('body').click();

      expect(this.toggle).to.have.attr('aria-pressed', 'false');
      expect(this.target).to.have.attr('aria-expanded', 'false');
      expect(this.toggleClose).to.have.been.calledOnce;
      expect(this.targetClose).to.have.been.calledOnce;
    });

    it('does not close if clicked el is removed from DOM', function() {
      const el = $('div').appendTo('body');
      el.on('click', () => {
        el.remove();
      });
      el.click();

      expect(this.toggle).to.have.attr('aria-pressed', 'true');
      expect(this.target).to.have.attr('aria-expanded', 'true');
      expect(this.toggleClose).not.to.have.been.called;
      expect(this.targetClose).not.to.have.been.called;
    });

    it('does not close if exception is clicked', function() {
      this.target.attr('data-auto-closing-exception', '.exception');
      const el = $('<div class="exception">').appendTo('body');
      el.click();

      expect(this.toggle).to.have.attr('aria-pressed', 'true');
      expect(this.target).to.have.attr('aria-expanded', 'true');
      expect(this.toggleClose).not.to.have.been.called;
      expect(this.targetClose).not.to.have.been.called;

      el.remove();
    });
  });

  it('auto-closing-on-any-click toggle closes on any click', function() {
    this.target.attr('data-auto-closing', 'true');
    this.target.attr('data-auto-closing-on-any-click', 'true');
    this.toggle.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'true');
    expect(this.target).to.have.attr('aria-expanded', 'true');
    expect(this.toggleOpen).to.have.been.calledOnce;
    expect(this.targetOpen).to.have.been.calledOnce;

    this.target.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'false');
    expect(this.target).to.have.attr('aria-expanded', 'false');
    expect(this.toggleClose).to.have.been.calledOnce;
    expect(this.targetClose).to.have.been.calledOnce;
  });

  it('multiple auto-closing toggles work independently', function() {
    const otherTarget = $(
      '<div data-toggle="target" data-target-id="target2"' +
        ' data-auto-closing="true" aria-expanded="false">'
    ).appendTo('body');
    const otherToggle = $(
      '<div data-toggle="button" aria-controls="target2" ' +
        'aria-pressed="false">'
    ).appendTo('body');
    this.target.attr('data-auto-closing', 'true');
    this.toggle.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'true');
    expect(this.target).to.have.attr('aria-expanded', 'true');
    expect(otherToggle).to.have.attr('aria-pressed', 'false');
    expect(otherTarget).to.have.attr('aria-expanded', 'false');

    otherToggle.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'false');
    expect(this.target).to.have.attr('aria-expanded', 'false');
    expect(otherToggle).to.have.attr('aria-pressed', 'true');
    expect(otherTarget).to.have.attr('aria-expanded', 'true');

    this.toggle.click();

    expect(this.toggle).to.have.attr('aria-pressed', 'true');
    expect(this.target).to.have.attr('aria-expanded', 'true');
    expect(otherToggle).to.have.attr('aria-pressed', 'false');
    expect(otherTarget).to.have.attr('aria-expanded', 'false');

    otherTarget.remove();
    otherToggle.remove();
  });
});

describe('initializeIframes', function() {
  it('triggers callbacks on window resize', function() {
    const srcUrl = '';
    const iframe = $(
      `<iframe src="${srcUrl}" height="20" width="20"></iframe>`
    );
    iframe.appendTo('body');
    base.initializeIframes();
    iframe.trigger('load');
    $(window).trigger('resize');
    // @@@ This is not a very useful or informative assertion:
    expect(iframe.get(0).height).to.equal('20');
  });
});
