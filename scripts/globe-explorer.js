(function () {
  'use strict';

  var atlases = [
    { label: "Paul's three journeys", missions: true },
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
    var paul = options.missions;
    var missionIndex = 0;
    var routeEnd = paul.missions[0].stops.length - 1;
    var selectedStop = -1;
    var postActsSelected = false;
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

    function externalLink(label, href, parent) {
      var link = element('a', '', label, parent);
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';
      return link;
    }

    function passageLink(passage, parent) {
      return externalLink(passage, 'https://www.biblegateway.com/passage/?version=NRSVUE&search=' +
        encodeURIComponent(passage.replace(/–/g, '-')), parent);
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
    var overviewHeader = element('header', 'explorer-overview-header', null, overview);
    element('p', 'explorer-eyebrow', 'NOVUM ATLAS', overviewHeader);
    element('h1', '', 'Explore biblical stories', overviewHeader);
    var overviewBody = element('div', 'explorer-overview-body', null, overview);

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
    });
    var next = button('Next date', 'explorer-control-button', timelineActions, function () {
      changeYear(artifactYears().find(function (value) { return value > year; }));
    });
    slider.addEventListener('input', function () { changeYear(Number(slider.value)); });

    var routeControls = element('div', 'explorer-timeline explorer-mission-controls', null, center);
    var missionChoices = element('div', 'explorer-mission-choices', null, routeControls);
    missionChoices.setAttribute('role', 'group');
    missionChoices.setAttribute('aria-label', 'Choose a mission');
    var missionButtons = paul.missions.map(function (mission, index) {
      return button(mission.label, 'explorer-control-button', missionChoices, function () {
        selectMission(index);
      });
    });
    var routeHeader = element('div', 'explorer-timeline-header', null, routeControls);
    var routeLabel = element('label', 'explorer-label', 'Route stops', routeHeader);
    routeLabel.htmlFor = 'mission-stop';
    var routeOutput = element('output', '', null, routeHeader);
    routeOutput.htmlFor = 'mission-stop';
    var routeSlider = element('input', '', null, routeControls);
    routeSlider.id = 'mission-stop';
    routeSlider.type = 'range';
    routeSlider.min = 1;
    routeSlider.addEventListener('input', function () { goToStop(Number(routeSlider.value) - 1); });
    var wheelDistance = 0;
    routeSlider.addEventListener('wheel', function (event) {
      if (event.ctrlKey || !event.deltaY) return;
      var direction = Math.sign(event.deltaY);
      var last = paul.missions[missionIndex].stops.length - 1;
      if ((direction < 0 && routeEnd === 0) || (direction > 0 && routeEnd === last)) {
        wheelDistance = 0;
        return;
      }
      event.preventDefault();
      if (Math.sign(wheelDistance) !== direction) wheelDistance = 0;
      wheelDistance += event.deltaMode ? direction * 40 : event.deltaY;
      if (Math.abs(wheelDistance) < 40) return;
      wheelDistance = 0;
      goToStop(routeEnd + direction);
    }, { passive: false });
    var routeActions = element('div', 'explorer-timeline-actions', null, routeControls);
    var previousStop = button('Previous stop', 'explorer-control-button', routeActions, function () { goToStop(routeEnd - 1); });
    button('Reset view', 'explorer-control-button', routeActions, function () {
      options.fitMission(missionIndex);
    });
    var nextStop = button('Next stop', 'explorer-control-button', routeActions, function () { goToStop(routeEnd + 1); });

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
    var missionOverview = element('div', 'explorer-mission-overview', null, overviewBody);
    element('h2', '', 'Paul’s journeys', missionOverview);
    var actsTimeline = element('ol', 'explorer-acts-timeline', null, missionOverview);
    var missionDetail = element('div', 'explorer-mission-detail', null, detailBody);

    function showLetter(letter, group) {
      selectedStop = -1;
      updateMissionRoute();
      missionDetail.replaceChildren();
      element('h2', '', letter[0], missionDetail);
      element('p', 'explorer-muted', group.label, missionDetail);
      element('p', '', letter[1], missionDetail);
      element('p', 'explorer-muted', 'Traditional association. Dating and attribution are debated for some letters.', missionDetail);
      passageLink(letter[0] + ' 1', missionDetail);
      revealMissionDetail();
    }

    function addLetterList(group, parent) {
      var list = element('ul', 'explorer-mission-books', null, parent);
      group.items.forEach(function (letter) {
        var item = element('li', '', null, list);
        button(letter[0], 'explorer-mission-book', item, function () { showLetter(letter, group); });
      });
    }

    var missionEntries = paul.missions.map(function (mission, missionNumber) {
      var item = element('li', '', null, actsTimeline);
      var accordion = element('details', 'explorer-mission-entry', null, item);
      var summary = element('summary', '', null, accordion);
      element('span', 'explorer-mission-passage', mission.passage, summary);
      element('strong', '', mission.label, summary);
      element('span', 'explorer-muted', mission.years, summary);
      summary.addEventListener('click', function (event) {
        event.preventDefault();
        if (missionIndex === missionNumber && !postActsSelected && accordion.open) {
          accordion.open = false;
        } else {
          selectMission(missionNumber);
        }
      });

      var body = element('div', 'explorer-mission-entry-body', null, accordion);
      element('p', 'explorer-muted', 'With ' + mission.companions, body);
      var group = paul.letters[missionNumber];
      element('p', 'explorer-label', mission.voyage ? 'Imprisonment letters' : 'Related books', body);
      addLetterList(group, body);
      var itinerary = element('details', 'explorer-mission-itinerary', null, body);
      element('summary', '', mission.stops.length + ' stops', itinerary);
      var list = element('ol', 'explorer-mission-stops', null, itinerary);
      var rows = mission.stops.map(function (stop, index) {
        var row = button('', 'explorer-mission-stop', element('li', '', null, list), function () {
          selectedStop = index;
          routeEnd = Math.max(routeEnd, index);
          updateMissionRoute();
          showStopDetail();
          revealMissionDetail();
        });
        element('span', '', paul.sites[stop.site].title, row);
        element('span', 'explorer-muted', stop.passage, row);
        return row;
      });
      return { accordion: accordion, rows: rows };
    });

    var postActsItem = element('li', '', null, actsTimeline);
    var postActs = element('details', 'explorer-mission-entry', null, postActsItem);
    var postActsSummary = element('summary', '', null, postActs);
    element('span', 'explorer-mission-passage', 'After Acts', postActsSummary);
    element('strong', '', 'Pastoral letters', postActsSummary);
    postActsSummary.addEventListener('click', function (event) {
      event.preventDefault();
      if (postActsSelected && postActs.open) postActs.open = false;
      else selectMission(paul.missions.length - 1, true);
    });
    var postActsBody = element('div', 'explorer-mission-entry-body', null, postActs);
    element('p', 'explorer-muted', 'Traditionally placed after Acts', postActsBody);
    paul.letters.slice(paul.missions.length).forEach(function (group) { addLetterList(group, postActsBody); });

    var missionSources = element('details', 'explorer-mission-other', null, missionOverview);
    element('summary', '', 'Map and sources', missionSources);
    element('p', 'explorer-muted', 'Lines connect places in itinerary order. Regional and inferred positions are approximate.', missionSources);
    externalLink('Journey map · Viz.Bible', 'https://viz.bible/journeys/', missionSources);
    externalLink('Coordinates · OpenBible.info (CC BY 4.0)', 'https://www.openbible.info/geo/', missionSources);
    externalLink('Voyage chronology · Cambridge Companion', 'https://assets.cambridge.org/97805217/81558/frontmatter/9780521781558_frontmatter.pdf', missionSources);
    externalLink('Paul’s letters overview', 'https://cartoonistbible.com/the-bible-bookshelf/pauls-letters/', missionSources);

    function selectMission(index, afterActs) {
      var changed = missionIndex !== index;
      if (changed) {
        var previousVoyage = Boolean(paul.missions[missionIndex].voyage);
        missionIndex = index;
        wheelDistance = 0;
        if (previousVoyage !== Boolean(paul.missions[index].voyage)) options.fitMission(index);
      }
      if (changed || afterActs) routeEnd = paul.missions[index].stops.length - 1;
      postActsSelected = Boolean(afterActs);
      selectedStop = -1;
      updateMissionSelection();
      updateMissionRoute(changed);
      showMissionDetail();
    }

    function updateMissionSelection() {
      missionButtons.forEach(function (node, index) {
        var current = index === missionIndex;
        node.setAttribute('aria-pressed', String(current));
        missionEntries[index].accordion.open = current && !postActsSelected;
        missionEntries[index].accordion.classList.toggle('explorer-mission-current', current && !postActsSelected);
      });
      postActs.open = postActsSelected;
      postActs.classList.toggle('explorer-mission-current', postActsSelected);
    }

    function goToStop(index) {
      routeEnd = index;
      selectedStop = index;
      updateMissionRoute();
      showStopDetail();
    }

    function updateMissionRoute(replay) {
      var mission = paul.missions[missionIndex];
      var position = routeEnd + 1;
      var current = paul.sites[mission.stops[routeEnd].site];
      routeSlider.max = mission.stops.length;
      routeSlider.value = position;
      routeOutput.value = position + ' of ' + mission.stops.length + ' · ' + current.title;
      routeSlider.setAttribute('aria-valuetext', routeOutput.value);
      previousStop.disabled = routeEnd === 0;
      nextStop.disabled = position === mission.stops.length;
      var stop = mission.stops[selectedStop];
      options.showMissionRoute(missionIndex, routeEnd, stop ? stop.site : null, replay);
      missionEntries[missionIndex].rows.forEach(function (row, index) {
        row.setAttribute('aria-pressed', String(index === selectedStop));
      });
    }

    function showMissionDetail() {
      var mission = paul.missions[missionIndex];
      missionDetail.replaceChildren();
      if (postActsSelected) {
        element('h2', '', 'Pastoral letters', missionDetail);
        element('p', 'explorer-muted', 'Traditionally placed after Acts', missionDetail);
        element('p', '', 'Acts ends with Paul in Rome. The dates and authorship of 1 Timothy, 2 Timothy, and Titus are debated.', missionDetail);
        element('p', 'explorer-muted', 'The map shows the voyage to Rome recorded in Acts.', missionDetail);
        details.scrollTop = 0;
        return;
      }
      element('h2', '', mission.label, missionDetail);
      element('p', 'explorer-muted', mission.years, missionDetail);
      element('p', '', mission.description || 'With ' + mission.companions, missionDetail);
      passageLink(mission.passage, missionDetail);
      element('p', 'explorer-muted', 'Select a map dot or an itinerary stop to read what happened there.', missionDetail);
      details.scrollTop = 0;
    }

    function showStopDetail() {
      var stop = paul.missions[missionIndex].stops[selectedStop];
      var site = paul.sites[stop.site];
      missionDetail.replaceChildren();
      element('h2', '', site.title, missionDetail);
      element('p', 'explorer-muted', site.country + (site.approximate ? ' · Approximate position' : ''), missionDetail);
      element('p', '', stop.note, missionDetail);
      passageLink(stop.passage, missionDetail);
    }

    function revealMissionDetail() {
      details.scrollTop = 0;
      if (window.matchMedia('(max-width: 800px)').matches) details.scrollIntoView({ block: 'start' });
    }

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

    function selectRecord(record, focus) {
      active = active === record ? null : record;
      if (active && record.site && focus) options.focusSite(record.site);
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
        record.sources.forEach(function (source) { externalLink(source[0], source[1], body); });
      });
    }

    function renderDetails() {
      detailBody.replaceChildren();
      overviewBody.replaceChildren();
      var atlas = atlases[selected];
      var isTimeline = Boolean(atlas && atlas.discoveryTimeline);
      var isMission = Boolean(atlas && atlas.missions);
      options.setAtlasView(isTimeline ? 'books' : isMission ? 'missions' : null);
      root.classList.toggle('explorer-missions-active', isMission);
      timeline.hidden = !isTimeline;
      routeControls.hidden = !isMission;
      hint.hidden = isTimeline || isMission;
      center.classList.toggle('explorer-globe-with-timeline', isTimeline || isMission);
      if (!isMission) options.showMissionRoute(null);
      if (!isTimeline && !isMission) options.showSites(new Set(), null);
      fitGlobe();
      clear.hidden = selected < 0;
      if (!atlas) {
        element('p', 'explorer-muted', 'Choose a topic from the atlas menu.', overviewBody);
        return;
      }
      if (isMission) {
        overviewBody.append(missionOverview);
        detailBody.append(missionDetail);
        options.fitMission(missionIndex);
        updateMissionSelection();
        updateMissionRoute();
        if (selectedStop >= 0) showStopDetail();
        else showMissionDetail();
        return;
      }
      element('h2', '', atlas.label, overviewBody);
      if (isTimeline) {
        element('p', 'explorer-muted', 'The timeline dates surviving artifacts. Records appear at the start of their estimated ranges. Each dot marks a findspot.', overviewBody);
        overviewBody.append(filter);
        element('h2', '', 'Biblical books', detailBody);
        detailBody.append(discoveryResults);
        options.fitDiscoverySites();
        renderDiscoveries();
        return;
      }
      element('p', 'explorer-muted', atlas.description, overviewBody);
      element('p', 'explorer-muted', 'Map details for this topic are not available yet.', detailBody);
    }

    function updateCategories() {
      categoryButtons.forEach(function (node, index) {
        node.setAttribute('aria-pressed', String(index === selected));
      });
    }

    options.section.appendChild(root);

    function fitGlobe() {
      var availableHeight = center.clientHeight - timeline.offsetHeight - routeControls.offsetHeight - hint.offsetHeight - 16;
      var size = Math.max(1, Math.floor(Math.min(center.clientWidth, availableHeight)));
      options.container.style.setProperty('--globe-size', size + 'px');
    }

    if (typeof ResizeObserver !== 'undefined') {
      var globeObserver = new ResizeObserver(fitGlobe);
      [center, timeline, routeControls].forEach(function (node) { globeObserver.observe(node); });
    }
    window.addEventListener('resize', fitGlobe);
    fitGlobe();
    renderDetails();
    updateCategories();
    return {
      selectSite: function (site) {
        if (atlases[selected] && atlases[selected].missions) {
          var stops = paul.missions[missionIndex].stops;
          // Prefer the latest visit to this site on the portion of the route shown.
          var index = stops.slice(0, routeEnd + 1).map(function (stop) { return stop.site; }).lastIndexOf(site);
          if (index >= 0) {
            selectedStop = index;
            updateMissionRoute();
            showStopDetail();
            revealMissionDetail();
          }
          return;
        }
        var record = visibleRecords.slice().reverse().find(function (item) { return item.site === site; });
        if (!record) return;
        active = record;
        renderDiscoveries();
        discoveryResults.querySelector('details[open]').scrollIntoView({ block: 'nearest' });
      }
    };
  };
})();
