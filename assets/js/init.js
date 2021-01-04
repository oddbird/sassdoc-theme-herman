import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
import 'srcdoc-polyfill';

import * as base from './base';
import hljs from './vendor/highlight';

window.$ = $;

$(() => {
  hljs.initHighlighting();
  base.initializeToggles();
  base.initializeIframes();
  base.initializeNav();
});
