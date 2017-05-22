window.Herman = (function(Herman, $) {
  'use strict';
  // Store keycode variables for easier readability
  var KEYCODES = {
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
    COMMA: 44
  };

  Herman.initializeToggles = function() {
    var body = $('body');

    body.on('toggle:close', '[data-toggle="button"]', function() {
      var id = $(this).attr('aria-controls');
      var target = $('[data-target-id="' + id + '"]');
      var openToggles = $(
        '[data-toggle="button"][aria-controls="' +
          id +
          '"][aria-pressed="true"]'
      );
      openToggles.attr('aria-pressed', 'false');
      target.trigger('target:close');
    });

    body.on('toggle:open', '[data-toggle="button"]', function() {
      var toggle = $(this);
      var targetID = toggle.attr('aria-controls');
      var target = $('[data-target-id="' + targetID + '"]');
      var otherToggles = $(
        '[data-toggle="button"][aria-controls="' + targetID + '"]'
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

    body.on('target:close', '[data-toggle="target"]', function(evt) {
      var target = $(this);
      // Prevent event firing on multiple nested targets
      if ($(evt.target).is(target)) {
        target.attr('aria-expanded', 'false');
      }
    });

    var counter = 0;
    var closeTarget = function(target) {
      // Close a target and update any attached toggles
      var id = target.attr('data-target-id');
      var openToggles = $(
        '[data-toggle="button"][aria-controls="' +
          id +
          '"][aria-pressed="true"]'
      );
      if (openToggles.length) {
        openToggles.trigger('toggle:close');
      } else {
        target.trigger('target:close');
      }
    };
    var autoClose = function(evtName, evt) {
      // "this" is bound to the original target
      var targetID = this.attr('data-target-id');
      var newTarget = $(evt.target);
      if (
        this.data('auto-closing-on-any-click') ||
        !newTarget.closest(this).length ||
        newTarget.closest('[data-close-toggle="' + targetID + '"]').length
      ) {
        body.off(evtName);
        closeTarget(this);
      }
    };

    body.on('target:open', '[data-toggle="target"]', function(evt) {
      var target = $(this);
      // Prevent event firing on multiple nested targets
      if ($(evt.target).is(target)) {
        target.attr('aria-expanded', 'true');
        if (target.data('auto-closing')) {
          counter = counter + 1;
          var evtName = 'click.toggle_' + counter;
          body.on(evtName, autoClose.bind(target, evtName));
        }
      }
    });

    body.on('click', '[data-toggle="button"]', function(evt) {
      evt.preventDefault();
      var toggle = $(this);
      if (toggle.attr('aria-pressed') === 'true') {
        toggle.trigger('toggle:close');
      } else {
        toggle.trigger('toggle:open');
      }
    });

    body.on('click', '[data-toggle="close"]', function(evt) {
      evt.preventDefault();
      var id = $(this).attr('aria-controls');
      var target = $('[data-target-id="' + id + '"]');
      closeTarget(target);
    });
  };

  Herman.initializeTabs = function() {
    var body = $('body');

    var getAllTabsInGroup = function(tab) {
      var group = tab.attr('data-tab-group');
      return $('[role="tab"][data-tab-group="' + group + '"]');
    };

    var getAllPanelsInGroup = function(tab) {
      var group = tab.attr('data-tab-group');
      return $('[role="tabpanel"][data-tab-group="' + group + '"]');
    };

    var showPanel = function(tab) {
      var tabs = getAllTabsInGroup(tab);
      var panels = getAllPanelsInGroup(tab);
      var panel = panels.filter('[aria-labelledby="' + tab.attr('id') + '"]');
      tab.attr({ tabindex: 0, 'aria-selected': true });
      tabs.not(tab).attr('tabindex', -1).removeAttr('aria-selected');
      panel.removeAttr('aria-hidden').trigger('visible');
      panels.not(panel).attr('aria-hidden', true);
      tab.trigger('tab:active');
    };

    body.on('tabs:close', '[role="tab"]', function() {
      var tab = $(this);
      var tabs = getAllTabsInGroup(tab);
      var panels = getAllPanelsInGroup(tab);
      tabs.attr('tabindex', -1).removeAttr('aria-selected');
      panels.attr('aria-hidden', true);
    });

    body.on('click', '[role="tab"]', function(evt) {
      evt.preventDefault();
      showPanel($(this));
    });

    body.on('keydown', '[role="tab"]', function(evt) {
      var tab = $(this);
      var tabs = getAllTabsInGroup(tab);
      var idx = tabs.index(tab);
      var targetIdx = idx;
      switch (evt.keyCode) {
        case KEYCODES.LEFT:
          targetIdx = idx > 0 ? idx - 1 : idx;
          break;
        case KEYCODES.RIGHT:
          targetIdx = idx + 1;
          break;
      }
      var target = tabs.eq(targetIdx);
      if (idx !== targetIdx && target.length) {
        showPanel(target);
        target.focus();
      }
    });
  };

  Herman.initializeIframes = function() {
    var fitIframeToContent = function(iframe) {
      if (iframe.contentWindow.document.body) {
        iframe.height = iframe.contentWindow.document.body.scrollHeight;
      }
    };
    var fitIframesToContent = function() {
      $('iframe').each(function() {
        fitIframeToContent(this);
      });
    };

    fitIframesToContent();
    $('iframe').on('load', function() {
      fitIframeToContent(this);
    });
    $(window).on('resize', fitIframesToContent);
  };

  return Herman;
})(window.Herman || {}, window.jQuery);
