import deparam from 'jquery-deparam';
import lunr from 'lunr';
import Mark from 'mark.js';
import nunjucks from 'nunjucks';

require('search_result.njk');
require('search_results.njk');

nunjucks.installJinjaCompat();
// The default WebLoader requires the precompiled templates to be available
// before nunjucks is initialized. Because we load some templates
// asynchronously, some templates might be added to the `window` global after
// that. To avoid this issue, we need a loader that checks the `window` object
// every time.
const PrecompiledLoader = nunjucks.Loader.extend({
  getSource: name => ({
    src: {
      type: 'code',
      obj: window.nunjucksPrecompiled[name],
    },
    path: name,
  }),
});
const nunjucksEnv = new nunjucks.Environment(new PrecompiledLoader());

let searchStore;

const getUrlParams = () => deparam(window.location.search.substr(1));

const getSearchResultsByField = matches => {
  const results = {
    title: [],
    contents: [],
  };
  Object.keys(matches).forEach(term => {
    Object.keys(matches[term]).forEach(fieldName => {
      // For each term found in each field, store position of matches
      const pos = matches[term][fieldName].position.map(p => ({
        start: p[0],
        length: p[1],
      }));
      // @@@ Temporary solution until fieldname bug is fixed:
      // https://github.com/olivernn/lunr.js/issues/320
      const field = fieldName === 'title' ? 'title' : 'contents';
      results[field] = results[field].concat(pos);
    });
  });
  return results;
};

const highlightSearchResult = (el, results) => {
  if (results.title.length) {
    // Highlight matches in `title` field
    const titleEl = el.find('[data-result-field="title"]').get(0);
    new Mark(titleEl).markRanges(results.title);
  }
  if (results.contents.length) {
    const textEl = el.find('[data-result-field="contents"]').get(0);
    results.contents.sort((a, b) => a.start - b.start);
    // Highlight first 5 matches in `contents` field
    new Mark(textEl).markRanges(results.contents.slice(0, 5), {
      done: () => {
        // Truncate text not within 15 words of a match
        textEl.childNodes.forEach(node => {
          const hasPrev = node.previousSibling !== null;
          const hasNext = node.nextSibling !== null;
          const isText = node.nodeName === '#text';
          if (isText) {
            const text = node.nodeValue.split(' ');
            if (hasPrev && hasNext) {
              if (text.length > 30) {
                text.splice(15, text.length - 30, '…');
              }
            } else if (hasNext) {
              if (text.length > 15) {
                text.splice(0, text.length - 15, '…');
              }
            } else if (hasPrev) {
              if (text.length > 15) {
                text.splice(15, text.length - 15, '…');
              }
            }
            node.nodeValue = text.join(' ');
          }
        });
      },
    });
  }
};

const showResults = (matches, val) => {
  let results = $();
  if (matches && matches.length) {
    for (const match of matches) {
      const doc = searchStore[match.ref];
      const toMark = getSearchResultsByField(match.matchData.metadata);
      if (!(toMark.title.length || toMark.contents.length)) {
        return;
      }
      const tplCtx = {
        url: `/${match.ref}`,
        title: doc.title,
        contents: toMark.contents.length ? doc.contents : '',
      };
      // Render search result template
      const el = $(nunjucksEnv.render('search_result.njk', tplCtx));
      // Highlight matches in search result text
      highlightSearchResult(el, toMark);
      // Add search result template to set of results
      results = results.add(el);
    }
  }
  const resultsTpl = $(
    nunjucksEnv.render('search_results.njk', {
      term: val,
      count: results.length,
    })
  );
  resultsTpl.filter('.js-search-results').html(results);
  $('[data-sassdoc-region="main"]').html(resultsTpl);
};

const doSearch = (data, val) => {
  // Grab doc store from data
  searchStore = data && data.store;
  // Initialize Lunr index from precompiled data
  const idx = lunr.Index.load(data.idx);
  const matches = idx.search(val);
  showResults(matches, val);
};

const getSearchData = () => {
  const params = getUrlParams();
  // Only fetch search data if on search results page with query term
  if (params && params.q) {
    const request = new XMLHttpRequest();
    request.open('GET', '/search-data.json', true);

    request.onload = function onload() {
      let data;
      if (this.status >= 200 && this.status < 400) {
        try {
          data = JSON.parse(this.responseText);
        } catch (e) {
          // swallow error
        }
      }
      doSearch(data, params.q);
    };

    request.onerror = function onerror() {
      doSearch(undefined, params.q);
    };

    request.send();
  }
};

$(() => {
  getSearchData();
});
