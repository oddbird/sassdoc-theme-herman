import sinon from 'sinon';

import lunr from 'lunr';

import * as search from 'search';

describe('search', function() {
  describe('getSource', function() {
    it('returns a simple object', function() {
      const name = 'test';
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
      const actual = search.getSource('test');
      expect(actual).to.deep.equal(expected);
    });
  });

  describe('highlightSearchResult', function() {
    beforeEach(function() {
      this.el = $(
        '<div>' +
          '<span data-result-field="title">This is a title</span>' +
          '<span data-result-field="contents">' +
          'This <em>is</em> a long test that has lots of words in it and ' +
          'similar things ' +
          'and so on just to mix things up? Maybe it should be a lot longer, ' +
          "so we can get to <em>the</em> length minimum we're aiming for." +
          '</span>' +
          '</div>'
      );
    });

    it('sets no mark on the title if no title', function() {
      const title = [];
      const contents = [
        {
          start: 4,
          length: 3,
        },
      ];
      search.highlightSearchResult(this.el, { title, contents });
      // @@@ test if no mark?
    });

    it('sets no mark on the contents if no contents', function() {
      const title = [
        {
          start: 2,
          length: 3,
        },
      ];
      const contents = [];
      search.highlightSearchResult(this.el, { title, contents });
      // @@@ test if no mark?
    });

    // it('does other things with non-text nodes', function() {
    //   const title = [
    //     {
    //       start: 2,
    //       length: 3,
    //     },
    //   ];
    //   const contents = [
    //     {
    //       start: 4,
    //       length: 3,
    //     },
    //   ];
    //   search.highlightSearchResult(this.el, { title, contents });
    // });
  });

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
