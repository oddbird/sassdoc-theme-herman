import lunr from 'lunr';

import * as search from '../../assets/js/search';
import { createXHRmock } from './utils';

jest.spyOn(search.nunjucksEnv, 'render').mockImplementation((name, ctx) => {
  switch (name) {
    case 'search_result.njk': {
      const el = $('<li class="search-result text-block">');
      el.append(`<h2><a data-result-field="title">${ctx.title}</a></h2>`);
      el.append(`<div data-result-field="contents">${ctx.contents}</div>`);
      return el.get(0).outerHTML;
    }
    case 'search_results.njk': {
      const wrapper = $('<div>');
      const heading = $('<h1 class="search-heading">');
      heading.append(`<span class="search-term">${ctx.term}`);
      heading.append(
        `${ctx.count || 'No'} ${ctx.count === 1 ? 'result' : 'results'}`,
      );
      wrapper.append(heading);
      if (ctx.count) {
        wrapper.append('<ul class="js-search-results search-results">');
      }
      return wrapper.html();
    }
  }
  return '';
});

const indexSearch = jest.fn();
jest.spyOn(lunr.Index, 'load').mockReturnValue({ search: indexSearch });

describe('nunjucksEnv Loader getSource', () => {
  it('returns a precompiled nunjucks tpl object', () => {
    const name = 'foo';
    window.nunjucksPrecompiled = {
      [name]: 'test',
    };
    const expected = {
      src: {
        type: 'code',
        obj: window.nunjucksPrecompiled[name],
      },
      path: name,
    };
    const actual = search.getSource(name);
    expect(actual).toEqual(expected);
  });
});

describe('highlightSearchResult', () => {
  let el, titleEl, textEl;

  beforeEach(() => {
    const ctx = {
      title: 'This is a title',
      contents:
        'This is a long test that has lots of words in it and similar ' +
        'things and so on just to mix things up? Maybe it should be a ' +
        "lot longer, so we can get to the length minimum we're aiming for.",
    };
    el = $('<li>');
    el.append(`<h2><a data-result-field="title">${ctx.title}</a></h2>`);
    el.append(`<div data-result-field="contents">${ctx.contents}</div>`);
    titleEl = el.find('[data-result-field="title"]').get(0);
    textEl = el.find('[data-result-field="contents"]').get(0);
  });

  it('sets no mark on the title if no title', () => {
    const title = [];
    const contents = [
      { start: 4, length: 3 },
      { start: 10, length: 3 },
    ];
    search.highlightSearchResult(el, { title, contents });
    expect(titleEl.childNodes).toHaveLength(1);
    expect(textEl.childNodes.length).toBeGreaterThan(1);
  });

  it('sets no mark on the contents if no contents', () => {
    const title = [{ start: 2, length: 3 }];
    const contents = [{ start: 0, length: 0 }];
    search.highlightSearchResult(el, { title, contents });
    expect(titleEl.childNodes.length).toBeGreaterThan(1);
    expect(textEl.childNodes).toHaveLength(1);
  });

  it('truncates long text between matches', () => {
    const title = [];
    // Matches "This" and "minimum"
    const contents = [
      { start: 0, length: 4 },
      { start: 162, length: 7 },
    ];
    search.highlightSearchResult(el, { title, contents });
    const expected =
      'This is a long test that has lots of words in it and similar things ' +
      '… Maybe it should be a lot longer, so we can get to the length ' +
      "minimum we're aiming for.";
    expect(textEl).toHaveTextContent(expected);
  });

  it('truncates long text before initial match', () => {
    const title = [];
    // Matches "minimum"
    const contents = [{ start: 162, length: 7 }];
    search.highlightSearchResult(el, { title, contents });
    const expected =
      '… Maybe it should be a lot longer, so we can get to the length ' +
      "minimum we're aiming for.";
    expect(textEl).toHaveTextContent(expected);
  });

  it('truncates long text after final match', () => {
    const title = [];
    // Matches "This"
    const contents = [{ start: 0, length: 4 }];
    search.highlightSearchResult(el, { title, contents });
    const expected =
      'This is a long test that has lots of words in it and similar things …';
    expect(textEl).toHaveTextContent(expected);
  });
});

