// Add ES2015 polyfills
import '@babel/polyfill';

import hljs from 'vendor/highlight';

import * as base from './base';

$(() => {
  window.$ = $;

  hljs.initHighlighting();
  base.initializeToggles();
  base.initializeTabs();
  base.initializeIframes();
});
