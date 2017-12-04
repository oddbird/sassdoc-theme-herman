import hljs from 'vendor/highlight';

import * as base from './base';

$(() => {
  window.$ = $;

  hljs.initHighlighting();
  base.initializeToggles();
  base.initializeIframes();
  base.initializeNav();
});
