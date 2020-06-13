import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
import 'srcdoc-polyfill';

import hljs from 'vendor/highlight';

import * as base from './base';

window.$ = $;

$(() => {
  hljs.initHighlighting();
  base.initializeToggles();
  base.initializeIframes();
  base.initializeNav();
});
