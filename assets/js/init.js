window.Herman = (function init(Herman, $) {
  'use strict';
  $(() => {
    window.hljs.initHighlighting();
    Herman.initializeToggles();
    Herman.initializeTabs();
    Herman.initializeIframes();
    Herman.initializeTipue();
  });

  return Herman;
})(window.Herman || {}, window.jQuery);
