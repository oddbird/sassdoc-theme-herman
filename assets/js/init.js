window.Herman = (function(Herman, $) {
  'use strict';
  $(function() {
    window.hljs.initHighlightingOnLoad();
    Herman.initializeToggles();
    Herman.initializeTabs();
  });

  return Herman;
})(window.Herman || {}, window.jQuery);
