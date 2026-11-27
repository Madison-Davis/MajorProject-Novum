(function () {
  'use strict';

  var atlases = [
    { label: "Paul's three journeys", journey: "paul" },
    { label: "Jesus' journey", journey: "jesus" },
    { label: "Moses' journey", description: "Places associated with the story of Moses." },
    { label: "Biblical books", discoveryTimeline: true },
    { label: "Archaeological discoveries", archaeology: true },
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
    button('Reset view', 'explorer-control-button', timelineActions, options.resetArtifactView);
    var next = button('Next date', 'explorer-control-button', timelineActions, function () {
      changeYear(artifactYears().find(function (value) { return value > year; }));
    });
    slider.addEventListener('input', function () { changeYear(Number(slider.value)); });

    var routeHost = element('div', 'explorer-journey-controls', null, center);

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
    function buildJourneyAtlas(key, data) {
      var isPaul = key === 'paul';
      var missionIndex = 0;
      var routeEnd = isPaul ? data.missions[0].stops.length - 1 : 0;
      var selectedStop = -1;
      var selectedGospel = '';
      var phaseOpened = isPaul;
      var postActsSelected = false;
      var routeControls = element('div', 'explorer-timeline explorer-mission-controls', null, null);
      var routeOutput = element('output');
      var missionButtons = [];
      var routeSlider, previousStop, nextStop;
      var wheelDistance = 0;

      if (isPaul) {
        var missionChoices = element('div', 'explorer-mission-choices', null, routeControls);
        missionChoices.setAttribute('role', 'group');
        missionChoices.setAttribute('aria-label', isPaul ? 'Choose a mission' : 'Choose a period');
        missionButtons = data.missions.map(function (mission, index) {
          return button(mission.shortLabel || mission.label, 'explorer-control-button', missionChoices, function () {
            selectMission(index);
          });
        });
        var routeHeader = element('div', 'explorer-timeline-header', null, routeControls);
        var routeLabel = element('label', 'explorer-label', isPaul ? 'Route stops' : 'Journey events', routeHeader);
        routeLabel.htmlFor = key + '-route-stop';
        routeHeader.append(routeOutput);
        routeOutput.htmlFor = key + '-route-stop';
        routeSlider = element('input', '', null, routeControls);
        routeSlider.id = key + '-route-stop';
        routeSlider.type = 'range';
        routeSlider.min = 1;
        routeSlider.addEventListener('input', function () { goToStop(Number(routeSlider.value) - 1); });
        routeSlider.addEventListener('wheel', function (event) {
          if (event.ctrlKey || !event.deltaY) return;
          var direction = Math.sign(event.deltaY);
          var last = data.missions[missionIndex].stops.length - 1;
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
      }

      var routeActions = element('div', 'explorer-timeline-actions', null, routeControls);
      if (isPaul) {
        previousStop = button('Previous stop', 'explorer-control-button', routeActions, function () { goToStop(routeEnd - 1); });
      } else {
        routeControls.classList.add('explorer-gospel-map-controls');
        routeActions.append(routeOutput);
        routeOutput.className = 'explorer-gospel-map-event';
      }
      button('Reset view', 'explorer-control-button', routeActions, function () {
        options.fitMission(key, missionIndex, true);
      });
      if (isPaul) {
        nextStop = button('Next stop', 'explorer-control-button', routeActions, function () { goToStop(routeEnd + 1); });
      }

      var missionOverview = element('div', 'explorer-mission-overview', null, null);
      element('h2', '', data.title || 'Paul’s journeys', missionOverview);
      if (!isPaul) missionOverview.classList.add('explorer-gospel-overview');
      var actsTimeline = element('ol', 'explorer-acts-timeline', null, missionOverview);
      var missionDetail = element('div', 'explorer-mission-detail', null, null);

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

      function buildGospelTimeline(mission, parent) {
        var gospels = ['Matthew', 'Mark', 'Luke', 'John'];
        var timeline = element('div', 'explorer-gospel-timeline', null, parent);
        element('p', 'explorer-muted', 'Rows follow the rough story order. Select or drag along a Gospel track.', timeline);
        var grid = element('div', 'explorer-gospel-grid', null, timeline);
        grid.style.setProperty('--event-rows', String(mission.stops.length));

        var tracks = gospels.map(function (gospel) {
          var column = element('div', 'explorer-gospel-column', null, grid);
          element('h3', '', gospel, column);
          var lane = element('div', 'explorer-gospel-lane', null, column);
          lane.setAttribute('role', 'group');
          lane.setAttribute('aria-label', gospel + ' events');
          var track = { gospel: gospel, cursor: -1, markers: [] };

          function selectMarker(marker, reveal) {
            if (reveal) options.focusSite(mission.stops[marker.index].site);
            if (marker.index === selectedStop && selectedGospel === gospel) {
              if (reveal) revealMissionDetail();
              return;
            }
            track.cursor = marker.index;
            selectedGospel = gospel;
            goToStop(marker.index);
            if (reveal) revealMissionDetail();
          }

          mission.stops.forEach(function (stop, index) {
            if ((stop.comparisonOnly || []).includes(gospel) || !stop.passages.some(function (passage) {
              return passage.startsWith(gospel + ' ');
            })) return;
            var marker = { index: index };
            var label = gospel + ' · ' + stop.title;
            var dot = button('', 'explorer-gospel-dot', lane, function () { selectMarker(marker, true); });
            marker.node = dot;
            dot.style.gridRow = String(index + 1);
            dot.title = label;
            dot.setAttribute('aria-label', label);
            dot.setAttribute('aria-pressed', 'false');
            dot.addEventListener('pointerenter', function (event) {
              if (event.pointerType === 'mouse' && event.buttons === 0) selectMarker(marker, false);
            });
            dot.addEventListener('keydown', function (event) {
              var position = track.markers.indexOf(marker);
              var next = { ArrowUp: position - 1, ArrowDown: position + 1, Home: 0, End: track.markers.length - 1 }[event.key];
              if (next === undefined) return;
              event.preventDefault();
              var target = track.markers[Math.max(0, Math.min(track.markers.length - 1, next))];
              selectMarker(target, false);
              target.node.focus();
            });
            track.markers.push(marker);
          });

          if (!track.markers.length) {
            lane.classList.add('explorer-gospel-lane-empty');
            lane.setAttribute('aria-label', 'No events in ' + gospel + ' for this period');
            return track;
          }

          function scrub(event) {
            var rect = lane.getBoundingClientRect();
            var row = (event.clientY - rect.top) * mission.stops.length / rect.height - 0.5;
            var nearest = track.markers.reduce(function (closest, marker) {
              return Math.abs(marker.index - row) < Math.abs(closest.index - row) ? marker : closest;
            });
            selectMarker(nearest, false);
            return nearest;
          }

          var press = null;
          lane.addEventListener('pointerdown', function (event) {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            event.preventDefault();
            press = { x: event.clientX, y: event.clientY };
            lane.setPointerCapture(event.pointerId);
            scrub(event).node.focus({ preventScroll: true });
          });
          lane.addEventListener('pointermove', function (event) {
            if (!lane.hasPointerCapture(event.pointerId) || event.buttons !== 1) return;
            if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 5) press = null;
            scrub(event);
          });
          lane.addEventListener('pointerup', function (event) {
            if (press && lane.hasPointerCapture(event.pointerId)) selectMarker(scrub(event), true);
            press = null;
          });
          lane.addEventListener('lostpointercapture', function () { press = null; });
          return track;
        });
        return { tracks: tracks, grid: grid };
      }

      var missionEntries = data.missions.map(function (mission, missionNumber) {
        var item = element('li', '', null, actsTimeline);
        var accordion = element('details', 'explorer-mission-entry', null, item);
        var summary = element('summary', '', null, accordion);
        if (isPaul) element('span', 'explorer-mission-passage', mission.passage, summary);
        element('strong', '', mission.label, summary);
        if (mission.years) element('span', 'explorer-muted', mission.years, summary);
        summary.addEventListener('click', function (event) {
          event.preventDefault();
          if (missionIndex === missionNumber && !postActsSelected && accordion.open) {
            phaseOpened = false;
            accordion.open = false;
          } else {
            selectMission(missionNumber);
          }
        });

        var body = element('div', 'explorer-mission-entry-body', null, accordion);
        if (!isPaul) {
          var gospelTimeline = buildGospelTimeline(mission, body);
          return { accordion: accordion, tracks: gospelTimeline.tracks, grid: gospelTimeline.grid };
        }
        element('p', 'explorer-muted', 'With ' + mission.companions, body);
        element('p', 'explorer-label', mission.voyage ? 'Imprisonment letters' : 'Related books', body);
        addLetterList(data.letters[missionNumber], body);
        var itinerary = element('details', 'explorer-mission-itinerary', null, body);
        element('summary', '', mission.stops.length + ' stops', itinerary);
        var list = element('ol', 'explorer-mission-stops', null, itinerary);
        var rows = mission.stops.map(function (stop, index) {
          var row = button('', 'explorer-mission-stop', element('li', '', null, list), function () {
            selectedStop = index;
            routeEnd = Math.max(routeEnd, index);
            updateMissionRoute();
            options.focusSite(stop.site);
            showStopDetail();
            revealMissionDetail();
          });
          element('span', '', eventTitle(stop), row);
          element('span', 'explorer-muted', stop.passage, row);
          return row;
        });
        return { accordion: accordion, rows: rows };
      });

      var postActs;
      if (isPaul) {
        var postActsItem = element('li', '', null, actsTimeline);
        postActs = element('details', 'explorer-mission-entry', null, postActsItem);
        var postActsSummary = element('summary', '', null, postActs);
        element('span', 'explorer-mission-passage', 'After Acts', postActsSummary);
        element('strong', '', 'Pastoral letters', postActsSummary);
        postActsSummary.addEventListener('click', function (event) {
          event.preventDefault();
          if (postActsSelected && postActs.open) postActs.open = false;
          else selectMission(data.missions.length - 1, true);
        });
        var postActsBody = element('div', 'explorer-mission-entry-body', null, postActs);
        element('p', 'explorer-muted', 'Traditionally placed after Acts', postActsBody);
        data.letters.slice(data.missions.length).forEach(function (group) { addLetterList(group, postActsBody); });
      }

      if (isPaul) {
        var missionSources = element('details', 'explorer-mission-other', null, missionOverview);
        element('summary', '', 'Map and sources', missionSources);
        element('p', 'explorer-muted', 'Lines connect approximate locations in the order shown.', missionSources);
        externalLink('Journey map · Viz.Bible', 'https://viz.bible/journeys/', missionSources);
        externalLink('Coordinates · OpenBible.info (CC BY 4.0)', 'https://www.openbible.info/geo/', missionSources);
        externalLink('Voyage chronology · Cambridge Companion', 'https://assets.cambridge.org/97805217/81558/frontmatter/9780521781558_frontmatter.pdf', missionSources);
        externalLink('Paul’s letters overview', 'https://cartoonistbible.com/the-bible-bookshelf/pauls-letters/', missionSources);
      }

      function eventTitle(stop) {
        return stop.title || data.sites[stop.site].title;
      }

      function selectMission(index, afterActs) {
        var changed = missionIndex !== index;
        if (changed) {
          var previousVoyage = Boolean(data.missions[missionIndex].voyage);
          missionIndex = index;
          wheelDistance = 0;
          if (!isPaul || previousVoyage !== Boolean(data.missions[index].voyage)) options.fitMission(key, index);
        }
        if (!isPaul || changed || afterActs) routeEnd = data.missions[index].stops.length - 1;
        phaseOpened = true;
        postActsSelected = Boolean(afterActs);
        selectedStop = -1;
        selectedGospel = '';
        updateMissionSelection();
        updateMissionRoute(!isPaul || changed);
        showMissionDetail();
      }

      function updateMissionSelection() {
        missionEntries.forEach(function (entry, index) {
          var current = index === missionIndex;
          if (missionButtons[index]) missionButtons[index].setAttribute('aria-pressed', String(current));
          entry.accordion.open = current && phaseOpened && !postActsSelected;
          entry.accordion.classList.toggle('explorer-mission-current', current && !postActsSelected);
        });
        if (postActs) {
          postActs.open = postActsSelected;
          postActs.classList.toggle('explorer-mission-current', postActsSelected);
        }
      }

      function goToStop(index) {
        routeEnd = index;
        selectedStop = index;
        updateMissionRoute();
        showStopDetail();
      }

      function updateMissionRoute(replay) {
        var mission = data.missions[missionIndex];
        var position = routeEnd + 1;
        var current = mission.stops[routeEnd];
        routeOutput.value = isPaul ? position + ' of ' + mission.stops.length + ' · ' + eventTitle(current) :
          selectedStop < 0 ? mission.label : eventTitle(mission.stops[selectedStop]);
        var stop = mission.stops[selectedStop];
        options.showMissionRoute(key, missionIndex, routeEnd, stop ? stop.site : null, replay);
        var entry = missionEntries[missionIndex];
        if (isPaul) {
          routeSlider.max = mission.stops.length;
          routeSlider.value = position;
          routeSlider.setAttribute('aria-valuetext', routeOutput.value);
          previousStop.disabled = routeEnd === 0;
          nextStop.disabled = position === mission.stops.length;
          entry.rows.forEach(function (row, index) {
            row.setAttribute('aria-pressed', String(index === selectedStop));
          });
        } else {
          entry.grid.style.setProperty('--active-event', selectedStop);
          entry.grid.classList.toggle('explorer-gospel-grid-active', selectedStop >= 0);
          entry.tracks.forEach(function (track) {
            track.markers.forEach(function (marker, index) {
              var atCursor = marker.index === track.cursor;
              var active = track.gospel === selectedGospel && marker.index === selectedStop;
              marker.node.tabIndex = atCursor || (track.cursor < 0 && index === 0) ? 0 : -1;
              marker.node.setAttribute('aria-pressed', String(active));
              marker.node.classList.toggle('explorer-gospel-cursor', atCursor);
              marker.node.classList.toggle('explorer-gospel-aligned', marker.index === selectedStop);
            });
          });
        }
      }

      function showMissionDetail() {
        var mission = data.missions[missionIndex];
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
        if (mission.years) element('p', 'explorer-muted', mission.years, missionDetail);
        element('p', '', mission.description || 'With ' + mission.companions, missionDetail);
        mission.passage.split(' · ').forEach(function (passage) { passageLink(passage, missionDetail); });
        element('p', 'explorer-muted', isPaul ? 'Select a map dot or an event in the timeline to read the account.' :
          'Open a theme, then select an event on a Gospel track to compare the accounts.', missionDetail);
        if (!isPaul) data.sources.forEach(function (source) { externalLink(source[0], source[1], missionDetail); });
        details.scrollTop = 0;
      }

      function showStopDetail() {
        var stops = data.missions[missionIndex].stops;
        var stop = stops[selectedStop];
        var site = data.sites[stop.site];
        missionDetail.replaceChildren();
        element('h2', '', eventTitle(stop), missionDetail);
        var location = site ? (isPaul ? site.country : site.title + ' · ' + site.country) : 'Location unspecified or uncertain';
        var locationInfo = element('div', 'explorer-story-location', null, missionDetail);
        element('p', 'explorer-muted', location + (site && site.approximate ? ' · Approximate position' : ''), locationInfo);
        if (!isPaul && site) {
          var related = stops.map(function (event, index) { return { event: event, index: index }; })
            .filter(function (item) { return item.index !== selectedStop && item.index <= routeEnd && item.event.site === stop.site; });
          if (related.length) {
            var nearbyEvents = element('details', 'explorer-related-events', null, locationInfo);
            element('summary', '', 'More events here', nearbyEvents);
            var list = element('ul', 'explorer-mission-books', null, nearbyEvents);
            related.forEach(function (item) {
              button(item.event.title, 'explorer-mission-book', element('li', '', null, list), function () {
                selectedStop = item.index;
                selectedGospel = '';
                updateMissionRoute();
                showStopDetail();
                revealMissionDetail();
              });
            });
          }
        }
        if (isPaul) {
          element('p', '', stop.note, missionDetail);
          passageLink(stop.passage, missionDetail);
          return;
        }
        element('h3', 'explorer-story-section', 'Gospel passages', missionDetail);
        stop.passages.forEach(function (passage) {
          var link = passageLink(passage, missionDetail);
          if (selectedGospel && passage.startsWith(selectedGospel + ' ')) link.classList.add('explorer-selected-passage');
        });
        element('hr', 'explorer-story-divider', null, missionDetail);
        element('h3', 'explorer-story-section', 'Story', missionDetail);
        element('p', '', stop.note, missionDetail);
        element('h3', 'explorer-story-section', 'Analysis', missionDetail);
        element('p', '', stop.analysis, missionDetail);
      }

      function revealMissionDetail() {
        details.scrollTop = 0;
        if (window.matchMedia('(max-width: 800px)').matches) details.scrollIntoView({ block: 'start' });
      }

      return {
        mount: function () {
          routeHost.append(routeControls);
          overviewBody.append(missionOverview);
          detailBody.append(missionDetail);
          options.fitMission(key, missionIndex);
          updateMissionSelection();
          updateMissionRoute();
          if (selectedStop >= 0) showStopDetail();
          else showMissionDetail();
        },
        selectSite: function (site) {
          var stops = data.missions[missionIndex].stops;
          var index = stops.slice(0, routeEnd + 1).map(function (stop) { return stop.site; }).lastIndexOf(site);
          if (index < 0) return;
          selectedGospel = '';
          selectedStop = index;
          updateMissionRoute();
          options.focusSite(site);
          showStopDetail();
          revealMissionDetail();
        }
      };
    }

    var journeys = { paul: buildJourneyAtlas('paul', options.journeys.paul), jesus: buildJourneyAtlas('jesus', options.journeys.jesus) };

    function buildArchaeologyAtlas(data) {
      var dated = data.records.filter(function (record) { return record.period; }).sort(function (a, b) {
        return a.period[0] - b.period[0];
      });
      var undated = data.records.filter(function (record) { return !record.period; });
      var min = sliderYear(dated[0].period[0]);
      var max = sliderYear(Math.max.apply(null, dated.map(function (record) { return record.period[1]; })));
      var date = min;
      var genre = '';
      var selection = null;
      var visible = [];

      var controls = element('div', 'explorer-timeline explorer-archaeology-timeline');
      var header = element('div', 'explorer-timeline-header', null, controls);
      var label = element('label', 'explorer-label', 'Artifact date', header);
      label.htmlFor = 'archaeology-year';
      var output = element('output', '', null, header);
      output.htmlFor = label.htmlFor;
      var range = element('input', '', null, controls);
      range.id = label.htmlFor;
      range.type = 'range';
      range.min = min;
      range.max = max;
      range.addEventListener('input', function () {
        date = Number(range.value);
        render();
      });
      var endpoints = element('div', 'explorer-timeline-years explorer-muted', null, controls);
      element('span', '', formatYear(min), endpoints);
      element('span', '', formatYear(max), endpoints);
      var actions = element('div', 'explorer-timeline-actions', null, controls);
      var back = button('Previous date', 'explorer-control-button', actions, function () { step(-1); });
      button('Reset view', 'explorer-control-button', actions, options.resetArtifactView);
      var forward = button('Next date', 'explorer-control-button', actions, function () { step(1); });

      var sidebar = element('div', 'explorer-archaeology-sidebar');
      element('h2', '', 'Archaeological discoveries', sidebar);
      element('p', 'explorer-muted', 'Findings appear at the start of their estimated artifact or site-layer dates.', sidebar);
      var genreLabel = element('label', 'explorer-label', 'Genre', sidebar);
      genreLabel.htmlFor = 'archaeology-genre';
      var select = element('select', 'explorer-input', null, sidebar);
      select.id = genreLabel.htmlFor;
      element('option', '', 'All genres', select).value = '';
      Array.from(new Set(data.records.map(function (record) { return record.genre; }))).sort().forEach(function (name) {
        element('option', '', name, select).value = name;
      });
      select.addEventListener('change', function () {
        genre = select.value;
        render();
      });
      var summary = element('h3', '', '', sidebar);
      var findings = element('ul', 'explorer-archaeology-findings', null, sidebar);
      var context = element('details', 'explorer-archaeology-context', null, sidebar);
      element('summary', '', 'Undated and contextual entries', context);
      var contextList = element('ul', 'explorer-archaeology-findings', null, context);
      var detail = element('div', 'explorer-archaeology-detail');

      function matchesGenre(record) {
        return !genre || record.genre === genre;
      }

      function dates() {
        return dated.filter(matchesGenre).map(function (record) { return sliderYear(record.period[0]); });
      }

      function step(direction) {
        var candidates = dates();
        var value = direction < 0 ? candidates.filter(function (candidate) { return candidate < date; }).pop() :
          candidates.find(function (candidate) { return candidate > date; });
        if (value === undefined) return;
        date = value;
        render();
      }

      function selectFinding(record) {
        selection = record;
        render();
        if (record.site) options.focusSite(record.site);
        details.scrollTop = 0;
        if (window.matchMedia('(max-width: 800px)').matches) details.scrollIntoView({ block: 'start' });
      }

      function appendFindings(list, records) {
        list.replaceChildren();
        records.forEach(function (record) {
          var row = button('', 'explorer-project', element('li', '', null, list), function () {
            selectFinding(record);
            var selectedRow = list.querySelector('[aria-pressed="true"]');
            if (selectedRow && list.isConnected) selectedRow.focus({ preventScroll: true });
          });
          row.setAttribute('aria-pressed', String(record === selection));
          element('span', 'explorer-project-name', record.title, row);
          element('span', 'explorer-project-location', record.age, row);
        });
      }

      function renderDetail() {
        detail.replaceChildren();
        if (!selection) {
          element('h2', '', 'Select a finding', detail);
          element('p', 'explorer-muted', 'Choose a map dot or a finding from the list to see its date, context, and source.', detail);
          return;
        }
        var site = data.sites[selection.site];
        element('h2', '', selection.title, detail);
        element('p', 'explorer-label', selection.genre, detail);
        element('p', '', selection.age, detail);
        element('p', 'explorer-muted', site ? site.title + ' · ' + site.region :
          selection.period ? 'Archaeological findspot uncertain' : 'Context entry · No mapped findspot', detail);
        element('hr', 'explorer-story-divider', null, detail);
        element('h3', 'explorer-story-section', 'Evidence and interpretation', detail);
        element('p', '', selection.evidence, detail);
        if (selection.recovery) {
          element('h3', 'explorer-story-section', 'Recovery or provenance', detail);
          element('p', '', selection.recovery, detail);
        }
        element('h3', 'explorer-story-section', 'Biblical reference', detail);
        element('p', '', selection.reference, detail);
        externalLink(selection.source[0], selection.source[1], detail);
        var atSite = site ? visible.filter(function (record) { return record !== selection && record.site === selection.site; }) : [];
        if (atSite.length) {
          var other = element('details', 'explorer-archaeology-context', null, detail);
          element('summary', '', 'More findings at this site', other);
          appendFindings(element('ul', 'explorer-archaeology-findings', null, other), atSite);
        }
      }

      function render() {
        visible = dated.filter(function (record) { return matchesGenre(record) && sliderYear(record.period[0]) <= date; });
        var contextual = undated.filter(matchesGenre);
        if (selection && !visible.includes(selection) && !contextual.includes(selection)) selection = null;
        var sites = new Set(visible.map(function (record) { return record.site; }).filter(Boolean));
        options.showArtifactSites(sites, selection && selection.site);
        range.value = date;
        output.value = formatYear(date);
        range.setAttribute('aria-valuetext', output.value);
        var years = dates();
        back.disabled = !years.some(function (year) { return year < date; });
        forward.disabled = !years.some(function (year) { return year > date; });
        summary.textContent = sites.size + (sites.size === 1 ? ' mapped site' : ' mapped sites') + ' · ' +
          visible.length + (visible.length === 1 ? ' dated finding' : ' dated findings');
        appendFindings(findings, visible.slice().reverse());
        context.hidden = !contextual.length;
        appendFindings(contextList, contextual);
        renderDetail();
      }

      return {
        mount: function () {
          routeHost.append(controls);
          overviewBody.append(sidebar);
          detailBody.append(detail);
          render();
        },
        selectSite: function (site) {
          var record = visible.slice().reverse().find(function (item) { return item.site === site; });
          if (record) selectFinding(record);
        }
      };
    }

    var archaeology = buildArchaeologyAtlas(options.archaeology);

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

    function selectRecord(record) {
      active = active === record ? null : record;
      renderDiscoveries();
      if (active && record.site) options.focusSite(record.site);
    }

    function renderDiscoveries() {
      visibleRecords = records.filter(function (record) {
        return sliderYear(record.period[0]) <= year && (!book || record.books.includes(book));
      });
      var visibleSites = new Set(visibleRecords.map(function (record) { return record.site; }).filter(Boolean));
      if (!visibleRecords.includes(active)) active = null;
      options.showArtifactSites(visibleSites, active && active.site);
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
          selectRecord(record);
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
      var isArchaeology = Boolean(atlas && atlas.archaeology);
      var journey = atlas && journeys[atlas.journey];
      options.setAtlasView(isTimeline ? 'books' : isArchaeology ? 'archaeology' : journey ? atlas.journey : null);
      root.classList.toggle('explorer-missions-active', Boolean(journey));
      root.classList.toggle('explorer-archaeology-active', isArchaeology);
      root.classList.toggle('explorer-books-active', isTimeline);
      root.classList.toggle('explorer-gospels-active', Boolean(atlas && atlas.journey === 'jesus'));
      timeline.hidden = !isTimeline;
      routeHost.replaceChildren();
      hint.hidden = isTimeline || isArchaeology || Boolean(journey);
      center.classList.toggle('explorer-globe-with-timeline', isTimeline || isArchaeology || Boolean(journey));
      if (!journey) options.showMissionRoute(null);
      if (!isTimeline && !isArchaeology && !journey) options.showSites(new Set(), null);
      fitGlobe();
      clear.hidden = selected < 0;
      if (!atlas) {
        element('p', 'explorer-muted', 'Choose a topic from the atlas menu.', overviewBody);
        return;
      }
      if (journey) {
        journey.mount();
        fitGlobe();
        return;
      }
      if (isArchaeology) {
        archaeology.mount();
        fitGlobe();
        return;
      }
      element('h2', '', atlas.label, overviewBody);
      if (isTimeline) {
        element('p', 'explorer-muted', 'The timeline dates surviving artifacts. Records appear at the start of their estimated ranges. Each dot marks a findspot.', overviewBody);
        overviewBody.append(filter);
        element('h2', '', 'Biblical books', detailBody);
        detailBody.append(discoveryResults);
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
      var availableHeight = center.clientHeight - timeline.offsetHeight - routeHost.offsetHeight - hint.offsetHeight - 16;
      var size = Math.max(1, Math.floor(Math.min(center.clientWidth, availableHeight)));
      options.container.style.setProperty('--globe-size', size + 'px');
    }

    if (typeof ResizeObserver !== 'undefined') {
      var globeObserver = new ResizeObserver(fitGlobe);
      [center, timeline, routeHost].forEach(function (node) { globeObserver.observe(node); });
    }
    window.addEventListener('resize', fitGlobe);
    fitGlobe();
    renderDetails();
    updateCategories();
    return {
      selectSite: function (site) {
        var atlas = atlases[selected];
        if (atlas && atlas.archaeology) {
          archaeology.selectSite(site);
          return;
        }
        var journey = atlas && journeys[atlas.journey];
        if (journey) {
          journey.selectSite(site);
          return;
        }
        var record = visibleRecords.slice().reverse().find(function (item) { return item.site === site; });
        if (!record) return;
        active = record;
        renderDiscoveries();
        options.focusSite(site);
        discoveryResults.querySelector('details[open]').scrollIntoView({ block: 'nearest' });
      }
    };
  };
})();
