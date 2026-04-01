import '@testing-library/jest-dom';

// eslint-disable-next-line import-x/no-named-as-default
import $ from 'jquery/slim';

beforeAll(() => {
  window.$ = $;
});

afterEach(() => {
  $(window).off('resize');
  $('body').off('click toggle:close toggle:open target:close target:open');
});
