window.Herman = (function(Herman, $) {
  'use strict';
  $(function() {
    window.hljs.initHighlightingOnLoad();
    Herman.initializeToggles();
    Herman.initializeTabs();
    Herman.initializeIframes();
  });

  return Herman;
})(window.Herman || {}, window.jQuery);
