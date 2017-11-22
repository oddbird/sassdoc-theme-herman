window.Herman = (function base(Herman, $) {
  'use strict';

  // Store keycode variables for easier readability
  const KEYCODES = {
    SPACE: 32,
    ENTER: 13,
    TAB: 9,
    ESC: 27,
    BACKSPACE: 8,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    CAPS: 20,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    COMMA: 44,
  };

  Herman.initializeToggles = function initializeToggles() {
    const body = $('body');

    body.on('toggle:close', '[data-toggle="button"]', function cb() {
      const id = $(this).attr('aria-controls');
      const target = $(`[data-target-id="${id}"]`);
      const openToggles = $(
        `[data-toggle="button"][aria-controls="${id}"][aria-pressed="true"]`
      );
      openToggles.attr('aria-pressed', 'false');
      target.trigger('target:close');
    });

    body.on('toggle:open', '[data-toggle="button"]', function cb() {
      const toggle = $(this);
      const targetID = toggle.attr('aria-controls');
      const target = $(`[data-target-id="${targetID}"]`);
      const otherToggles = $(
        `[data-toggle="button"][aria-controls="${targetID}"]`
      ).not(toggle);
      // If this is a synced toggle, open all other attached toggles
      if (toggle.data('toggle-synced')) {
        otherToggles
          .filter('[data-toggle-synced="true"]')
          .attr('aria-pressed', 'true');
        // Otherwise, close other attached toggles.
      } else {
        otherToggles
          .filter('[aria-pressed="true"]')
          .attr('aria-pressed', 'false');
      }
      toggle.attr('aria-pressed', 'true');
      target.trigger('target:open');
    });

    body.on('target:close', '[data-toggle="target"]', function cb(evt) {
      const target = $(this);
      // Prevent event firing on multiple nested targets
      if ($(evt.target).is(target)) {
        target.attr('aria-expanded', 'false');
      }
    });

    const closeTarget = function(target) {
      // Close a target and update any attached toggles
      const id = target.attr('data-target-id');
      const openToggles = $(
        `[data-toggle="button"][aria-controls="${id}"][aria-pressed="true"]`
      );
      if (openToggles.length) {
        openToggles.trigger('toggle:close');
      } else {
        target.trigger('target:close');
      }
    };

    body.on('target:open', '[data-toggle="target"]', function cb(evt) {
      const target = $(this);
      // Prevent event firing on multiple nested targets
      if ($(evt.target).is(target)) {
        target.attr('aria-expanded', 'true');
      }
    });

    body.on('click', '[data-toggle="button"]', function cb(evt) {
      evt.preventDefault();
      const toggle = $(this);
      if (toggle.attr('aria-pressed') === 'true') {
        toggle.trigger('toggle:close');
      } else {
        toggle.trigger('toggle:open');
      }
    });

    body.on('click', '[data-toggle="close"]', function cb(evt) {
      evt.preventDefault();
      const target = $(`[data-target-id="${$(this).attr('aria-controls')}"]`);
      closeTarget(target);
    });

    const autoClose = function(newTarget, target) {
      const targetID = target.attr('data-target-id');
      const toggleClicked = newTarget.closest(`[aria-controls="${targetID}"]`)
        .length;
      const clickedElInDOM = document.contains(newTarget.get(0));
      const clickedOutsideTarget = !newTarget.closest(target).length;
      const exception = target.attr('data-auto-closing-exception');
      const clickedException = exception
        ? newTarget.closest(exception).length
        : false;
      if (
        !toggleClicked &&
        (target.data('auto-closing-on-any-click') ||
          (clickedElInDOM && clickedOutsideTarget && !clickedException))
      ) {
        closeTarget(target);
      }
    };

    body.on('click', evt => {
      const openTargets = $(
        '[data-toggle="target"][aria-expanded="true"][data-auto-closing="true"]'
      );
      openTargets.each((index, target) => {
        autoClose($(evt.target), $(target));
      });
    });
  };

  Herman.initializeTabs = function initializeTabs() {
    const body = $('body');

    const getAllTabsInGroup = function(tab) {
      const group = tab.attr('data-tab-group');
      return $(`[role="tab"][data-tab-group="${group}"]`);
    };

    const getAllPanelsInGroup = function(tab) {
      const group = tab.attr('data-tab-group');
      return $(`[role="tabpanel"][data-tab-group="${group}"]`);
    };

    const showPanel = function(tab) {
      const tabs = getAllTabsInGroup(tab);
      const panels = getAllPanelsInGroup(tab);
      const panel = panels.filter(`[aria-labelledby="${tab.attr('id')}"]`);
      tab.attr({ tabindex: 0, 'aria-selected': true });
      tabs
        .not(tab)
        .attr('tabindex', -1)
        .removeAttr('aria-selected');
      panel.removeAttr('aria-hidden').trigger('visible');
      panels.not(panel).attr('aria-hidden', true);
      tab.trigger('tab:active');
    };

    body.on('tabs:close', '[role="tab"]', function cb() {
      const tab = $(this);
      const tabs = getAllTabsInGroup(tab);
      const panels = getAllPanelsInGroup(tab);
      tabs.attr('tabindex', -1).removeAttr('aria-selected');
      panels.attr('aria-hidden', true);
    });

    body.on('click', '[role="tab"]', function cb(evt) {
      evt.preventDefault();
      showPanel($(this));
    });

    body.on('keydown', '[role="tab"]', function cb(evt) {
      const tab = $(this);
      const tabs = getAllTabsInGroup(tab);
      const idx = tabs.index(tab);
      let targetIdx = idx;
      switch (evt.which) {
        case KEYCODES.LEFT:
          targetIdx = idx > 0 ? idx - 1 : idx;
          break;
        case KEYCODES.RIGHT:
          targetIdx = idx + 1;
          break;
      }
      const target = tabs.eq(targetIdx);
      if (idx !== targetIdx && target.length) {
        showPanel(target);
        target.focus();
      }
    });
  };

  Herman.getUrlParams = () => window.deparam(window.location.search.substr(1));

  Herman.initializeIframes = function initializeIframes() {
    const fitIframeToContent = function(iframe) {
      if (iframe.contentWindow.document.body) {
        iframe.height = $(iframe.contentWindow.document).outerHeight(true);
      }
    };
    const fitIframesToContent = function() {
      $('iframe').each(function cb() {
        fitIframeToContent(this);
      });
    };

    fitIframesToContent();
    $('iframe').on('load', function cb() {
      fitIframeToContent(this);
    });
    $(window).on('resize', fitIframesToContent);
  };

  const showResults = function(results, val) {
    let matches = $();
    if (results && results.length) {
      for (const res of results) {
        const doc = Herman.searchStore[res.ref];
        const highlight = {
          title: [],
          text: [],
        };
        Object.keys(res.matchData.metadata).forEach(term => {
          Object.keys(res.matchData.metadata[term]).forEach(fieldName => {
            const pos = res.matchData.metadata[term][fieldName].position.map(
              p => ({
                start: p[0],
                length: p[1],
              })
            );
            const field = fieldName === 'title' ? 'title' : 'text';
            highlight[field] = highlight[field].concat(pos);
          });
        });
        const obj = {
          url: `/${res.ref}`,
          title: doc.title,
          text: highlight.text.length ? doc.text : '',
        };
        const el = $(window.nunjucks.render('search_result.j2', obj));
        el.find(`[data-result-field="title"]`).markRanges(highlight.title);
        if (highlight.text.length) {
          const textEl = el.find(`[data-result-field="text"]`);
          textEl.markRanges(highlight.text, {
            done: () => {
              textEl.get(0).childNodes.forEach(node => {
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
        matches = matches.add(el);
      }
    }
    const tpl = $(
      window.nunjucks.render('search_results.j2', {
        term: val,
        count: matches.length,
      })
    );
    tpl.filter('.js-search-results').html(matches);
    $('[data-sassdoc-region="main"]').html(tpl);
  };

  const doSearch = function(data, val) {
    Herman.searchStore = data.store;
    const idx = window.lunr.Index.load(data.idx);
    const results = idx.search(val);
    showResults(results, val);
  };

  Herman.getSearchData = function getSearchData() {
    const params = Herman.getUrlParams();
    const hasFuse = typeof window.Fuse !== undefined;
    const hasNunjucks = typeof window.nunjucks !== undefined;
    if (params && params.q && hasFuse && hasNunjucks) {
      let request = new XMLHttpRequest();
      request.open('GET', '/search-data.json', true);

      request.onreadystatechange = function onreadystatechange() {
        if (this.readyState === 4) {
          let data;
          if (this.status >= 200 && this.status < 400) {
            try {
              data = JSON.parse(this.responseText);
            } catch (e) {
              // swallow error
            }
          }
          doSearch(data, params.q);
        }
      };
      request.send();
      request = null;
    }
  };

  return Herman;
})(window.Herman || {}, window.jQuery);
