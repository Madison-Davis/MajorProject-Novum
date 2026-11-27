(function () {
  'use strict';

  // ── Config (greyscale palette) ────────────────────────────────────────────
  var cfg = {
    urls: { globeTexture: 'globe-assets/assets/textures/earth_dark.jpg' },
    sizes:   { globe: 200, globeDotSize: 1.25 },
    scale:   { points: 0.008, markers: 0.008, globeScale: 1 },
    colors: {
      globeDotColor:    'rgb(155, 155, 155)',
      globeMarkerColor: 'rgb(200, 200, 200)',
      globeMarkerGlow:  'rgb(255, 255, 255)',
      globeLines:       'rgb(190, 190, 190)',
      globeLinesDots:   'rgb(220, 220, 220)'
    },
    display: { points: true, lines: true, markers: true, markerLabel: true, markerPoint: true },
    dots: { total: 30 }
  };

  var els = {
    globe: null, atmosphere: null, globePoints: null,
    lineDots: [], markers: [], markerLabel: [], markerPoint: [], lines: [],
    markerHits: []
  };
  var txs  = { markerLabels: [] };
  var grps = {
  main: null, globe: null, lines: null,
  points: null, markers: null, lineDots: null
  };
  var ctrs = { interval: 20000, selected: null, index: 0 };
  var anims = { rotateSpeed: 0.0025, targetSpeed: 0.0025, hoveredMarkerIndex: -1, spinEnabled: true };

  // ── Shaders ───────────────────────────────────────────────────────────────
  var shaders = { atmosphere: {}, globe: {}, dot: {} };

  shaders.globe.vertexShader = [
    'varying vec3 vNormal; varying vec3 vViewPosition;',
    'void main() {',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '  vNormal = normalize(normalMatrix * normal);',
    '  vViewPosition = -(modelViewMatrix * vec4(position, 1.0)).xyz;',
    '}'
  ].join('\n');

  shaders.globe.fragmentShader = [
    'varying vec3 vNormal; varying vec3 vViewPosition;',
    'void main() {',
    '  vec3 n = normalize(vNormal);',
    '  vec3 view = normalize(vViewPosition);',
    // Confine reflections to grazing angles. Narrow bands follow the sphere's
    // curvature instead of putting reflected panels across its center.
    '  float facing = max(dot(n, view), 0.0);',
    '  float edge = 1.0 - facing;',
    '  float key = pow(max(dot(normalize(n.xy), normalize(vec2(-0.8, 0.6))), 0.0), 3.0);',
    '  float fill = pow(max(dot(normalize(n.xy), normalize(vec2(0.65, -0.76))), 0.0), 5.0);',
    '  float outerRim = pow(edge, 12.0);',
    // Continuous silver silhouette, independent of the directional highlights.
    '  float outline = pow(edge, 5.0) * 0.26;',
    '  float reflection = smoothstep(0.60, 0.65, edge) * (1.0 - smoothstep(0.76, 0.82, edge));',
    '  float silver = 0.001 + outline + outerRim * (key * 0.62 + fill * 0.30);',
    '  silver += reflection * (key * 0.24 + fill * 0.10);',
    '  gl_FragColor = vec4(vec3(silver), 1.0);',
    '}'
  ].join('\n');

  shaders.atmosphere.vertexShader = [
    'varying vec3 vNormal;',
    'void main() {',
    '  vNormal = normalize(normalMatrix * normal);',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  shaders.atmosphere.fragmentShader = [
    'varying vec3 vNormal;',
    'void main() {',
    '  float edge = abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));',
    '  float intensity = pow(1.0 - edge, 3.0) * smoothstep(0.0, 0.25, edge) * 0.025;',
    '  gl_FragColor = vec4(vec3(0.85), intensity);',
    '}'
  ].join('\n');

  // ── Utils ─────────────────────────────────────────────────────────────────
  var GLOBE_R = 200, CURVE_MIN = 20, CURVE_MAX = 200;

  function clamp(n, lo, hi) { return n <= lo ? lo : n >= hi ? hi : n; }

  function coordToPos(lat, lng, r) {
    var phi   = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
      -r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function splineFromCoords(latA, lonA, latB, lonB, size) {
    var start = coordToPos(latA, lonA, size);
    var end   = coordToPos(latB, lonB, size);
    var alt   = clamp(start.distanceTo(end) * 0.45, CURVE_MIN, CURVE_MAX);
    var interp = d3.geoInterpolate([lonA, latA], [lonB, latB]);
    var c1 = interp(0.25), c2 = interp(0.75);
    return {
      start: start, end: end,
      mid1: coordToPos(c1[1], c1[0], GLOBE_R + alt),
      mid2: coordToPos(c2[1], c2[0], GLOBE_R + alt)
    };
  }

  function findCountry(name) {
    return data.countries.find(function (c) { return c.name === name; });
  }

  // ── Globe class ───────────────────────────────────────────────────────────
  function Globe() {
    var radius   = cfg.sizes.globe;
    var geometry = new THREE.SphereGeometry(radius, 128, 96);

    grps.globe = new THREE.Group();
    grps.globe.name = 'Globe';

    // globe mesh
    var globeMat = new THREE.ShaderMaterial({
      vertexShader:   shaders.globe.vertexShader,
      fragmentShader: shaders.globe.fragmentShader
    });
    var globe = new THREE.Mesh(geometry, globeMat);
    globe.scale.set(cfg.scale.globeScale, cfg.scale.globeScale, cfg.scale.globeScale);
    els.globe = globe;
    grps.globe.add(globe);

    // A separate back-facing shell feathers the silhouette into the black page.
    els.atmosphere = new THREE.Mesh(geometry, new THREE.ShaderMaterial({
      vertexShader: shaders.atmosphere.vertexShader,
      fragmentShader: shaders.atmosphere.fragmentShader,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    els.atmosphere.scale.setScalar(1.008);
    grps.globe.add(els.atmosphere);

    return grps.globe;
  }

  // ── Points class ──────────────────────────────────────────────────────────
  function Points() {
    var radius = cfg.sizes.globe * (1 + cfg.scale.points);
    var posArr = [], uvArr = [], sizeArr = [];
    var total = 110000;
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));

    // One equal-area Fibonacci distribution over the entire sphere. Land is
    // masked separately, so coastlines cannot change the spacing or form clumps.
    for (var i = 0; i < total; i++) {
      var y = 1 - 2 * (i + 0.5) / total;
      var latitude = Math.asin(y);
      var longitude = (i * goldenAngle) % (2 * Math.PI) - Math.PI;
      var position = coordToPos(latitude * 180 / Math.PI, longitude * 180 / Math.PI, radius);
      posArr.push(position.x, position.y, position.z);
      uvArr.push((longitude + Math.PI) / (2 * Math.PI), latitude / Math.PI + 0.5);
      sizeArr.push(cfg.sizes.globeDotSize);
    }

    var geo = new THREE.BufferGeometry();
    geo.addAttribute('position',    new THREE.BufferAttribute(new Float32Array(posArr),  3));
    geo.addAttribute('landUv',      new THREE.BufferAttribute(new Float32Array(uvArr),   2));
    geo.addAttribute('size',        new THREE.BufferAttribute(new Float32Array(sizeArr), 1));

    // Screen-facing circles, shaded by their position on the sphere. Keeping
    // light in view space gives the globe a steady studio-light finish on drag.
    var landMask = loader.load('globe-assets/maps/land-mask.png');
    landMask.minFilter = THREE.NearestFilter;
    landMask.magFilter = THREE.NearestFilter;
    landMask.generateMipmaps = false;
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        pixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        landMask: { value: landMask }
      },
      vertexShader: [
        'attribute float size;',
        'attribute vec2 landUv;',
        'varying vec2 vLandUv;',
        'uniform float pixelRatio;',
        'varying float vLight;',
        'void main() {',
        '  vLandUv = landUv;',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  vec3 n = normalize(normalMatrix * normalize(position));',
        '  vec3 view = normalize(-mv.xyz);',
        '  float facing = max(dot(n, view), 0.0);',
        '  float light = max(dot(n, normalize(vec3(-0.7, 0.85, 1.0))), 0.0);',
        '  vLight = (0.14 + light * 0.46) * smoothstep(0.0, 0.25, facing);',
        '  gl_Position = projectionMatrix * mv;',
        '  gl_PointSize = max(1.0, size * pixelRatio * (300.0 / -mv.z));',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D landMask;',
        'varying vec2 vLandUv;',
        'varying float vLight;',
        'void main() {',
        '  if (texture2D(landMask, vLandUv).r < 0.5) discard;',
        '  float r = length(gl_PointCoord - vec2(0.5));',
        '  if (r > 0.5) discard;',
        '  float alpha = 1.0 - smoothstep(0.30, 0.5, r);',
        '  gl_FragColor = vec4(vec3(vLight), alpha);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false
    });
    var pts = new THREE.Points(geo, mat);

    grps.points = new THREE.Group();
    grps.points.name = 'Points';
    grps.points.add(pts);
    els.globePoints = pts;
    
  }


  // ── Marker class ──────────────────────────────────────────────────────────
  function Marker(sharedMat, sharedGeo, hitGeo, label, cords, projectData) {
    this.isAnimating = false;
    this.group = new THREE.Group();
    this.group.name = 'Marker';

    // point
    this.point = new THREE.Mesh(sharedGeo, sharedMat);
    this.point.material.color.set(new THREE.Color(cfg.colors.globeMarkerColor));
    this.group.add(this.point);
    els.markerPoint.push(this.point);

    // glow
    this.glow = new THREE.Mesh(sharedGeo, sharedMat.clone());
    this.glow.material.color.set(new THREE.Color(cfg.colors.globeMarkerGlow));
    this.glow.material.opacity = 0.6;
    this.group.add(this.glow);
    els.markerPoint.push(this.glow);

    // invisible hit zone — larger sphere so raycasting is forgiving
    var hitMesh = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    this.group.add(hitMesh);
    els.markerHits.push({ mesh: hitMesh, data: projectData, point: this.point, group: this.group });

    this.group.position.copy(cords);
    grps.markers.add(this.group);
  }

  Marker.prototype.animateGlow = function () {
    if (!this.isAnimating) {
      if (Math.random() > 0.99) this.isAnimating = true;
    } else {
      this.glow.scale.x += 0.025; this.glow.scale.y += 0.025; this.glow.scale.z += 0.025;
      this.glow.material.opacity -= 0.005;
      if (this.glow.scale.x >= 4) {
        this.glow.scale.set(1, 1, 1);
        this.glow.material.opacity = 0.6;
        this.isAnimating = false;
      }
    }
  };

  function Markers(countries) {
    var radius  = cfg.sizes.globe + cfg.sizes.globe * cfg.scale.markers;
    var geo     = new THREE.SphereGeometry(2, 15, 15);
    var hitGeo  = new THREE.SphereGeometry(10, 8, 8);
    var mat     = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8 });

    grps.markers = new THREE.Group();
    grps.markers.name = 'GlobeMarkers';

    for (var i = 0; i < countries.length; i++) {
      var c = countries[i];
      var lat = Number(c.latitude), lon = Number(c.longitude);
      if (c.latitude != null && c.longitude != null &&
          String(c.latitude).trim() !== '' && String(c.longitude).trim() !== '' &&
          Number.isFinite(lat) && Number.isFinite(lon) &&
          Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        var cords = coordToPos(lat, lon, radius);
        var marker = new Marker(mat, geo, hitGeo, c.name, cords, c);
        els.markers.push(marker);
      }
    }
  }

  // ── Dot / Dots ────────────────────────────────────────────────────────────
  function Dot() {
    this.geometry = new THREE.SphereGeometry(2, 32, 32);
    this.material = new THREE.MeshBasicMaterial({ color: cfg.colors.globeLinesDots, transparent: true, opacity: 0.65 });
    this.mesh     = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false;
    this._path = null; this._pathIndex = 0;
  }

  Dot.prototype.assignToLine = function () {
    if (ctrs.selected) {
      var lines = ctrs.selected.children;
      var line  = lines[Math.floor(Math.random() * lines.length)];
      this._path = line._path;
    }
  };

  Dot.prototype.animate = function () {
    if (!this._path) {
      if (Math.random() > 0.99) { this.assignToLine(); this._pathIndex = 0; }
    } else if (this._pathIndex < this._path.length - 1) {
      this.mesh.visible = true;
      var p = this._path[this._pathIndex++];
      this.mesh.position.set(p.x, p.y, p.z);
    } else {
      this.mesh.visible = false; this._path = null;
    }
  };

  function spawnDots() {
    grps.lineDots = new THREE.Group();
    grps.lineDots.name = 'LineDots';
    for (var i = 0; i < cfg.dots.total; i++) {
      var dot = new Dot();
      grps.lineDots.add(dot.mesh);
      els.lineDots.push(dot);
    }
    grps.globe.add(grps.lineDots);
  }

  // ── Lines ─────────────────────────────────────────────────────────────────
  function buildLine(start, end) {
    var r = cfg.sizes.globe + cfg.sizes.globe * cfg.scale.markers;
    var sp = splineFromCoords(start.latitude, start.longitude, end.latitude, end.longitude, r);
    var curve = new THREE.CubicBezierCurve3(sp.start, sp.mid1, sp.mid2, sp.end);
    var geo   = new THREE.Geometry();
    geo.vertices = curve.getPoints(200);
    var ml  = new MeshLine(); ml.setGeometry(geo);
    var mat = new MeshLineMaterial({ color: cfg.colors.globeLines, transparent: true, opacity: 0.45 });
    var mesh = new THREE.Mesh(ml.geometry, mat);
    mesh._path = geo.vertices;
    return mesh;
  }

  function Lines() {
    var keys = Object.keys(data.connections);
    var total = keys.length;

    grps.lines = new THREE.Group(); grps.lines.name = 'Lines';

    for (var i = 0; i < keys.length; i++) {
      var key   = keys[i];
      var start = findCountry(key);
      var group = new THREE.Group(); group.name = key;
      var dests = data.connections[key];
      for (var j = 0; j < dests.length; j++) {
        if (!dests[j]) continue;
        var mesh = buildLine(start, dests[j]);
        els.lines.push(mesh); group.add(mesh);
      }
      group.visible = false;
      grps.lines.add(group);
    }

    // select first country
    var selectIdx = 0;
    function select() {
      var g = grps.lines.getObjectByName(keys[selectIdx]);
      if (ctrs.selected) ctrs.selected.visible = false;
      ctrs.selected = g;
      if (g) g.visible = true;
    }
    select();

    setInterval(function () {
      selectIdx = (selectIdx + 1) % total;
      els.lineDots = [];
      select();
      if (grps.lineDots) { grps.lineDots.children = []; }
      spawnDots();
    }, ctrs.interval);
  }

  // ── App (container-scoped, no GUI/Stats) ──────────────────────────────────
  var loader;

  function setup(app) {
    app.camera.position.z = cfg.sizes.globe * 2.2;
    app.camera.position.y = 0;
    app.controls.enableDamping = true;
    app.controls.dampingFactor = 0.05;
    app.controls.rotateSpeed   = 0.07;
    app.controls.enableZoom    = false;
    app.controls.enablePan     = false;

    grps.main = new THREE.Group(); grps.main.name = 'Main';

    var globe = new Globe();
    grps.main.add(globe);

    new Points();
    grps.globe.add(grps.points);

    if (app.showPoints) {
      var novumPoints = NOVUM_POINTS.map(function (p) {
        return Object.assign({}, p, { name: p.title, latitude: p.lat, longitude: p.lon });
      });
      new Markers(novumPoints);
      grps.globe.add(grps.markers);
    }

    app.scene.add(grps.main);
  }

  function animate() {
    for (var j = 0; j < els.markers.length; j++) {
      var m = els.markers[j];
      m.point.material.color.set(cfg.colors.globeMarkerColor);
      m.glow.material.color.set(cfg.colors.globeMarkerGlow);
      m.animateGlow();
    }
    for (var k = 0; k < els.markerHits.length; k++) {
      var h = els.markerHits[k];
      var tgt = (h.group.visible && k === anims.hoveredMarkerIndex) ? 3 : 1;
      h.point.scale.x += (tgt - h.point.scale.x) * 0.15;
      h.point.scale.y += (tgt - h.point.scale.y) * 0.15;
      h.point.scale.z += (tgt - h.point.scale.z) * 0.15;
    }
    anims.rotateSpeed += (anims.targetSpeed - anims.rotateSpeed) * 0.05;
    grps.globe.rotation.y -= anims.rotateSpeed;
  }

  window.addEventListener('load', function () {
    var container = document.getElementById('globe-wrap');
    if (!container) return;
    var globeSection = document.getElementById('globe-section');
    var isFullscreenView = window.location.hash === '#globe-fullscreen';
    var explorer = null;

    var W = container.clientWidth;
    var H = container.clientHeight || W;

    loader = new THREE.TextureLoader();

    var scene    = new THREE.Scene();
    var camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 10000);
    camera.lookAt(scene.position);
    camera.position.set(0, 15, 30);

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = 'block';
    // Percentage, not a fixed px size set by setSize(): lets the browser's
    // compositor stretch the already-rendered canvas for free whenever the
    // container's CSS width is animating, with no WebGL work involved.
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    // Fullscreen owns the atlas controls; the embedded view is globe-only.
    if (isFullscreenView) {
      // Put the explorer directly in the viewport, outside the page's layout.
      document.body.appendChild(globeSection);
      Array.prototype.forEach.call(document.body.children, function (child) {
        if (child !== globeSection && child.tagName !== 'SCRIPT') child.style.display = 'none';
      });
      document.body.classList.add('globe-fullscreen');

      // Minimal header: same site-header styling, title only, no nav links
      var fsHeader = document.createElement('header');
      fsHeader.className = 'site-header';
      var fsHeaderInner = document.createElement('div');
      fsHeaderInner.className = 'container nav-wrap';
      fsHeaderInner.style.justifyContent = 'center';
      var fsTitle = document.createElement('span');
      fsTitle.className = 'brand';
      fsTitle.textContent = 'NOVUM';
      fsHeaderInner.appendChild(fsTitle);
      fsHeader.appendChild(fsHeaderInner);
      document.body.insertBefore(fsHeader, document.body.firstChild);


    }

    // ── Raycaster ────────────────────────────────────────────────────────────
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(-999, -999);

    function markerAtEvent(e) {
      var rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      // Hidden markers must not intercept the ray before a visible project.
      var visible = els.markerHits.filter(function (h) { return h.group.visible; });
      var hits = raycaster.intersectObjects(visible.map(function (h) { return h.mesh; }).concat([els.globe]));
      if (!hits.length || hits[0].object === els.globe) return null;
      return visible.find(function (h) { return h.mesh === hits[0].object; }) || null;
    }
    container.addEventListener('mousemove', function (e) {
      var hit = markerAtEvent(e);
      anims.hoveredMarkerIndex = hit ? els.markerHits.indexOf(hit) : -1;
      container.style.cursor = hit ? 'pointer' : 'grab';
    });
    // Ignore drag gestures when deciding whether a click selects a project.
    var pointerStart = null;
    container.addEventListener('pointerdown', function (e) { pointerStart = { x: e.clientX, y: e.clientY }; });
    container.addEventListener('pointerup', function (e) {
      var start = pointerStart;
      pointerStart = null;
      if (!start || Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) return;
      if (!isFullscreenView) {
        window.open(new URL('index.html#globe-fullscreen', window.location.href).href, '_blank', 'noopener');
      }
    });

    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    var app = { scene: scene, camera: camera, controls: orbitControls, renderer: renderer, showPoints: isFullscreenView };
    setup(app);
    if (isFullscreenView) {
      explorer = window.createGlobeExplorer({
        section: globeSection,
        container: container,
        isSpinning: function () { return anims.spinEnabled; },
        setSpin: function (enabled) {
          anims.spinEnabled = enabled;
          anims.targetSpeed = enabled ? 0.0025 : 0;
        },
      });
    }

    function syncCanvasToContainer() {
      W = container.clientWidth;
      H = container.clientHeight || W;
      if (!W || !H) return;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
      if (els.globePoints) els.globePoints.material.uniforms.pixelRatio.value = pixelRatio;
      // Preserve the canvas's percentage CSS sizing; update its drawing buffer
      // and render immediately, including when a container changes without a
      // window resize. No CSS transition delays the embedded globe's resize.
      renderer.setSize(W, H, false);
      renderer.render(scene, camera);
    }

    // Fullscreen re-parents and resizes the canvas after renderer creation.
    syncCanvasToContainer();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncCanvasToContainer).observe(container);
    }

    function loop() {
      animate();
      orbitControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', syncCanvasToContainer);
  });
})();