describe('showResults', () => {
  let matches, results;

  beforeEach(() => {
    search.setSearchStore({
      'some-key': { title: 'A doc title', contents: 'Some contents' },
    });
    matches = [
      {
        ref: 'some-key',
        matchData: {
          metadata: {
            term1: {
              title: { position: [[1, 2]] },
              contents: { position: [[2, 3]] },
            },
            term2: {
              title: { position: [[5, 2]] },
              contents: { position: [[6, 3]] },
            },
          },
        },
      },
    ];
    results = $('<div data-page>').appendTo('body');
  });

  afterEach(() => {
    search.setSearchStore();
    results.remove();
  });

  it('renders each search match', () => {
    search.showResults(matches, 'val');
    expect(search.nunjucksEnv.render).toHaveBeenCalledTimes(2);
    expect(results.text()).toMatch('1 result');

    const titleEl = results.find('[data-result-field="title"]');
    const textEl = results.find('[data-result-field="contents"]');
    const expectedTitle =
      'A<mark data-markjs="true"> d</mark>' +
      'oc<mark data-markjs="true"> t</mark>itle';
    const expectedContents =
      'So<mark data-markjs="true">me </mark>' +
      'c<mark data-markjs="true">ont</mark>ents';
    expect(titleEl.html()).toEqual(expectedTitle);
    expect(textEl.html()).toEqual(expectedContents);
  });

  it('does not show contents if no content matches', () => {
    matches[0].matchData.metadata = {
      term1: { title: { position: [1, 2] } },
      term2: { title: { position: [1, 2] } },
    };
    search.showResults(matches, 'val');

    const textEl = results.find('[data-result-field="contents"]');
    expect(textEl.get(0)).toBeEmptyDOMElement();
  });

  it('shows "No results" if no relevant match data', () => {
    matches[0].matchData.metadata = {
      term1: {},
      term2: {},
    };
    search.showResults(matches, 'val');

    expect(search.nunjucksEnv.render).toHaveBeenCalledTimes(1);
    expect(results.text()).toMatch('No results');
  });
});

describe('doSearch', () => {
  let results;

  beforeEach(() => {
    results = $('<div data-page>').appendTo('body');
  });

  afterEach(() => {
    search.setSearchStore();
    results.remove();
  });

  it('searches an index', () => {
    search.doSearch({ store: 'store', idx: 'index' }, 'val');
    expect(search.getSearchStore()).toEqual('store');
    expect(lunr.Index.load).toHaveBeenCalledWith('index');
    expect(indexSearch).toHaveBeenCalledWith('val');
    expect(results.text()).toMatch('No results');
  });

  it('does nothing with missing data', () => {
    search.doSearch({ store: 'store', idx: 'index' });
    expect(search.getSearchStore()).toBeUndefined();
    expect(lunr.Index.load).not.toHaveBeenCalled();
    expect(indexSearch).not.toHaveBeenCalled();
    expect(results.get(0)).toBeEmptyDOMElement();
  });
});

describe('getSearchData', () => {
  let href, XMLHttpRequest, req;

  beforeEach(() => {
    XMLHttpRequest = window.XMLHttpRequest;
    req = {};
    createXHRmock(req);
    href = window.location.href;
    window.history.replaceState(null, document.title, '/?q=test');
  });

  afterEach(() => {
    window.XMLHttpRequest = XMLHttpRequest;
    window.history.replaceState(null, document.title, href);
    search.setSearchStore();
  });

  it('only searches with a q in the query string', () => {
    search.getSearchData();
    expect(req.send).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a q in the query string', () => {
    window.history.replaceState(null, document.title, '/');
    search.getSearchData();
    expect(req.send).not.toHaveBeenCalled();
  });

  it('handles 200 response', () => {
    search.getSearchData();
    req.onload.call({
      status: 200,
      responseText: JSON.stringify({
        idx: 'lunr index',
        store: 'Hey there',
      }),
    });

    expect(search.getSearchStore()).toEqual('Hey there');
    expect(lunr.Index.load).toHaveBeenCalledTimes(1);
    expect(lunr.Index.load).toHaveBeenCalledWith('lunr index');
    expect(indexSearch).toHaveBeenCalledTimes(1);
    expect(indexSearch).toHaveBeenCalledWith('test');
  });

  it('does not search on 404', () => {
    search.getSearchData();
    req.onload.call({ status: 404 });

    expect(search.getSearchStore()).toBeUndefined();
    expect(lunr.Index.load).not.toHaveBeenCalled();
    expect(indexSearch).not.toHaveBeenCalled();
  });

  it('does not search on xhr error', () => {
    search.getSearchData();
    req.onerror();

    expect(search.getSearchStore()).toBeUndefined();
    expect(lunr.Index.load).not.toHaveBeenCalled();
    expect(indexSearch).not.toHaveBeenCalled();
  });
});
