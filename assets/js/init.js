window.Herman = (function init(Herman, $) {
  'use strict';
  $(() => {
    window.hljs.initHighlightingOnLoad();
    Herman.initializeToggles();
    Herman.initializeTabs();
    Herman.initializeIframes();

    $('#tipue_search_input').tipuesearch({
      mode: 'live',
    });
  });

  return Herman;
})(window.Herman || {}, window.jQuery);
