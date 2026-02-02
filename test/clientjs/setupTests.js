import '@testing-library/jest-dom';

import $ from 'jquery/slim';

beforeAll(() => {
  window.$ = $;
});

afterEach(() => {
  $(window).off('resize');
  $('body').off('click toggle:close toggle:open target:close target:open');
});
