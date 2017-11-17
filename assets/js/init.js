window.Herman = (function init(Herman, $) {
  'use strict';
  $(() => {
    window.hljs.initHighlightingOnLoad();
    Herman.initializeToggles();
    Herman.initializeTabs();
    Herman.initializeIframes();
    Herman.initializeTipue();
  });

  return Herman;
})(window.Herman || {}, window.jQuery);
