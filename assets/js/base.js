window.Herman = (function base(Herman, $) {
  'use strict';

  // Store keycode variables for easier readability
  const KEYCODES = {
    SPACE: 32,
    ENTER: 13,
    TAB: 9,
    ESC: 27,
    BACKSPACE: 8,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    CAPS: 20,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    COMMA: 44,
  };

  Herman.initializeToggles = function initializeToggles() {
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

    const closeTarget = function(target) {
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

    const autoClose = function(newTarget, target) {
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

  Herman.initializeTabs = function initializeTabs() {
    const body = $('body');

    const getAllTabsInGroup = function(tab) {
      const group = tab.attr('data-tab-group');
      return $(`[role="tab"][data-tab-group="${group}"]`);
    };

    const getAllPanelsInGroup = function(tab) {
      const group = tab.attr('data-tab-group');
      return $(`[role="tabpanel"][data-tab-group="${group}"]`);
    };

    const showPanel = function(tab) {
      const tabs = getAllTabsInGroup(tab);
      const panels = getAllPanelsInGroup(tab);
      const panel = panels.filter(`[aria-labelledby="${tab.attr('id')}"]`);
      tab.attr({ tabindex: 0, 'aria-selected': true });
      tabs
        .not(tab)
        .attr('tabindex', -1)
        .removeAttr('aria-selected');
      panel.removeAttr('aria-hidden').trigger('visible');
      panels.not(panel).attr('aria-hidden', true);
      tab.trigger('tab:active');
    };

    body.on('tabs:close', '[role="tab"]', function cb() {
      const tab = $(this);
      const tabs = getAllTabsInGroup(tab);
      const panels = getAllPanelsInGroup(tab);
      tabs.attr('tabindex', -1).removeAttr('aria-selected');
      panels.attr('aria-hidden', true);
    });

    body.on('click', '[role="tab"]', function cb(evt) {
      evt.preventDefault();
      showPanel($(this));
    });

    body.on('keydown', '[role="tab"]', function cb(evt) {
      const tab = $(this);
      const tabs = getAllTabsInGroup(tab);
      const idx = tabs.index(tab);
      let targetIdx = idx;
      switch (evt.keyCode) {
        case KEYCODES.LEFT:
          targetIdx = idx > 0 ? idx - 1 : idx;
          break;
        case KEYCODES.RIGHT:
          targetIdx = idx + 1;
          break;
      }
      const target = tabs.eq(targetIdx);
      if (idx !== targetIdx && target.length) {
        showPanel(target);
        target.focus();
      }
    });
  };

  Herman.initializeIframes = function initializeIframes() {
    const fitIframeToContent = function(iframe) {
      if (iframe.contentWindow.document.body) {
        iframe.height = $(iframe.contentWindow.document).outerHeight(true);
      }
    };
    const fitIframesToContent = function() {
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

  function filterSiblings(selector, filter) {
    $(`${selector} ~ section`).each((idx, node) => {
      if (filter !== '') {
        if (node.id.includes(filter)) {
          $(node).show();
        } else {
          $(node).hide();
        }
      } else {
        $(node).show();
      }
    });
  }
  Herman.initializePageFilters = function initializePageFilters() {
    $('#page-filter').submit(function(event) {
      event.preventDefault();
      return false;
    });
    $('#page-filter input').keyup(function() {
      filterSiblings('#page-filter', $('#page-filter input').val());
    });
  };

  return Herman;
})(window.Herman || {}, window.jQuery);
