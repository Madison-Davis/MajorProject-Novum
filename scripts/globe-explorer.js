(function () {
  'use strict';

  var atlases = [
    { label: "Paul's three journeys", description: "Routes and places associated with Paul's three journeys." },
    { label: "Jesus' journey", description: "Places associated with the life and ministry of Jesus." },
    { label: "Moses' journey", description: "Places associated with the story of Moses." },
    { label: "Biblical books", discoveryTimeline: true },
    { label: "Archaeological discoveries", description: "Archaeological discoveries connected to biblical history." },
    { label: "Christianity spreading", description: "The spread of early Christianity across the ancient world." }
  ];

  window.createGlobeExplorer = function (options) {
    var selected = -1;
    var discoveries = options.discoveries;
    var records = discoveries.records.slice().sort(function (a, b) { return a.period[0] - b.period[0]; });
    var firstYear = sliderYear(records[0].period[0]);
    var lastYear = sliderYear(Math.max.apply(null, records.map(function (record) { return record.period[1]; })));
    var year = firstYear;
    var book = '';
    var active = null;
    var visibleRecords = [];
    var root = document.createElement('div');
    root.className = 'globe-explorer';

    function element(tag, className, text, parent) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text != null) node.textContent = text;
      if (parent) parent.appendChild(node);
      return node;
    }

    function button(label, className, parent, action) {
      var node = element('button', className, label, parent);
      node.type = 'button';
      node.addEventListener('click', action);
      return node;
    }

    // Use consecutive slider values across the boundary from 1 BCE to 1 CE.
    function sliderYear(historicalYear) {
      return historicalYear < 0 ? historicalYear + 1 : historicalYear;
    }

    function formatYear(value) {
      return value <= 0 ? (1 - value) + ' BCE' : value + ' CE';
    }

    var nav = element('nav', 'explorer-categories', null, root);
    nav.setAttribute('aria-label', 'Biblical history atlases');
    var categoryButtons = atlases.map(function (atlas, index) {
      var node = button(atlas.label, '', nav, function () {
        selected = selected === index ? -1 : index;
        renderDetails();
        updateCategories();
      });
      return node;
    });

    var workspace = element('div', 'explorer-workspace', null, root);
    var overview = element('aside', 'explorer-panel explorer-intro-panel', null, workspace);
    overview.setAttribute('aria-label', 'Novum atlas overview');
    element('p', 'explorer-eyebrow', 'NOVUM ATLAS', overview);
    element('h1', '', 'Explore biblical history', overview);
    element('p', 'explorer-muted', 'Choose a story type to explore its places and journeys.', overview);
    var stats = element('div', 'explorer-stats', null, overview);
    element('strong', '', String(atlases.length) + ' story types', stats);
    var rotation = element('div', 'explorer-rotation', null, overview);
    element('p', 'explorer-label', 'Globe rotation', rotation);
    var spin = button('', 'explorer-control-button', rotation, function () {
      options.setSpin(!options.isSpinning());
      updateSpin();
    });

    var center = element('section', 'explorer-globe', null, workspace);
    center.setAttribute('aria-label', 'Interactive Earth globe');
    center.appendChild(options.container);
    var hint = element('p', 'explorer-globe-hint', 'Drag to explore · Choose an atlas above', center);
    var timeline = element('div', 'explorer-timeline', null, center);
    var timelineHeader = element('div', 'explorer-timeline-header', null, timeline);
    var yearLabel = element('label', 'explorer-label', 'Artifact date', timelineHeader);
    yearLabel.htmlFor = 'artifact-year';
    var currentYear = element('output', '', null, timelineHeader);
    currentYear.htmlFor = 'artifact-year';
    var slider = element('input', '', null, timeline);
    slider.id = 'artifact-year';
    slider.type = 'range';
    slider.min = firstYear;
    slider.max = lastYear;
    var timelineYears = element('div', 'explorer-timeline-years explorer-muted', null, timeline);
    element('span', '', formatYear(firstYear), timelineYears);
    element('span', '', formatYear(lastYear), timelineYears);
    element('p', 'explorer-timeline-map-help explorer-muted', 'Drag to rotate · Scroll or pinch to zoom', timeline);
    var timelineActions = element('div', 'explorer-timeline-actions', null, timeline);
    var previous = button('Previous date', 'explorer-control-button', timelineActions, function () {
      changeYear(artifactYears().filter(function (value) { return value < year; }).pop());
    });
    button('Reset view', 'explorer-control-button', timelineActions, function () {
      options.fitDiscoverySites();
      updateSpin();
    });
    var next = button('Next date', 'explorer-control-button', timelineActions, function () {
      changeYear(artifactYears().find(function (value) { return value > year; }));
    });
    slider.addEventListener('input', function () { changeYear(Number(slider.value)); });

    var details = element('aside', 'explorer-panel explorer-details', null, workspace);
    details.setAttribute('aria-label', 'Atlas details');
    var detailHeader = element('div', 'explorer-detail-header', null, details);
    element('p', 'explorer-eyebrow', 'ATLAS DETAILS', detailHeader);
    var clear = button('×', 'explorer-close', detailHeader, function () {
      selected = -1;
      renderDetails();
      updateCategories();
    });
    clear.setAttribute('aria-label', 'Clear selected atlas');
    var detailBody = element('div', 'explorer-detail-body', null, details);
    var filter = element('div', 'explorer-book-filter', null, detailBody);
    var filterLabel = element('label', 'explorer-label', 'Biblical book', filter);
    filterLabel.htmlFor = 'discovery-book';
    var bookSelect = element('select', 'explorer-input', null, filter);
    bookSelect.id = 'discovery-book';
    element('option', '', 'All indexed books', bookSelect).value = '';
    Array.from(new Set(records.reduce(function (books, record) {
      return books.concat(record.books);
    }, []))).sort(function (a, b) { return a.localeCompare(b); }).forEach(function (name) {
      element('option', '', name, bookSelect).value = name;
    });
    bookSelect.addEventListener('change', function () {
      book = bookSelect.value;
      renderDiscoveries();
    });
    var discoveryResults = element('div', '', null, detailBody);

    function artifactYears() {
      return records.filter(function (record) {
        return !book || record.books.includes(book);
      }).map(function (record) { return sliderYear(record.period[0]); });
    }

    function changeYear(value) {
      if (value === undefined) return;
      year = value;
      renderDiscoveries();
    }

    function focusSite(site) {
      options.setSpin(false);
      updateSpin();
      options.focusSite(site);
    }

    function selectRecord(record, focus) {
      active = active === record ? null : record;
      if (active && record.site && focus) focusSite(record.site);
      renderDiscoveries();
    }

    function renderDiscoveries() {
      visibleRecords = records.filter(function (record) {
        return sliderYear(record.period[0]) <= year && (!book || record.books.includes(book));
      });
      var visibleSites = new Set(visibleRecords.map(function (record) { return record.site; }).filter(Boolean));
      if (!visibleRecords.includes(active)) active = null;
      options.showSites(visibleSites, active && active.site);
      slider.value = year;
      currentYear.value = formatYear(year);
      slider.setAttribute('aria-valuetext', formatYear(year));
      var years = artifactYears();
      previous.disabled = !years.some(function (value) { return value < year; });
      next.disabled = !years.some(function (value) { return value > year; });

      discoveryResults.replaceChildren();
      var count = visibleSites.size;
      element('h3', 'explorer-discovery-count', count + (count === 1 ? ' mapped site' : ' mapped sites') +
        ' · ' + visibleRecords.length + (visibleRecords.length === 1 ? ' record' : ' records'), discoveryResults);
      if (!visibleRecords.length) {
        element('p', 'explorer-muted', 'Advance the timeline to see the first dated record for this selection.', discoveryResults);
        return;
      }

      var results = element('div', 'explorer-results', null, discoveryResults);
      visibleRecords.slice().reverse().forEach(function (record, index) {
        var site = discoveries.sites[record.site];
        var card = element('details', 'explorer-discovery', null, results);
        card.open = active === record;
        var summary = element('summary', '', null, card);
        element('span', 'explorer-project-name', record.title, summary);
        element('span', 'explorer-discovery-date', record.age, summary);
        element('span', 'explorer-project-location', site ? site.region : 'Unmapped', summary);
        var tags = element('span', 'explorer-book-tags', null, summary);
        var books = book ? [book].concat(record.books.filter(function (name) { return name !== book; })) : record.books;
        books.forEach(function (name) {
          element('span', 'explorer-book-tag', name, tags);
        });
        if (books.length > 3) element('span', 'explorer-book-tag-extra', '+' + (books.length - 3) + ' more', tags);
        summary.addEventListener('click', function (event) {
          event.preventDefault();
          selectRecord(record, true);
          discoveryResults.querySelectorAll('summary')[index].focus();
        });
        var body = element('div', 'explorer-discovery-body', null, card);
        if (site) element('p', 'explorer-muted', site.title, body);
        element('p', 'explorer-muted', 'Estimated range · ' + record.period.map(function (value) {
          return formatYear(sliderYear(value));
        }).join('–'), body);
        element('p', 'explorer-muted', 'Modern record · ' + record.discovery, body);
        element('p', 'explorer-muted', record.type, body);
        element('p', '', record.note, body);
        record.sources.forEach(function (source) {
          var link = element('a', '', source[0], body);
          link.href = source[1];
          link.target = '_blank';
          link.rel = 'noopener';
        });
      });
    }

    function renderDetails() {
      detailBody.replaceChildren();
      var atlas = atlases[selected];
      var isTimeline = Boolean(atlas && atlas.discoveryTimeline);
      options.setDiscoveryView(isTimeline);
      updateSpin();
      timeline.hidden = !isTimeline;
      hint.hidden = isTimeline;
      center.classList.toggle('explorer-globe-with-timeline', isTimeline);
      if (!isTimeline) options.showSites(new Set(), null);
      fitGlobe();
      clear.hidden = selected < 0;
      if (selected < 0) {
        element('div', 'explorer-empty-orbit', '◎', detailBody);
        element('h2', '', 'A world of stories', detailBody);
        element('p', 'explorer-muted', 'Select an atlas to see its focus. Places, routes, and historical details will be added in a later step.', detailBody);
        return;
      }
      element('h2', '', atlas.label, detailBody);
      if (isTimeline) {
        element('p', 'explorer-muted', 'The timeline dates the surviving artifacts. Each record appears at the start of its estimated range. Dots mark findspots and can represent multiple records.', detailBody);
        detailBody.append(filter, discoveryResults);
        renderDiscoveries();
        return;
      }
      element('p', 'explorer-project-description', atlas.description, detailBody);
      element('p', 'explorer-empty', 'Map details for this atlas are not available yet.', detailBody);
    }

    function updateCategories() {
      categoryButtons.forEach(function (node, index) {
        node.setAttribute('aria-pressed', String(index === selected));
      });
    }

    function updateSpin() {
      spin.textContent = options.isSpinning() ? 'Pause rotation' : 'Resume rotation';
      spin.setAttribute('aria-pressed', String(!options.isSpinning()));
    }

    options.section.appendChild(root);

    function fitGlobe() {
      var availableHeight = center.clientHeight - timeline.offsetHeight - hint.offsetHeight - 16;
      var size = Math.max(1, Math.floor(Math.min(center.clientWidth, availableHeight)));
      options.container.style.setProperty('--globe-size', size + 'px');
    }

    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitGlobe).observe(center);
    window.addEventListener('resize', fitGlobe);
    fitGlobe();
    renderDetails();
    updateCategories();
    updateSpin();
    return {
      selectSite: function (site) {
        var record = visibleRecords.slice().reverse().find(function (item) { return item.site === site; });
        if (!record) return;
        active = record;
        renderDiscoveries();
        discoveryResults.querySelector('details[open]').scrollIntoView({ block: 'nearest' });
      }
    };
  };
})();
