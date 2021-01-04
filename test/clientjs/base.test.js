import * as base from '@/base';

describe('initializeToggles', () => {
  let toggle,
    toggle2,
    syncedToggle,
    syncedToggle2,
    target,
    close,
    toggleClose,
    toggleOpen,
    targetClose,
    targetOpen;

  beforeEach(() => {
    toggle = $(
      '<div data-toggle="button" aria-controls="target &foo">',
    ).appendTo('body');
    toggle2 = $(
      '<div data-toggle="button" aria-controls="target &foo" ' +
        'aria-pressed="true">',
    ).appendTo('body');
    syncedToggle = $(
      '<div data-toggle="button" aria-controls="target &foo" ' +
        'data-toggle-synced="true">',
    ).appendTo('body');
    syncedToggle2 = $(
      '<div data-toggle="button" aria-controls="target &foo" ' +
        'data-toggle-synced="true">',
    ).appendTo('body');
    target = $(
      '<div data-toggle="target" data-target-id="target &foo">',
    ).appendTo('body');
    close = $('<div data-toggle="close" aria-controls="target &foo">').appendTo(
      'body',
    );
    toggleClose = jest.fn();
    toggleOpen = jest.fn();
    targetClose = jest.fn();
    targetOpen = jest.fn();
    toggle.on('toggle:close', toggleClose);
    toggle2.on('toggle:close', toggleClose);
    toggle.on('toggle:open', toggleOpen);
    toggle2.on('toggle:open', toggleOpen);
    target.on('target:close', targetClose);
    target.on('target:open', targetOpen);
    base.initializeToggles();
  });

  afterEach(() => {
    toggle.remove();
    toggle2.remove();
    syncedToggle.remove();
    syncedToggle2.remove();
    target.remove();
    close.remove();
  });

  it('toggle click toggles aria-pressed and aria-expanded', () => {
    toggle.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(toggle2.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
    expect(toggleOpen).toHaveBeenCalledTimes(1);
    expect(targetOpen).toHaveBeenCalledTimes(1);

    toggle2.attr('aria-pressed', 'true');
    toggle.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(toggle2.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
    expect(toggleClose).toHaveBeenCalledTimes(1);
    expect(targetClose).toHaveBeenCalledTimes(1);
  });

  it('synced toggles remain in sync (both open or both closed)', () => {
    syncedToggle.click();

    expect(syncedToggle.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(syncedToggle2.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');

    syncedToggle2.click();

    expect(syncedToggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(syncedToggle2.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
  });

  it(
    'toggle:close and toggle:open events do not change aria-expanded if ' +
      'triggered on nested elements',
    () => {
      const targetInner = $('<div data-toggle="target">').appendTo(target);
      targetInner.trigger('target:open');

      expect(targetInner.get(0)).toHaveAttribute('aria-expanded', 'true');
      expect(target.get(0)).not.toHaveAttribute('aria-expanded');
      expect(targetOpen).toHaveBeenCalledTimes(1);

      targetInner.trigger('target:close');

      expect(targetInner.get(0)).toHaveAttribute('aria-expanded', 'false');
      expect(target.get(0)).not.toHaveAttribute('aria-expanded');
      expect(targetClose).toHaveBeenCalledTimes(1);
    },
  );

  it('close click sets aria-pressed and aria-expanded to "false"', () => {
    toggle.attr('aria-pressed', 'true');
    close.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(toggle2.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
    expect(toggleClose).toHaveBeenCalledTimes(2);
    expect(targetClose).toHaveBeenCalledTimes(2);

    targetClose.mockClear();
    target.attr('aria-expanded', 'true');
    close.click();

    expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
    expect(targetClose).toHaveBeenCalledTimes(1);
  });

  describe('auto-closing', () => {
    beforeEach(() => {
      target.attr('data-auto-closing', 'true');
      toggle.click();
    });

    it('closes on any click outside the target', () => {
      target.click();

      expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
      expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
      expect(toggleClose).not.toHaveBeenCalled();
      expect(targetClose).not.toHaveBeenCalled();

      $('body').click();

      expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'false');
      expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
      expect(toggleClose).toHaveBeenCalledTimes(1);
      expect(targetClose).toHaveBeenCalledTimes(1);
    });

    it('does not close if clicked el is removed from DOM', () => {
      const el = $('div').appendTo('body');
      el.on('click', () => {
        el.remove();
      });
      el.click();

      expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
      expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
      expect(toggleClose).not.toHaveBeenCalled();
      expect(targetClose).not.toHaveBeenCalled();
    });

    it('does not close if exception is clicked', () => {
      target.attr('data-auto-closing-exception', '.exception');
      const el = $('<div class="exception">').appendTo('body');
      el.click();

      expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
      expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
      expect(toggleClose).not.toHaveBeenCalled();
      expect(targetClose).not.toHaveBeenCalled();

      el.remove();
    });
  });

  it('auto-closing-on-any-click toggle closes on any click', () => {
    target.attr('data-auto-closing', 'true');
    target.attr('data-auto-closing-on-any-click', 'true');
    toggle.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
    expect(toggleOpen).toHaveBeenCalledTimes(1);
    expect(targetOpen).toHaveBeenCalledTimes(1);

    target.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
    expect(toggleClose).toHaveBeenCalledTimes(1);
    expect(targetClose).toHaveBeenCalledTimes(1);
  });

  it('multiple auto-closing toggles work independently', () => {
    const otherTarget = $(
      '<div data-toggle="target" data-target-id="target2"' +
        ' data-auto-closing="true" aria-expanded="false">',
    ).appendTo('body');
    const otherToggle = $(
      '<div data-toggle="button" aria-controls="target2" ' +
        'aria-pressed="false">',
    ).appendTo('body');
    target.attr('data-auto-closing', 'true');
    toggle.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
    expect(otherToggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(otherTarget.get(0)).toHaveAttribute('aria-expanded', 'false');

    otherToggle.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'false');
    expect(otherToggle.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(otherTarget.get(0)).toHaveAttribute('aria-expanded', 'true');

    toggle.click();

    expect(toggle.get(0)).toHaveAttribute('aria-pressed', 'true');
    expect(target.get(0)).toHaveAttribute('aria-expanded', 'true');
    expect(otherToggle.get(0)).toHaveAttribute('aria-pressed', 'false');
    expect(otherTarget.get(0)).toHaveAttribute('aria-expanded', 'false');

    otherTarget.remove();
    otherToggle.remove();
  });
});

describe('initializeIframes', () => {
  let jq, iframe;

  beforeAll(() => {
    jq = $;
    $.fn.outerHeight = jest.fn().mockReturnValue(30);
  });

  beforeEach(() => {
    iframe = $('<iframe height="20">');
    iframe.appendTo('body');
    base.initializeIframes();
  });

  afterEach(() => {
    iframe.remove();
  });

  afterAll(() => {
    $.fn.outerHeight = jq.fn.outerHeight;
  });

  it('triggers callbacks on window resize', () => {
    expect(iframe.get(0).height).toEqual('30');
    expect($.fn.outerHeight).toHaveBeenCalledTimes(1);
    expect($.fn.outerHeight).toHaveBeenCalledWith(true);

    iframe.trigger('load');

    expect($.fn.outerHeight).toHaveBeenCalledTimes(2);

    $(window).trigger('resize');

    expect($.fn.outerHeight).toHaveBeenCalledTimes(3);
  });
});

describe('initializeNav', () => {
  const matchMedia = window.matchMedia;
  let mql, nav, btn;

  beforeEach(() => {
    mql = {
      addListener: jest.fn(),
      matches: true,
    };
    window.matchMedia = jest.fn().mockReturnValue(mql);
    nav = $('<div id="nav">').appendTo('body');
    btn = $('<div aria-controls="nav" aria-pressed="false">').appendTo('body');
  });

  afterEach(() => {
    nav.remove();
    btn.remove();
    window.matchMedia = matchMedia;
  });

  describe('viewport wider than breakpoint', () => {
    it('sets nav aria-expanded "true"', () => {
      base.initializeNav();
      expect(nav.get(0)).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('viewport narrower than breakpoint', () => {
    it('sets nav aria-expanded to match btn aria-pressed', () => {
      mql.matches = false;
      base.initializeNav();
      expect(nav.get(0)).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('viewport width changes', () => {
    it('updates nav aria-expanded', () => {
      base.initializeNav();

      expect(nav.get(0)).toHaveAttribute('aria-expanded', 'true');
      expect(window.matchMedia).toHaveBeenCalledTimes(1);
      expect(window.matchMedia.mock.calls[0][0]).toMatch('(min-width:');
      expect(mql.addListener).toHaveBeenCalledTimes(1);

      mql.addListener.mock.calls[0][0]({ matches: false });

      expect(nav.get(0)).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
