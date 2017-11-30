import sinon from 'sinon';

import lunr from 'lunr';

import * as search from 'search';

describe('search', function() {
  describe('getSearchData', function() {
    beforeEach(function() {
      this.href = window.location.href;
      window.history.replaceState(null, document.title, '/?q=test');
    });

    afterEach(function() {
      window.history.replaceState(null, document.title, this.href);
    });

    it('only searches with a q in the query string', function() {
      search.getSearchData();
      expect(this.requests.length).to.equal(1);
    });

    it('does nothing without a q in the query string', function() {
      window.history.replaceState(null, document.title, '/');
      search.getSearchData();
      expect(this.requests.length).to.equal(0);
    });
  });

  describe('doSearch', function() {
    it('searches an index', function() {
      sinon.spy(lunr.Index, 'load');
      // sinon.spy(search, 'showResults');
      search.doSearch({ store: 'store', idx: '' });
    });
  });
});
