import sassConfig from '!json-loader!sassjson!sass-loader!../../scss/json.scss';

export const initializeToggles = () => {
  const body = $('body');

  body.on('toggle:close', '[data-toggle="button"]', function cb() {
    const id = $(this).attr('aria-controls');
    const target = $(`[data-target-id="${id}"]`);
    const openToggles = $(
      `[data-toggle="button"][aria-controls="${id}"][aria-pressed="true"]`
    );
    openToggles.attr('aria-pressed', 'false');
    target.trigger('target:close');
  });

  body.on('toggle:open', '[data-toggle="button"]', function cb() {
    const toggle = $(this);
    const targetID = toggle.attr('aria-controls');
    const target = $(`[data-target-id="${targetID}"]`);
    const otherToggles = $(
      `[data-toggle="button"][aria-controls="${targetID}"]`
    ).not(toggle);
    // If this is a synced toggle, open all other attached toggles
    if (toggle.data('toggle-synced')) {
      otherToggles
        .filter('[data-toggle-synced="true"]')
        .attr('aria-pressed', 'true');
      // Otherwise, close other attached toggles.
    } else {
      otherToggles
        .filter('[aria-pressed="true"]')
        .attr('aria-pressed', 'false');
    }
    toggle.attr('aria-pressed', 'true');
    target.trigger('target:open');
  });

  body.on('target:close', '[data-toggle="target"]', function cb(evt) {
    const target = $(this);
    // Prevent event firing on multiple nested targets
    if ($(evt.target).is(target)) {
      target.attr('aria-expanded', 'false');
    }
  });

  const closeTarget = target => {
    // Close a target and update any attached toggles
    const id = target.attr('data-target-id');
    const openToggles = $(
      `[data-toggle="button"][aria-controls="${id}"][aria-pressed="true"]`
    );
    if (openToggles.length) {
      openToggles.trigger('toggle:close');
    } else {
      target.trigger('target:close');
    }
  };

  body.on('target:open', '[data-toggle="target"]', function cb(evt) {
    const target = $(this);
    // Prevent event firing on multiple nested targets
    if ($(evt.target).is(target)) {
      target.attr('aria-expanded', 'true');
    }
  });

  body.on('click', '[data-toggle="button"]', function cb(evt) {
    evt.preventDefault();
    const toggle = $(this);
    if (toggle.attr('aria-pressed') === 'true') {
      toggle.trigger('toggle:close');
    } else {
      toggle.trigger('toggle:open');
    }
  });

  body.on('click', '[data-toggle="close"]', function cb(evt) {
    evt.preventDefault();
    const target = $(`[data-target-id="${$(this).attr('aria-controls')}"]`);
    closeTarget(target);
  });

  const autoClose = (newTarget, target) => {
    const targetID = target.attr('data-target-id');
    const toggleClicked = newTarget.closest(`[aria-controls="${targetID}"]`)
      .length;
    const clickedElInDOM = document.contains(newTarget.get(0));
    const clickedOutsideTarget = !newTarget.closest(target).length;
    const exception = target.attr('data-auto-closing-exception');
    const clickedException = exception
      ? newTarget.closest(exception).length
      : false;
    if (
      !toggleClicked &&
      (target.data('auto-closing-on-any-click') ||
        (clickedElInDOM && clickedOutsideTarget && !clickedException))
    ) {
      closeTarget(target);
    }
  };

  body.on('click', evt => {
    const openTargets = $(
      '[data-toggle="target"][aria-expanded="true"][data-auto-closing="true"]'
    );
    openTargets.each((index, target) => {
      autoClose($(evt.target), $(target));
    });
  });
};

export const initializeIframes = () => {
  const fitIframeToContent = iframe => {
    /* istanbul ignore else */
    if (iframe.contentWindow.document.body) {
      iframe.height = $(iframe.contentWindow.document).outerHeight(true);
    }
  };
  const fitIframesToContent = () => {
    $('iframe').each(function cb() {
      fitIframeToContent(this);
    });
  };

  fitIframesToContent();
  $('iframe').on('load', function cb() {
    fitIframeToContent(this);
  });
  $(window).on('resize', fitIframesToContent);
};

export const initializeNav = () => {
  const breakpoint =
    sassConfig &&
    sassConfig.sizes &&
    sassConfig.sizes['layout-sizes'] &&
    sassConfig.sizes['layout-sizes']['nav-break'];

  /* istanbul ignore else */
  if (breakpoint) {
    const nav = $('#nav');
    const btn = $('[aria-controls="nav"]');
    const mql = window.matchMedia(`(min-width: ${breakpoint})`);

    const screenTest = e => {
      if (e.matches) {
        /* the viewport is wider than the breakpoint */
        nav.attr('aria-expanded', 'true');
      } else {
        /* the viewport is narrower than the breakpoint */
        nav.attr('aria-expanded', btn.attr('aria-pressed'));
      }
    };

    screenTest(mql);
    mql.addListener(screenTest);
  }
};
