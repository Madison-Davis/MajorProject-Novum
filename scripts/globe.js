(function () {
  'use strict';

  // ── Config (greyscale palette) ────────────────────────────────────────────
  var cfg = {
    urls: { globeTexture: 'globe-assets/assets/textures/earth_dark.jpg' },
    sizes:   { globe: 200, globeDotSize: 1.25 },
    scale:   { points: 0.008, markers: 0.008, globeScale: 1 },
    colors: {
      globeDotColor:    'rgb(155, 155, 155)',
      globeMarkerColor: 'rgb(240, 240, 240)',
      globeMarkerGlow:  'rgb(210, 210, 210)',
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
  var selectedSite = null;
  var journeyAtlases = { paul: NOVUM_PAUL_MISSIONS, jesus: NOVUM_JESUS_JOURNEY };
  var missionRoutes = {};
  var missionRouteRadius = cfg.sizes.globe + 2.1;
  var routeSegments = 36;
  var routeRadialSegments = 5;
  var missionPlayback = null;
  var navigation = {
    siteClearance: 11,
    artifactMinClearance: 7,
    artifactOverviewClearance: 32,
    angularPadding: 4 * Math.PI / 180,
    rotatePerClearance: 0.0012,
    regionalDragDamping: 0.28,
    travelDuration: 780
  };

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
  var globePointCount = 110000;

  function Points(includeDiscoveryDetail) {
    var radius = cfg.sizes.globe * (1 + cfg.scale.points);
    var posArr = [], uvArr = [], sizeArr = [], detailArr = [], localArr = [];
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var radians = Math.PI / 180;
    // Cover the Mediterranean and taper into the global dots at the edges.
    var south = 16 * radians, north = 57 * radians;
    var west = -4 * radians, east = 54 * radians;
    var fadeWidth = 3 * radians;
    var localSouth = 30.5 * radians, localNorth = 34.5 * radians;
    var localWest = 33.6 * radians, localEast = 36.8 * radians;

    function addPoint(latitude, longitude, size, detail, local) {
      var edge = Math.min(latitude - localSouth, localNorth - latitude, longitude - localWest, localEast - longitude);
      var blend = clamp(edge / (0.35 * radians), 0, 1);
      var position = coordToPos(latitude / radians, longitude / radians, radius);
      posArr.push(position.x, position.y, position.z);
      uvArr.push((longitude + Math.PI) / (2 * Math.PI), latitude / Math.PI + 0.5);
      sizeArr.push(size);
      detailArr.push(detail);
      localArr.push(local ? blend : -blend);
    }

    // Sample both resolutions with equal-area Fibonacci spacing and the same land mask.
    function addPoints(total, start, end, fine) {
      for (var i = start; i < end; i++) {
        var longitude = (i * goldenAngle) % (2 * Math.PI) - Math.PI;
        if (fine && (longitude <= west || longitude >= east)) continue;
        var latitude = Math.asin(1 - 2 * (i + 0.5) / total);
        var edgeDistance = Math.min(latitude - south, north - latitude, longitude - west, east - longitude);
        var blend = clamp(edgeDistance / fadeWidth, 0, 1);
        if (fine && blend === 0) continue;
        addPoint(latitude, longitude, cfg.sizes.globeDotSize * (fine ? 0.33 : 1), fine ? blend : -blend, false);
      }
    }

    addPoints(globePointCount, 0, globePointCount, false);
    if (includeDiscoveryDetail) {
      var finePointCount = globePointCount * 12;
      var start = Math.floor(finePointCount * (1 - Math.sin(north)) / 2);
      var end = Math.ceil(finePointCount * (1 - Math.sin(south)) / 2);
      addPoints(finePointCount, start, end, true);
    }

    var geo = new THREE.BufferGeometry();
    geo.userData.finePointCount = sizeArr.length;
    if (includeDiscoveryDetail) {
      // Add an equal-area patch for the closer views of Galilee and Jerusalem.
      var localCount = 96000;
      var sinSouth = Math.sin(localSouth);
      var sinSpan = Math.sin(localNorth) - sinSouth;
      var goldenRatioFraction = (Math.sqrt(5) - 1) / 2;
      for (var j = 0; j < localCount; j++) {
        var latitude = Math.asin(sinSouth + sinSpan * (j + 0.5) / localCount);
        var longitude = localWest + (localEast - localWest) * ((j * goldenRatioFraction) % 1);
        addPoint(latitude, longitude, 0.024, 0, true);
      }
    }
    geo.addAttribute('position',    new THREE.BufferAttribute(new Float32Array(posArr),  3));
    geo.addAttribute('landUv',      new THREE.BufferAttribute(new Float32Array(uvArr),   2));
    geo.addAttribute('size',        new THREE.BufferAttribute(new Float32Array(sizeArr), 1));
    geo.addAttribute('detail',      new THREE.BufferAttribute(new Float32Array(detailArr), 1));
    geo.addAttribute('localDetail', new THREE.BufferAttribute(new Float32Array(localArr), 1));
    geo.setDrawRange(0, globePointCount);

    // Screen-facing circles, shaded by their position on the sphere. Keeping
    // light in view space gives the globe a steady studio-light finish on drag.
    var landMask = loader.load('globe-assets/maps/land-mask.png');
    landMask.minFilter = THREE.NearestFilter;
    landMask.magFilter = THREE.NearestFilter;
    landMask.generateMipmaps = false;
    // Natural Earth 1:10m lake polygons provide a finer mask for the Levant.
    var localLakes = loader.load('globe-assets/maps/levant-lake-mask.png');
    localLakes.minFilter = THREE.NearestFilter;
    localLakes.magFilter = THREE.NearestFilter;
    localLakes.generateMipmaps = false;
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        pixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        landMask: { value: landMask },
        localLakes: { value: localLakes },
        lakeBounds: { value: new THREE.Vector4(
          (localWest + Math.PI) / (2 * Math.PI), localSouth / Math.PI + 0.5,
          (localEast + Math.PI) / (2 * Math.PI), localNorth / Math.PI + 0.5
        ) },
        fineTerrain: { value: 0 },
        localTerrain: { value: 0 }
      },
      vertexShader: [
        'attribute float size;',
        'attribute float detail;',
        'attribute float localDetail;',
        'attribute vec2 landUv;',
        'varying vec2 vLandUv;',
        'uniform float pixelRatio;',
        'uniform float fineTerrain;',
        'uniform float localTerrain;',
        'varying float vLight;',
        'varying float vOpacity;',
        'void main() {',
        '  vLandUv = landUv;',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  vec3 n = normalize(normalMatrix * normalize(position));',
        '  vec3 view = normalize(-mv.xyz);',
        '  float facing = max(dot(n, view), 0.0);',
        '  float light = max(dot(n, normalize(vec3(-0.7, 0.85, 1.0))), 0.0);',
        '  vLight = (0.14 + light * 0.46) * smoothstep(0.0, 0.25, facing);',
        '  float blend = smoothstep(0.0, 1.0, abs(detail));',
        '  vOpacity = detail > 0.0 ? blend : 1.0 - blend * fineTerrain;',
        '  float localBlend = smoothstep(0.0, 1.0, abs(localDetail));',
        '  vOpacity *= localDetail > 0.0 ? localBlend : 1.0 - localBlend * localTerrain;',
        '  gl_Position = projectionMatrix * mv;',
        '  float dotSize = size * (300.0 / -mv.z);',
        '  if (detail > 0.0) dotSize = min(dotSize, 2.5);',
        '  if (localDetail > 0.0) dotSize = min(dotSize, 1.2);',
        '  gl_PointSize = max(1.0, dotSize * pixelRatio);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D landMask;',
        'uniform sampler2D localLakes;',
        'uniform vec4 lakeBounds;',
        'varying vec2 vLandUv;',
        'varying float vLight;',
        'varying float vOpacity;',
        'void main() {',
        '  if (vOpacity == 0.0) discard;',
        '  if (texture2D(landMask, vLandUv).r < 0.5) discard;',
        '  vec2 lakeUv = (vLandUv - lakeBounds.xy) / (lakeBounds.zw - lakeBounds.xy);',
        '  if (all(greaterThanEqual(lakeUv, vec2(0.0))) && all(lessThanEqual(lakeUv, vec2(1.0)))) {',
        '    if (texture2D(localLakes, lakeUv).r > 0.5) discard;',
        '  }',
        '  float r = length(gl_PointCoord - vec2(0.5));',
        '  if (r > 0.5) discard;',
        '  float alpha = 1.0 - smoothstep(0.30, 0.5, r);',
        '  gl_FragColor = vec4(vec3(vLight), alpha * vOpacity);',
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
  function Marker(sharedMat, sharedGeo, hitGeo, cords, siteId, isDiscoverySite) {
    this.isAnimating = false;
    this.scaleFactor = /^(jesus_|arch_)/.test(siteId) ? 0.60 : 1;
    this.group = new THREE.Group();
    this.group.name = 'Marker';

    // point
    this.point = new THREE.Mesh(sharedGeo, sharedMat);
    this.group.add(this.point);
    els.markerPoint.push(this.point);

    // glow
    this.glow = new THREE.Mesh(sharedGeo, sharedMat.clone());
    if (isDiscoverySite) this.glow.material.color.set(cfg.colors.globeMarkerGlow);
    this.glow.material.opacity = 0.6;
    this.group.add(this.glow);
    els.markerPoint.push(this.glow);

    // invisible hit zone — larger sphere so raycasting is forgiving
    var hitMesh = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }));
    this.group.add(hitMesh);
    els.markerHits.push({ mesh: hitMesh, site: siteId, point: this.point, group: this.group });

    this.group.position.copy(cords);
    this.group.visible = false;
    grps.markers.add(this.group);
  }

  function createTownLabels(container, camera) {
    var overlay = document.createElement('div');
    overlay.className = 'explorer-town-labels';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    container.appendChild(overlay);
    var atlas = journeyAtlases.jesus;
    var radius = missionRouteRadius;
    var labels = Object.keys(atlas.towns).map(function (id) {
      var site = atlas.sites[id];
      var marker = document.createElement('div');
      marker.className = 'explorer-town-marker';
      var name = document.createElement('span');
      name.className = 'explorer-town-name';
      name.textContent = atlas.towns[id];
      marker.appendChild(name);
      overlay.appendChild(marker);
      return { id: id, marker: marker, name: name, point: coordToPos(site.lat, site.lon, radius), width: 0 };
    });
    var world = new THREE.Vector3();
    var projected = new THREE.Vector3();

    return function renderTownLabels(visible) {
      overlay.hidden = !visible;
      if (!visible) return;

      var width = overlay.clientWidth;
      var height = overlay.clientHeight;
      var placed = [];
      var active = labels.find(function (label) { return label.id === selectedSite; });
      var order = active ? [active].concat(labels.filter(function (label) { return label !== active; })) : labels;
      order.forEach(function (label) {
        world.copy(label.point).applyMatrix4(grps.globe.matrixWorld);
        projected.copy(world).project(camera);
        var x = (projected.x + 1) * width / 2;
        var y = (1 - projected.y) * height / 2;
        var inView = world.dot(camera.position) > radius * radius &&
          projected.z > -1 && projected.z < 1 && x > 4 && x < width - 4 && y > 4 && y < height - 4;
        label.marker.hidden = !inView;
        if (!inView) return;

        label.marker.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        label.marker.classList.toggle('explorer-town-selected', label === active);
        label.width = label.width || label.name.offsetWidth + 4;
        var w = label.width;
        var h = 13;
        var offsets = [[6, -h / 2], [-w - 5, -h / 2], [6, -h - 4], [6, 5]];
        var offset = offsets.find(function (candidate) {
          var left = x + candidate[0], top = y + candidate[1];
          return left >= 2 && top >= 2 && left + w <= width - 2 && top + h <= height - 2 &&
            placed.every(function (box) {
              return left >= box[2] || left + w <= box[0] || top >= box[3] || top + h <= box[1];
            });
        });
        label.name.style.visibility = offset ? 'visible' : 'hidden';
        if (offset) {
          label.name.style.left = offset[0] + 'px';
          label.name.style.top = offset[1] + 'px';
          placed.push([x + offset[0], y + offset[1], x + offset[0] + w, y + offset[1] + h]);
        }
      });
    };
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

  function Markers(discoverySites, journeySites, archaeologySites) {
    var geo     = new THREE.SphereGeometry(2, 15, 15);
    var hitGeo  = new THREE.SphereGeometry(5, 8, 8);
    var mat     = new THREE.MeshBasicMaterial({ color: cfg.colors.globeMarkerColor, transparent: true, opacity: 0.8 });
    var missionMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });

    grps.markers = new THREE.Group();
    grps.markers.name = 'GlobeMarkers';

    var sites = Object.assign({}, discoverySites, journeySites, archaeologySites);
    Object.keys(sites).forEach(function (id) {
      var site = sites[id];
      if (site.water) return;
      var isJourneySite = Boolean(journeySites[id]);
      var radius = isJourneySite ? missionRouteRadius : cfg.sizes.globe;
      var coords = coordToPos(site.lat, site.lon, radius);
      var isDiscoverySite = Boolean(discoverySites[id]);
      els.markers.push(new Marker(isDiscoverySite ? mat : missionMat, geo, hitGeo, coords, id, isDiscoverySite));
    });
  }

  function createMissionRoutes(atlas) {
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var sites = atlas.sites;
    return atlas.missions.map(function (mission) {
      var group = new THREE.Group();
      group.visible = false;
      grps.globe.add(group);
      var routeWidth = 0.10;
      if (atlas === journeyAtlases.jesus) {
        var points = mission.stops.map(function (stop) { return sites[stop.site]; }).filter(Boolean);
        var origin = coordToPos(points[0].lat, points[0].lon, missionRouteRadius);
        var span = points.reduce(function (distance, site) {
          return Math.max(distance, origin.distanceTo(coordToPos(site.lat, site.lon, missionRouteRadius)));
        }, 0);
        routeWidth = clamp(span * 0.0029, 0.008, 0.048);
      }
      var start = sites[mission.stops[0].site];
      mission.stops.slice(1).forEach(function (stop) {
        var end = sites[stop.site];
        if (!start || !end || start === end) {
          // Keep event positions aligned with playback when a stop adds no new route segment.
          group.add(new THREE.Object3D());
          if (end) start = end;
          return;
        }
        var from = coordToPos(start.lat, start.lon, missionRouteRadius);
        var to = coordToPos(end.lat, end.lon, missionRouteRadius);
        var bow = Math.min(from.distanceTo(to) * 0.065, 1.5);
        var sideways = from.clone().cross(to).normalize();
        var arc = [];
        for (var i = 0; i <= 12; i++) {
          var t = i / 12;
          arc.push(from.clone().lerp(to, t)
            .addScaledVector(sideways, bow * Math.sin(Math.PI * t))
            .setLength(missionRouteRadius));
        }
        var curve = new THREE.CatmullRomCurve3(arc);
        group.add(new THREE.Mesh(new THREE.TubeBufferGeometry(curve, routeSegments, routeWidth, routeRadialSegments, false), material));
        start = end;
      });
      return group;
    });
  }

  function showSites(sites, active) {
    selectedSite = active;
    anims.hoveredMarkerIndex = -1;
    els.markerHits.forEach(function (hit) { hit.group.visible = sites.has(hit.site); });
  }

  function drawMissionProgress(playback, progress) {
    playback.progress = progress;
    missionRoutes[playback.key][playback.index].children.forEach(function (leg, index) {
      var segments = Math.ceil(clamp(progress - index, 0, 1) * routeSegments);
      leg.visible = Boolean(leg.geometry) && segments > 0;
      if (leg.geometry) leg.geometry.setDrawRange(0, segments * routeRadialSegments * 6);
    });

    var lastStop = Math.floor(progress);
    if (lastStop === playback.lastStop) return;
    playback.lastStop = lastStop;
    var mission = journeyAtlases[playback.key].missions[playback.index];
    var sites = new Set(mission.stops.slice(0, lastStop + 1).map(function (stop) { return stop.site; }));
    showSites(sites, playback.active);
  }

  function animateMissionRoute(now) {
    var playback = missionPlayback;
    if (!playback || playback.progress === playback.target) return;
    var t = clamp((now - playback.startedAt) / playback.duration, 0, 1);
    var ease = t * t * (3 - 2 * t);
    var progress = t === 1 ? playback.target : playback.from + (playback.target - playback.from) * ease;
    drawMissionProgress(playback, progress);
  }

  function showMissionRoute(key, index, end, active, replay) {
    if (!missionPlayback || missionPlayback.key !== key || missionPlayback.index !== index) {
      Object.keys(missionRoutes).forEach(function (atlas) {
        missionRoutes[atlas].forEach(function (route, routeIndex) {
          route.visible = atlas === key && routeIndex === index;
        });
      });
      missionPlayback = key === null ? null : { key: key, index: index, target: end, active: active };
    }

    var playback = missionPlayback;
    if (!playback) return;
    playback.active = active;
    selectedSite = active;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (replay || playback.progress === undefined || reducedMotion) {
      playback.target = end;
      if (replay && !reducedMotion) {
        playback.from = 0;
        playback.startedAt = performance.now();
        playback.duration = Math.min(2200, 750 + end * 60);
        drawMissionProgress(playback, 0);
      } else {
        drawMissionProgress(playback, end);
      }
      return;
    }
    if (end === playback.target) return;

    var now = performance.now();
    animateMissionRoute(now);
    playback.from = playback.progress;
    playback.target = end;
    playback.startedAt = now;
    playback.duration = Math.min(420, 220 + 20 * Math.abs(end - playback.from));
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
    app.controls.enableZoom    = app.showPoints;
    app.controls.minDistance   = cfg.sizes.globe + 4;
    app.controls.maxDistance   = cfg.sizes.globe * 2.2;
    app.controls.enablePan     = false;

    grps.main = new THREE.Group(); grps.main.name = 'Main';

    var globe = new Globe();
    grps.main.add(globe);

    new Points(app.showPoints);
    grps.globe.add(grps.points);

    if (app.showPoints) {
      new Markers(NOVUM_BOOK_DISCOVERIES.sites, Object.assign({}, journeyAtlases.paul.sites, journeyAtlases.jesus.sites),
        NOVUM_ARCHAEOLOGY.sites);
      grps.globe.add(grps.markers);
      Object.keys(journeyAtlases).forEach(function (key) {
        missionRoutes[key] = createMissionRoutes(journeyAtlases[key]);
      });
    }

    app.scene.add(grps.main);
  }

  function animate(camera) {
    var markerScale = (camera.position.length() - cfg.sizes.globe) / (cfg.sizes.globe * 1.2);
    for (var j = 0; j < els.markers.length; j++) {
      var m = els.markers[j];
      m.group.scale.setScalar(markerScale * m.scaleFactor);
      if (!m.group.visible) continue;
      m.animateGlow();
    }
    for (var k = 0; k < els.markerHits.length; k++) {
      var h = els.markerHits[k];
      var tgt = (k === anims.hoveredMarkerIndex || h.site === selectedSite) ? 1.8 : 1;
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
    var atlasView = null;
    var renderTownLabels;
    var updateAtlasCamera;

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
    if (isFullscreenView) renderTownLabels = createTownLabels(container, camera);

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
      var visible = els.markerHits.filter(function (h) { return h.group.visible; });
      if (!visible.length) return null;
      var rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      camera.updateMatrixWorld();
      grps.globe.updateMatrixWorld(true);
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(visible.map(function (h) { return h.mesh; }).concat([els.globe]));
      if (!hits.length || hits[0].object === els.globe) return null;
      if (atlasView === 'archaeology' || atlasView === 'books') {
        // Nearby findspots can share a hit area at the default regional zoom.
        var globeHit = hits.findIndex(function (hit) { return hit.object === els.globe; });
        var candidates = globeHit < 0 ? hits : hits.slice(0, globeHit);
        var closest = null;
        var closestDistance = Infinity;
        var projected = new THREE.Vector3();
        candidates.forEach(function (hit) {
          hit.object.getWorldPosition(projected).project(camera);
          var distance = Math.hypot(projected.x - mouse.x, projected.y - mouse.y);
          if (distance >= closestDistance) return;
          closest = hit;
          closestDistance = distance;
        });
        return visible.find(function (h) { return h.mesh === closest.object; });
      }
      return visible.find(function (h) { return h.mesh === hits[0].object; }) || null;
    }
    container.addEventListener('mousemove', function (e) {
      var hit = markerAtEvent(e);
      anims.hoveredMarkerIndex = hit ? els.markerHits.indexOf(hit) : -1;
      container.style.cursor = hit ? 'pointer' : 'grab';
    });
    // Ignore drag gestures when deciding whether a click selects a site.
    var pointerStart = null;
    container.addEventListener('pointerdown', function (e) {
      if (e.isPrimary && e.button === 0) pointerStart = { x: e.clientX, y: e.clientY, id: e.pointerId };
    });
    container.addEventListener('pointerup', function (e) {
      var start = pointerStart;
      if (!start || e.pointerId !== start.id) return;
      pointerStart = null;
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) return;
      if (!isFullscreenView) {
        window.open(new URL('index.html#globe-fullscreen', window.location.href).href, '_blank', 'noopener');
      } else if (explorer) {
        var hit = markerAtEvent(e);
        if (hit) explorer.selectSite(hit.site);
      }
    });
    container.addEventListener('pointercancel', function (e) {
      if (pointerStart && pointerStart.id === e.pointerId) pointerStart = null;
    });

    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    var app = { scene: scene, camera: camera, controls: orbitControls, renderer: renderer, showPoints: isFullscreenView };
    setup(app);
    if (isFullscreenView) {
      var overviewView = null;
      var overviewDistance = orbitControls.maxDistance;
      var overviewMinimum = orbitControls.minDistance;
      var regionalView = null;
      var artifactSitesKey = null;
      var cameraTravel = null;
      var spherical = new THREE.Spherical();
      var targetView = new THREE.Spherical();
      var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      function angleFrom(angle, center) {
        var delta = angle - center;
        return Math.atan2(Math.sin(delta), Math.cos(delta));
      }

      function limitToRegion(view) {
        if (!regionalView) return;
        var region = regionalView;
        // Measure angles around the region so a bound can cross the ±π seam.
        var theta = angleFrom(view.theta, region.theta);
        view.theta = region.theta + clamp(theta, region.minTheta, region.maxTheta);
        view.phi = clamp(view.phi, region.minPhi, region.maxPhi);
        view.radius = clamp(view.radius, region.minDistance, region.maxDistance);
      }

      function applyZoomLimits() {
        orbitControls.minDistance = regionalView ? regionalView.minDistance : overviewMinimum;
        orbitControls.maxDistance = regionalView ? regionalView.maxDistance : overviewDistance;
      }

      function cancelCameraTravel() {
        if (!cameraTravel) return;
        cameraTravel = null;
        applyZoomLimits();
      }

      function adjustNavigationSpeed() {
        var distance = camera.position.length();
        var clearance = distance - cfg.sizes.globe;
        orbitControls.zoomSpeed = clearance / distance;
        orbitControls.dampingFactor = atlasView ? navigation.regionalDragDamping : 0.16;
        orbitControls.rotateSpeed = clamp(clearance * navigation.rotatePerClearance, 0.007, 0.12);
      }

      orbitControls.addEventListener('change', adjustNavigationSpeed);
      orbitControls.addEventListener('start', cancelCameraTravel);
      adjustNavigationSpeed();
      renderer.domElement.addEventListener('wheel', function (event) {
        if (!event.deltaY) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        cancelCameraTravel();
        var unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? renderer.domElement.clientHeight : 1;
        var delta = clamp(event.deltaY * unit, -150, 150);
        var surface = cfg.sizes.globe;
        var distance = surface + (camera.position.length() - surface) * Math.exp(delta * 0.0008);
        camera.position.setLength(clamp(distance, orbitControls.minDistance, orbitControls.maxDistance));
        orbitControls.update();
      }, { capture: true, passive: false });

      function setSpin(enabled) {
        anims.spinEnabled = enabled;
        anims.targetSpeed = enabled ? 0.0025 : 0;
      }

      function moveCamera(position) {
        orbitControls.enableDamping = false;
        orbitControls.update();
        camera.position.copy(position);
        orbitControls.update();
        orbitControls.enableDamping = true;
      }

      function goToView(destination, animated) {
        var origin = camera.position.clone();
        cameraTravel = null;
        if (!animated || reducedMotion.matches || origin.distanceToSquared(destination) < 0.0001) {
          applyZoomLimits();
          moveCamera(destination);
          return;
        }
        // Keep both ends reachable while a changed filter settles into its new limits.
        orbitControls.minDistance = Math.min(origin.length(), destination.length());
        orbitControls.maxDistance = Math.max(origin.length(), destination.length());
        moveCamera(origin);
        cameraTravel = {
          from: new THREE.Spherical().setFromVector3(origin),
          to: new THREE.Spherical().setFromVector3(destination),
          start: performance.now()
        };
      }

      updateAtlasCamera = function (now) {
        if (cameraTravel) {
          var from = cameraTravel.from;
          var to = cameraTravel.to;
          var progress = clamp((now - cameraTravel.start) / navigation.travelDuration, 0, 1);
          var eased = progress * progress * (3 - 2 * progress);
          var radius = cfg.sizes.globe;
          var clearance = (from.radius - radius) * Math.pow((to.radius - radius) / (from.radius - radius), eased);
          spherical.set(radius + clearance, from.phi + (to.phi - from.phi) * eased,
            from.theta + angleFrom(to.theta, from.theta) * eased);
          camera.position.setFromSpherical(spherical);
          if (progress === 1) cancelCameraTravel();
        }
        orbitControls.update();
        if (regionalView && !cameraTravel) {
          spherical.setFromVector3(camera.position);
          limitToRegion(spherical);
          camera.position.setFromSpherical(spherical);
          camera.lookAt(orbitControls.target);
        }
      };

      function makeRegionalView(sites, minimumDistance, minClearance) {
        var latitudes = sites.map(function (site) { return site.lat; });
        var longitudes = sites.map(function (site) { return site.lon; });
        var lat = (Math.min.apply(null, latitudes) + Math.max.apply(null, latitudes)) / 2;
        var lon = (Math.min.apply(null, longitudes) + Math.max.apply(null, longitudes)) / 2;
        var direction = coordToPos(lat, lon, 1);
        var radius = cfg.sizes.globe;
        // The atlas canvas is square. Reserve space around the outermost findspots.
        var viewSlope = Math.tan(camera.fov * Math.PI / 360) * 0.65;
        var distance = sites.reduce(function (required, site) {
          var point = coordToPos(site.lat, site.lon, radius);
          var depth = point.dot(direction);
          var offset = point.addScaledVector(direction, -depth).length();
          return Math.max(required, depth + offset / viewSlope);
        }, minimumDistance);
        distance = Math.min(distance, overviewDistance);
        var position = direction.multiplyScalar(distance).applyEuler(grps.globe.rotation);
        var center = new THREE.Spherical().setFromVector3(position);
        var angles = sites.map(function (site) {
          var direction = coordToPos(site.lat, site.lon, 1).applyEuler(grps.globe.rotation);
          return new THREE.Spherical().setFromVector3(direction);
        });
        var thetas = angles.map(function (view) { return angleFrom(view.theta, center.theta); });
        var phis = angles.map(function (view) { return view.phi; });
        var padding = navigation.angularPadding;
        return {
          position: position, minDistance: radius + minClearance, maxDistance: distance, theta: center.theta,
          minTheta: Math.min.apply(null, thetas) - padding, maxTheta: Math.max.apply(null, thetas) + padding,
          minPhi: Math.max(0.001, Math.min.apply(null, phis) - padding),
          maxPhi: Math.min(Math.PI - 0.001, Math.max.apply(null, phis) + padding)
        };
      }

      function fitSites(sites, minimumDistance, animated) {
        setSpin(false);
        anims.rotateSpeed = 0;
        regionalView = makeRegionalView(sites, minimumDistance, 4);
        goToView(regionalView.position, animated);
      }

      function showArtifactSites(sites, active) {
        showSites(sites, active);
        var key = Array.from(sites).sort().join(',');
        if (artifactSitesKey === key) return;
        var initial = artifactSitesKey === null;
        artifactSitesKey = key;
        var catalog = atlasView === 'books' ? NOVUM_BOOK_DISCOVERIES.sites : NOVUM_ARCHAEOLOGY.sites;
        var locations = sites.size ? Array.from(sites, function (id) { return catalog[id]; }) : Object.values(catalog);
        if (cameraTravel) targetView.copy(cameraTravel.to);
        else targetView.setFromVector3(camera.position);
        var destination = new THREE.Vector3().setFromSpherical(targetView);
        var atOverview = regionalView && destination.distanceToSquared(regionalView.position) < 0.0001;
        regionalView = makeRegionalView(locations, cfg.sizes.globe + navigation.artifactOverviewClearance,
          navigation.artifactMinClearance);
        if (initial || atOverview) {
          goToView(regionalView.position, !initial);
        } else {
          limitToRegion(targetView);
          goToView(destination.setFromSpherical(targetView), true);
        }
      }

      explorer = window.createGlobeExplorer({
        section: globeSection,
        container: container,
        discoveries: NOVUM_BOOK_DISCOVERIES,
        archaeology: NOVUM_ARCHAEOLOGY,
        journeys: journeyAtlases,
        setAtlasView: function (atlas) {
          if (atlasView !== atlas) {
            cancelCameraTravel();
            regionalView = null;
            artifactSitesKey = null;
            applyZoomLimits();
          }
          atlasView = atlas;
          var points = els.globePoints;
          points.material.uniforms.fineTerrain.value = atlas ? 1 : 0;
          points.material.uniforms.localTerrain.value = 0;
          points.geometry.setDrawRange(0, atlas ? points.geometry.userData.finePointCount : globePointCount);
          if (atlas && !overviewView) {
            overviewView = {
              position: camera.position.clone(),
              rotation: grps.globe.rotation.y,
              spinning: anims.spinEnabled
            };
          } else if (!atlas && overviewView) {
            grps.globe.rotation.y = overviewView.rotation;
            moveCamera(overviewView.position);
            setSpin(overviewView.spinning);
            overviewView = null;
          }
          if (atlas) {
            setSpin(false);
            anims.rotateSpeed = 0;
          }
        },
        resetArtifactView: function () {
          goToView(regionalView.position, true);
        },
        fitMission: function (key, index, animated) {
          var atlas = journeyAtlases[key];
          var missions = atlas.missions;
          var selected = missions[index];
          var routes = key === 'jesus' || selected.voyage ? [selected] : missions.filter(function (mission) { return !mission.voyage; });
          var sites = routes.reduce(function (result, mission) {
            return result.concat(mission.stops.map(function (stop) { return atlas.sites[stop.site]; }).filter(Boolean));
          }, []);
          fitSites(sites, key === 'jesus' ? cfg.sizes.globe + 7 : cfg.sizes.globe * 1.08, animated);
        },
        showMissionRoute: showMissionRoute,
        showArtifactSites: showArtifactSites,
        showSites: showSites,
        focusSite: function (siteId) {
          var journey = journeyAtlases[atlasView];
          var site = journey ? journey.sites[siteId] : NOVUM_BOOK_DISCOVERIES.sites[siteId] || NOVUM_ARCHAEOLOGY.sites[siteId];
          if (!site || site.water) return;
          var distance = Math.min(camera.position.length(), cfg.sizes.globe + navigation.siteClearance);
          var destination = coordToPos(site.lat, site.lon, distance).applyEuler(grps.globe.rotation);
          targetView.setFromVector3(destination);
          limitToRegion(targetView);
          goToView(destination.setFromSpherical(targetView), true);
        }
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
      var now = performance.now();
      animateMissionRoute(now);
      if (updateAtlasCamera) updateAtlasCamera(now);
      else orbitControls.update();
      animate(camera);
      var local = atlasView === 'jesus' && camera.position.length() < cfg.sizes.globe + 18 ? 1 : 0;
      var points = els.globePoints;
      if (local !== points.material.uniforms.localTerrain.value) {
        points.material.uniforms.localTerrain.value = local;
        points.geometry.setDrawRange(0, local ? points.geometry.attributes.position.count : points.geometry.userData.finePointCount);
      }
      renderer.render(scene, camera);
      if (renderTownLabels) renderTownLabels(atlasView === 'jesus');
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', syncCanvasToContainer);
  });
})();
