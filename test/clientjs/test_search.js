import lunr from 'lunr';

import * as search from 'search';

describe('search', function() {
  describe('nunjucksEnv Loader getSource', function() {
    it('returns a precompiled nunjucks tpl object', function() {
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
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('highlightSearchResult', function() {
    beforeEach(function() {
      const ctx = {
        title: 'This is a title',
        contents:
          'This is a long test that has lots of words in it and similar ' +
          'things and so on just to mix things up? Maybe it should be a ' +
          "lot longer, so we can get to the length minimum we're aiming for.",
      };
      this.el = $(search.nunjucksEnv.render('search_result.njk', ctx));
      this.titleEl = this.el.find('[data-result-field="title"]').get(0);
      this.textEl = this.el.find('[data-result-field="contents"]').get(0);
    });

    it('sets no mark on the title if no title', function() {
      const title = [];
      const contents = [{ start: 4, length: 3 }, { start: 10, length: 3 }];
      search.highlightSearchResult(this.el, { title, contents });
      expect(this.titleEl.childNodes.length).to.equal(1);
      expect(this.textEl.childNodes.length).to.be.above(1);
    });

    it('sets no mark on the contents if no contents', function() {
      const title = [{ start: 2, length: 3 }];
      const contents = [{ start: 0, length: 0 }];
      search.highlightSearchResult(this.el, { title, contents });
      expect(this.titleEl.childNodes.length).to.be.above(1);
      expect(this.textEl.childNodes.length).to.equal(1);
    });

    it('truncates long text between matches', function() {
      const title = [];
      // Matches "This" and "minimum"
      const contents = [{ start: 0, length: 4 }, { start: 162, length: 7 }];
      search.highlightSearchResult(this.el, { title, contents });
      const expected =
        'This is a long test that has lots of words in it and similar things ' +
        '… Maybe it should be a lot longer, so we can get to the length ' +
        "minimum we're aiming for.";
      expect(this.textEl.textContent).to.equal(expected);
    });

    it('truncates long text before initial match', function() {
      const title = [];
      // Matches "minimum"
      const contents = [{ start: 162, length: 7 }];
      search.highlightSearchResult(this.el, { title, contents });
      const expected =
        '… Maybe it should be a lot longer, so we can get to the length ' +
        "minimum we're aiming for.";
      expect(this.textEl.textContent).to.equal(expected);
    });

    it('truncates long text after final match', function() {
      const title = [];
      // Matches "This"
      const contents = [{ start: 0, length: 4 }];
      search.highlightSearchResult(this.el, { title, contents });
      const expected =
        'This is a long test that has lots of words in it and similar things …';
      expect(this.textEl.textContent).to.equal(expected);
    });
  });

  describe('showResults', function() {
    beforeEach(function() {
      this.nunjucksRender = sinon.spy(search.nunjucksEnv, 'render');
      search.setSearchStore({
        'some-key': { title: 'A doc title', contents: 'Some contents' },
      });
      this.matches = [
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
      this.results = $('<div data-sassdoc-page>').appendTo('body');
    });

    afterEach(function() {
      this.nunjucksRender.restore();
      search.setSearchStore();
      this.results.remove();
    });

    it('renders each search match', function() {
      search.showResults(this.matches, 'val');
      expect(this.nunjucksRender).to.have.been.calledTwice;
      expect(this.results).to.contain('1 result');

      const titleEl = this.results.find('[data-result-field="title"]');
      const textEl = this.results.find('[data-result-field="contents"]');
      const expectedTitle =
        'A<mark data-markjs="true"> d</mark>' +
        'oc<mark data-markjs="true"> t</mark>itle';
      const expectedContents =
        'So<mark data-markjs="true">me </mark>' +
        'c<mark data-markjs="true">ont</mark>ents';
      expect(titleEl.html()).to.equal(expectedTitle);
      expect(textEl.html()).to.equal(expectedContents);
    });

    it('does not show contents if no content matches', function() {
      this.matches[0].matchData.metadata = {
        term1: { title: { position: [1, 2] } },
        term2: { title: { position: [1, 2] } },
      };
      search.showResults(this.matches, 'val');

      const textEl = this.results.find('[data-result-field="contents"]');
      expect(textEl).to.be.empty;
    });

    it('shows "No results" if no relevant match data', function() {
      this.matches[0].matchData.metadata = {
        term1: {},
        term2: {},
      };
      search.showResults(this.matches, 'val');

      expect(this.nunjucksRender).to.have.been.calledOnce;
      expect(this.results).to.contain('No results');
    });
  });

  describe('doSearch', function() {
    beforeEach(function() {
      this.indexSearch = sinon.stub();
      this.indexLoad = sinon.stub(lunr.Index, 'load');
      this.indexLoad.returns({ search: this.indexSearch });
      this.results = $('<div data-sassdoc-page>').appendTo('body');
    });

    afterEach(function() {
      this.indexLoad.restore();
      search.setSearchStore();
      this.results.remove();
    });

    it('searches an index', function() {
      search.doSearch({ store: 'store', idx: 'index' }, 'val');
      expect(search.getSearchStore()).to.equal('store');
      expect(this.indexLoad).to.have.been.calledWith('index');
      expect(this.indexSearch).to.have.been.calledWith('val');
      expect(this.results).to.contain('No results');
    });

    it('does nothing with missing data', function() {
      search.doSearch({ store: 'store', idx: 'index' });
      expect(search.getSearchStore()).to.be.undefined;
      expect(this.indexLoad).to.have.not.been.called;
      expect(this.indexSearch).to.have.not.been.called;
      expect(this.results).to.be.empty;
    });
  });

  describe('getSearchData', function() {
    beforeEach(function() {
      this.href = window.location.href;
      window.history.replaceState(null, document.title, '/?q=test');
      this.indexSearch = sinon.stub();
      this.indexLoad = sinon.stub(lunr.Index, 'load');
      this.indexLoad.returns({ search: this.indexSearch });
    });

    afterEach(function() {
      window.history.replaceState(null, document.title, this.href);
      this.indexLoad.restore();
      search.setSearchStore();
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

    it('handles 200 response', function() {
      search.getSearchData();
      this.respondTo('/search-data.json', 200, {
        idx: 'lunr index',
        store: 'Hey there',
      });

      expect(search.getSearchStore()).to.equal('Hey there');
      expect(this.indexLoad).to.have.been.calledOnceWith('lunr index');
      expect(this.indexSearch).to.have.been.calledOnceWith('test');
    });

    it('does not search on 404', function() {
      search.getSearchData();
      this.respondTo('/search-data.json', 404);

      expect(search.getSearchStore()).to.be.undefined;
      expect(this.indexLoad).not.to.have.been.called;
      expect(this.indexSearch).not.to.have.been.called;
    });

    it('does not search on xhr error', function() {
      search.getSearchData();
      this.getRequest('GET', '/search-data.json').error();

      expect(search.getSearchStore()).to.be.undefined;
      expect(this.indexLoad).not.to.have.been.called;
      expect(this.indexSearch).not.to.have.been.called;
    });
  });
});
