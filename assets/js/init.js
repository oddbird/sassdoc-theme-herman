import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
import 'srcdoc-polyfill';

import hljs from 'highlight.js/lib/common';
import django from 'highlight.js/lib/languages/django';

import * as base from './base';

window.$ = $;

$(() => {
  hljs.registerLanguage('django', django);
  hljs.highlightAll();
  base.initializeToggles();
  base.initializeIframes();
  base.initializeNav();
});
