import sinon from 'sinon';

import lunr from 'lunr';

import * as search from 'search';

describe('search', function() {
  describe('getSearchData', function() {
    before(function() {
      this.xhr = sinon.useFakeXMLHttpRequest();
      var requests = (this.requests = []);

      this.xhr.onCreate = function(xhr) {
        requests.push(xhr);
      };
    });

    after(function() {
      this.xhr.restore();
    });

    beforeEach(function() {
      this.href = window.location.href;
      window.history.replaceState(null, document.title, '/?q=test');
    });

    afterEach(function() {
      this.requests = [];
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
      sinon.spy(search, 'showResults');
      doSearch({ store: 'store', idx: '' });
    });
  });
});
