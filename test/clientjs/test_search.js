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

  describe('showResults', function() {
    beforeEach(function() {
      this.nunjucksRender = sinon.spy(search.nunjucksEnv, 'render');
    });

    afterEach(function() {
      this.nunjucksRender.restore();
    });

    it('renders each search match', function() {
      search.setSearchStore({
        'some-key': {
          title: 'A doc',
          contents: 'Some contents',
        },
      });
      search.showResults(
        [
          {
            ref: 'some-key',
            matchData: {
              metadata: {
                term1: {
                  title: { position: [1, 2] },
                  contents: { position: [2, 3] },
                },
                term2: {
                  title: { position: [1, 2] },
                  contents: { position: [2, 3] },
                },
              },
            },
          },
        ],
        'val'
      );
      expect(this.nunjucksRender).to.have.been.called;
    });

    it('bails early with missing data', function() {
      search.setSearchStore({
        'some-key': {
          title: 'A doc',
          contents: 'Some contents',
        },
      });
      search.showResults(
        [
          {
            ref: 'some-key',
            matchData: {
              metadata: {
                term1: {},
                term2: {},
              },
            },
          },
        ],
        'val'
      );
      expect(this.nunjucksRender).to.have.not.been.called;
    });
  });

  describe('doSearch', function() {
    beforeEach(function() {
      this.indexSearch = sinon.stub();
      this.indexLoad = sinon.stub(lunr.Index, 'load');
      this.indexLoad.returns({ search: this.indexSearch });
    });

    afterEach(function() {
      this.indexLoad.restore();
    });

    it('searches an index', function() {
      search.doSearch({ store: 'store', idx: 'index' }, 'val');
      expect(this.indexLoad).to.have.been.calledWith('index');
      expect(this.indexSearch).to.have.been.calledWith('val');
    });

    it('does nothing with missing data', function() {
      search.doSearch({ store: 'store', idx: 'index' });
      expect(this.indexLoad).to.have.not.been.called;
      expect(this.indexSearch).to.have.not.been.called;
    });
  });
});
