(function () {
  'use strict';

  var atlases = [
    { label: "Paul's three journeys", description: "Routes and places associated with Paul's three journeys." },
    { label: "Jesus' journey", description: "Places associated with the life and ministry of Jesus." },
    { label: "Moses' journey", description: "Places associated with the story of Moses." },
    { label: "Biblical books", description: "Places traditionally associated with the writing of biblical books." },
    { label: "Archaeological discoveries", description: "Archaeological discoveries connected to biblical history." },
    { label: "Christianity spreading", description: "The spread of early Christianity across the ancient world." }
  ];

  window.createGlobeExplorer = function (options) {
    var selected = -1;
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
    element('p', 'explorer-globe-hint', 'Drag to explore · Choose an atlas above', center);

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

    function renderDetails() {
      detailBody.replaceChildren();
      clear.hidden = selected < 0;
      if (selected < 0) {
        element('div', 'explorer-empty-orbit', '◎', detailBody);
        element('h2', '', 'A world of stories', detailBody);
        element('p', 'explorer-muted', 'Select an atlas to see its focus. Places, routes, and historical details will be added in a later step.', detailBody);
        return;
      }
      element('span', 'explorer-badge', 'BIBLICAL HISTORY', detailBody);
      element('h2', '', atlases[selected].label, detailBody);
      element('p', 'explorer-project-description', atlases[selected].description, detailBody);
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
      var hint = center.querySelector('.explorer-globe-hint');
      var availableHeight = center.clientHeight - hint.offsetHeight - 16;
      var size = Math.max(1, Math.floor(Math.min(center.clientWidth, availableHeight)));
      options.container.style.setProperty('--globe-size', size + 'px');
    }

    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitGlobe).observe(center);
    window.addEventListener('resize', fitGlobe);
    fitGlobe();
    renderDetails();
    updateCategories();
    updateSpin();
    return { updateSpin: updateSpin };
  };
})();
