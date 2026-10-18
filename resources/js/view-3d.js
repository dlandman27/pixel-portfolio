// view-3d.js — 2.5D prototype (enable with ?view=3d)
// Tilts the main map's ground plane in CSS 3D and stands "tall" things
// (trees, fences, signs, the tent, characters, Dylan) up as upright cards
// with flat silhouette shadows. Physics, collisions and content are unchanged.

(function (global) {
  var params = new URLSearchParams(global.location.search);
  if (params.get("view") !== "3d") return;

  var TILT_DEG = parseFloat(params.get("tilt")) || 48;
  // A distant camera (near-orthographic, like the reference) so tall cards near the
  // bottom of the screen never reach the camera plane and flip.
  var PERSPECTIVE = parseFloat(params.get("persp")) || 3600;
  var SCALE = 3;
  var SHADOW_SKEW_DEG = -38;
  var SHADOW_LENGTH = 0.55;

  // Things that stand up. Ground (paths, water, grass, rugs, gallery squares) stays flat.
  var UPRIGHT = [
    "#dylan",
    ".trees-top", ".tall-tree", ".curved-tree", ".shrub",
    ".tent.t1", ".tentdoor",
    ".fence:not(.fence_shadow)", ".side_fence",
    ".lamppost", ".intro-portfolio", ".sign-interact", ".special-thanks-sign",
    ".characters", "#stump", "#bonfire", "#falling-tree", "#wood-log",
    ".bench", ".tree-stump", ".soccer-goal", ".fishing-rod",
    "#arch", "#arch_bottom", "#cave-name-sign", "#topdoor",
    "#outerbrick_top", ".rocks_top:not(.incline)", ".rocks_vert:not(.incline)",
    "#topbushes",
    ".mushroom-yellow", ".bush",
    // Tent interior
    ".couch", ".kitchen", ".kitchen-table", ".shelf", ".tv.back", ".painting", ".backdoor",
    ".tent-closet", ".matchbox", ".tentInterior.tent1.backwall",
    ".tentInterior.tent1.divider-wall:not(.bottomLining):not(.topLining)",
    // Cave
    ".cave-sign", ".cave-timeline-sign-interact", ".cave-side-rocks-left", ".cave-side-rocks-right",
    ".cave-exit-rocks-left", ".cave-exit-rocks-top",
  ];
  // Repeating ground cover stays on the ground (standing it up makes a wall of
  // flowers); it's lifted a hair with a soft shadow instead.
  var FLAT_DECOR = [
    ".yellow-flowers", ".pink-tulips", ".rose-bush", ".flower-with-mushroom",
    ".portfolio-yellow-flower", ".portfolio-rose-bush",
  ];

  // Top-down art drawn as a "box": the bottom part of the sprite stands up as the
  // front wall and the rest lies flat on top as the roof/top. Value = share of the
  // sprite's height that is front wall.
  var BOXES = [
    { sel: ".fence:not(.fence_shadow)", front: 0.55 },
    { sel: ".side_fence", front: 0.55 },
    { sel: ".bush", front: 0.5 },
    { sel: ".bench", front: 0.45 },
    { sel: ".tree-stump", front: 0.45 },
    { sel: "#stump", front: 0.45 },
    { sel: ".soccer-goal", front: 0.6 },
    // Gate over the bridge: posts stand up, the crossbar becomes an overhead beam
    { sel: "#arch, #arch_bottom", front: 0.72 },
    { sel: ".rocks_top.campfire", front: 1 },
    { sel: ".rocks_vert", front: 1 },
    { sel: ".rocks_top.beach", front: 1 },
    { sel: ".couch", front: 0.5 },
    { sel: ".kitchen", front: 0.6 },
    { sel: ".kitchen-table", front: 0.35 },
    { sel: ".tent-closet", front: 0.65 },
    { sel: ".tentInterior.tent1.backwall", front: 1 },
    { sel: ".tentInterior.tent1.divider-wall", front: 1 },
    { sel: ".cave-side-rocks-left, .cave-side-rocks-right", front: 1 },
    { sel: ".cave-exit-rocks-left, .cave-exit-rocks-top", front: 1 },
  ];

  // The north cliff: its rock strips stack into ONE vertical wall standing on
  // baseY, with the cave entrance and welcome sign mounted on its face
  // ("forward" nudges them in front of the rock so they don't z-fight).
  var CLIFF = {
    baseY: 192,
    parts: [
      { sel: "#outerbrick_top", forward: 0 },
      { sel: ".rocks_top:not(.incline):not(.campfire):not(.beach)", forward: 0 },
      { sel: "#topdoor", forward: 0.6 },
      { sel: "#cave-name-sign", forward: 1.2 },
    ],
  };

  // Walkable decks keep a flat floor, but their painted side rails stand up as
  // rows of short box segments (edge = rail width, seg = segment length).
  var RAILS = [
    { sel: "#bridge", edge: 17, seg: 24, front: 0.6 },
    { sel: "#dock", edge: 17, seg: 24, front: 0.6 },
  ];

  // Cards that get physical thickness (world px): darker copies stacked behind
  // them, so you see a solid top edge from the tilted camera.
  var DEPTH = [
    { sel: ".tent.t1", depth: 14 },
    { sel: ".intro-portfolio, .sign-interact, .special-thanks-sign, #cave-name-sign", depth: 3 },
    { sel: ".lamppost", depth: 3 },
    { sel: ".curved-tree, .trees-top, .tall-tree, .shrub", depth: 4 },
    { sel: "#falling-tree, #wood-log, .fishing-rod", depth: 3 },
    { sel: ".painting, .tv.back, .cave-timeline-sign-interact", depth: 2 },
  ];
  var MAX_DEPTH_LAYERS = 5;

  // Dylan and anything interactive must never be sliced into rows.
  var NEVER_SPLIT = "#dylan, #stump, #bonfire, #falling-tree, #wood-log, .characters, .sign-interact, .intro-portfolio, .fishing-rod, .tent, .bench, " +
    ".tv, .painting, .shelf, .backdoor, .matchbox, .cave-sign, .cave-timeline-sign-interact";

  var cosT = Math.cos((TILT_DEG * Math.PI) / 180);
  var sinT = Math.sin((TILT_DEG * Math.PI) / 180);
  // Cards stand truly vertical (so they never cut through walls) and are
  // stretched so they still appear at their original on-screen height.
  var STRETCH = 1 / sinT;
  var ready = false;

  document.documentElement.classList.add("view-3d");

  function world() {
    return global.playerController && global.playerController.gameWorld;
  }

  // The element holding the current scene (#map, #tent1 or #cave).
  function mapEl() {
    var gw = world();
    var el = gw && gw._getSceneElement ? gw._getSceneElement()[0] : null;
    return el || document.getElementById("map");
  }

  var SCENE_IDS = ["map", "tent1", "cave"];

  // ---------- Camera ----------

  // The #map box's own top-left on screen, before its transform (margins position it).
  function mapOrigin(map) {
    return { x: parseFloat(map.style.marginLeft) || 0, y: parseFloat(map.style.marginTop) || 0 };
  }

  function playerPos() {
    var gw = world();
    return gw && gw.player ? gw.player.getPosition() : { x: 1000, y: 600 };
  }

  // Perspective centered on the viewport, scale 3, tilt around Dylan's ground point.
  function updateCamera() {
    var map = mapEl();
    if (!map) return;
    // Scenes that aren't showing keep their normal 2D transform.
    SCENE_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el !== map && el.style.transform) el.style.transform = "";
    });
    var o = mapOrigin(map);
    var cx = global.innerWidth / 2 - o.x;
    var cy = global.innerHeight / 2 - o.y;
    var p = playerPos();
    map.style.transform =
      "translate(" + cx + "px," + cy + "px) perspective(" + PERSPECTIVE + "px) translate(" + -cx + "px," + -cy + "px) " +
      "scale(" + SCALE + ") translate(" + p.x + "px," + p.y + "px) rotateX(" + TILT_DEG + "deg) translate(" + -p.x + "px," + -p.y + "px)";
  }

  // Exact inverse of updateCamera for points on the ground (used by drag/pan).
  function clientToWorld(sx, sy) {
    var map = mapEl();
    if (!map) return null;
    var o = mapOrigin(map);
    var p = playerPos();
    var cx = global.innerWidth / 2 - o.x;
    var cy = global.innerHeight / 2 - o.y;
    var d = PERSPECTIVE;
    var a = sy - global.innerHeight / 2;
    var b = SCALE * p.y - cy;
    var u = (a * d - b * d) / (SCALE * cosT * d + SCALE * sinT * a);
    var f = d / (d - SCALE * u * sinT);
    var x = ((sx - global.innerWidth / 2) / f + cx) / SCALE;
    return { x: x, y: p.y + u };
  }

  // ---------- Upright cards ----------

  function imageSize(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
      img.onerror = function () { resolve(null); };
      img.src = url;
    });
  }

  // Height of one background tile in CSS px, so tall tiled strips can be sliced.
  function tileHeight(el, cs) {
    var m = cs.backgroundImage.match(/url\("?(.*?)"?\)/);
    if (!m) return Promise.resolve(null);
    var size = cs.backgroundSize.split(" ");
    if (size.length === 2 && /px$/.test(size[1])) return Promise.resolve(parseFloat(size[1]));
    return imageSize(m[1]).then(function (nat) {
      if (!nat) return null;
      var w = /px$/.test(size[0]) ? parseFloat(size[0]) : el.offsetWidth;
      return (nat.h * w) / nat.w;
    });
  }

  // Copies el's background onto a slice that starts offsetY px down el.
  // Percentage positions are resolved against el's box so slices line up.
  function copyBackground(from, to, cs, offsetY, tileH, offsetX) {
    to.style.backgroundImage = cs.backgroundImage;
    to.style.backgroundColor = cs.backgroundColor;
    to.style.backgroundSize = cs.backgroundSize;
    to.style.backgroundRepeat = cs.backgroundRepeat;
    to.style.borderRadius = cs.borderRadius;
    var pos = cs.backgroundPosition.split(" ");
    var x = pos[0] || "0px";
    if (/%$/.test(x)) {
      var tileW = parseFloat(cs.backgroundSize) || from.offsetWidth;
      x = ((from.offsetWidth - tileW) * parseFloat(x)) / 100 + "px";
    }
    var y = pos[1] || "0px";
    var yPx = /%$/.test(y)
      ? ((from.offsetHeight - (tileH || from.offsetHeight)) * parseFloat(y)) / 100
      : parseFloat(y) || 0;
    if (offsetX) x = parseFloat(x) - offsetX + "px";
    to.style.backgroundPosition = x + " " + (yPx - (offsetY || 0)) + "px";
  }

  function makeUpright(el) {
    el.classList.add("v3d-upright");
  }

  function addShadow(el, box, cs, tileH) {
    var hasImage = cs.backgroundImage && cs.backgroundImage !== "none";
    if (!hasImage) return null;
    var sh = document.createElement("div");
    sh.className = "v3d-shadow";
    sh.style.left = box.left + "px";
    sh.style.top = box.top + "px";
    sh.style.width = box.width + "px";
    sh.style.height = box.height + "px";
    copyBackground(el, sh, cs, box.offsetY, tileH);
    el.parentNode.insertBefore(sh, el);
    return sh;
  }

  function depthFor(el) {
    for (var i = 0; i < DEPTH.length; i++) if (el.matches(DEPTH[i].sel)) return DEPTH[i].depth;
    return 0;
  }

  // Stack darker copies behind a standing card along its own normal.
  function extrude(el, cs, box, depth, tileH) {
    if (!depth) return;
    var layers = Math.min(MAX_DEPTH_LAYERS, Math.ceil(depth));
    var step = depth / layers;
    for (var i = layers; i >= 1; i--) {
      var d = placed(document.createElement("div"), box);
      d.className = "v3d-part v3d-depth";
      d.style.setProperty("--v3d-depth-z", -(i * step) + "px");
      copyBackground(el, d, cs, box.offsetY, tileH);
      if (currentBase) d.style.setProperty("--v3d-base", currentBase);
      el.parentNode.insertBefore(d, el);
      registerOccluder(d, box);
    }
  }

  function frontShareFor(el) {
    for (var i = 0; i < BOXES.length; i++) if (el.matches(BOXES[i].sel)) return BOXES[i].front;
    return null;
  }

  // Standing pieces that can hide Dylan; they fade while he's behind them.
  var occluders = [];
  function registerOccluder(el, box) {
    occluders.push({ el: el, left: box.left, right: box.left + box.width, bottom: box.top + box.height });
  }

  var currentSource = "";
  // The element's own transform before we stand it up. getComputedStyle is
  // live, so reading it afterwards would return the stand-up rotation too and
  // the copies would get rotated twice (that mirrored the tent).
  var currentBase = "";
  function placed(div, box) {
    if (currentSource) div.dataset.v3dSrc = currentSource; // which element a piece came from
    div.style.left = box.left + "px";
    div.style.top = box.top + "px";
    div.style.width = box.width + "px";
    div.style.height = box.height + "px";
    return div;
  }

  // One upright card showing the slice of el's background that starts offsetY px down.
  function card(el, cs, box, tileH) {
    extrude(el, cs, box, depthFor(el), tileH);
    var c = placed(document.createElement("div"), box);
    c.className = "v3d-part v3d-upright";
    c.style.zIndex = cs.zIndex;
    copyBackground(el, c, cs, box.offsetY, tileH);
    if (currentBase) c.style.setProperty("--v3d-base", currentBase);
    el.parentNode.insertBefore(c, el);
    registerOccluder(c, box);
  }

  // Front wall (bottom slice, standing) + top (upper slice, flat, lifted onto the wall).
  function boxParts(el, cs, box, front, tileH) {
    var wallH = box.height * front;
    var topH = box.height - wallH;
    var groundY = box.top + box.height;
    if (topH > 0.5) {
      var top = placed(document.createElement("div"), {
        left: box.left, top: groundY - topH, width: box.width, height: topH,
      });
      top.className = "v3d-part v3d-top";
      top.style.setProperty("--v3d-lift", wallH + "px");
      copyBackground(el, top, cs, box.offsetY, tileH, box.offsetX);
      el.parentNode.insertBefore(top, el);
      registerOccluder(top, box);
    }
    var wall = placed(document.createElement("div"), {
      left: box.left, top: groundY - wallH, width: box.width, height: wallH,
    });
    wall.className = "v3d-part v3d-upright v3d-wall";
    copyBackground(el, wall, cs, box.offsetY + topH, tileH, box.offsetX);
    el.parentNode.insertBefore(wall, el);
    registerOccluder(wall, box);
  }

  // Splits el into rows of one background tile each (or one row if it isn't tiled).
  function rowsFor(el, th, cs) {
    var h = el.offsetHeight;
    // Only backgrounds that tile vertically are stacks of rows.
    // ("space" and "round" tile both ways too; only repeat-x / no-repeat don't).
    var tilesVertically = !/^(repeat-x|no-repeat)$/.test(cs.backgroundRepeat.trim());
    var count = tilesVertically && th && h > th * 1.3 ? Math.ceil(h / th) : 1;
    var step = count > 1 ? th : h;
    var rows = [];
    for (var i = 0; i < count; i++) {
      rows.push({
        left: el.offsetLeft,
        top: el.offsetTop + i * step,
        width: el.offsetWidth,
        height: Math.min(step, h - i * step),
        offsetY: i * step,
      });
    }
    return rows;
  }

  function cliffPartFor(el) {
    for (var i = 0; i < CLIFF.parts.length; i++) if (el.matches(CLIFF.parts[i].sel)) return CLIFF.parts[i];
    return null;
  }

  // Lays one strip of the cliff into the shared cliff wall at the right height.
  function cliffPart(el, cs, part, tileH) {
    var h = el.offsetHeight;
    var lift = CLIFF.baseY - (el.offsetTop + h);
    var wall = placed(document.createElement("div"), {
      left: el.offsetLeft, top: CLIFF.baseY + part.forward - h, width: el.offsetWidth, height: h,
    });
    wall.className = "v3d-part v3d-cliff";
    wall.style.setProperty("--v3d-lift", lift + "px");
    if (currentBase) wall.style.setProperty("--v3d-base", currentBase);
    copyBackground(el, wall, cs, 0, tileH);
    el.parentNode.insertBefore(wall, el);
    el.classList.add("v3d-sliced");
  }

  function setupUpright(el) {
    currentSource = (el.id ? "#" + el.id : "") + "." + Array.prototype.join.call(el.classList, ".");
    var cs = getComputedStyle(el);
    currentBase = cs.transform && cs.transform !== "none" ? cs.transform : "";
    var myBase = currentBase;
    var mySource = currentSource;
    // Pieces built after the async tile lookup must use this element's values.
    function mine() { currentBase = myBase; currentSource = mySource; }
    if (!el.offsetWidth || !el.offsetHeight || cs.display === "none") return Promise.resolve();
    var cliff = cliffPartFor(el);
    if (cliff) {
      return tileHeight(el, cs).then(function (th) { mine(); cliffPart(el, cs, cliff, th); });
    }
    var front = frontShareFor(el);
    // Small interactive things stay as themselves (a single standing card).
    if (el.matches(NEVER_SPLIT) && front === null) {
      if (currentBase) el.style.setProperty("--v3d-base", currentBase);
      el.classList.add("v3d-upright");
      var whole = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, offsetY: 0 };
      if (el.id !== "dylan") {
        registerOccluder(el, whole);
        extrude(el, cs, whole, depthFor(el));
        addShadow(el, whole, cs);
      }
      return Promise.resolve();
    }
    return tileHeight(el, cs).then(function (th) {
      mine();
      rowsFor(el, th, cs).forEach(function (row) {
        if (front !== null) boxParts(el, cs, row, front, th);
        else card(el, cs, row, th);
        addShadow(el, row, cs, th);
      });
      // Keep the original (invisible) so clicks and collisions still work.
      el.classList.add("v3d-sliced");
    });
  }

  // Dylan's shadow follows his sprite every frame.
  var dylanShadow = null;
  function updateDylanShadow() {
    var d = document.getElementById("dylan");
    if (!d) return;
    if (!dylanShadow || !dylanShadow.isConnected) {
      dylanShadow = document.createElement("div");
      dylanShadow.className = "v3d-shadow v3d-dylan-shadow";
      d.parentNode.insertBefore(dylanShadow, d);
    }
    dylanShadow.style.left = d.style.left;
    dylanShadow.style.top = d.style.top;
    dylanShadow.style.width = d.offsetWidth + "px";
    dylanShadow.style.height = d.offsetHeight + "px";
    var cs = getComputedStyle(d);
    dylanShadow.style.backgroundImage = cs.backgroundImage;
    dylanShadow.style.backgroundSize = cs.backgroundSize;
    dylanShadow.style.backgroundPosition = cs.backgroundPosition;
    dylanShadow.style.backgroundRepeat = "no-repeat";
    dylanShadow.style.visibility = cs.visibility;
  }

  // Builds cards/boxes/shadows for one scene root. Safe to call repeatedly:
  // elements already handled are skipped (the tent rebuilds its DOM on entry).
  function setupRails(root) {
    RAILS.forEach(function (rail) {
      root.querySelectorAll(rail.sel).forEach(function (el) {
        if (el.dataset.v3dRails) return;
        el.dataset.v3dRails = "1";
        var cs = getComputedStyle(el);
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        [0, w - rail.edge].forEach(function (dx) {
          for (var y = 0; y < h; y += rail.seg) {
            boxParts(el, cs, {
              left: el.offsetLeft + dx, top: el.offsetTop + y, width: rail.edge,
              height: Math.min(rail.seg, h - y), offsetY: y, offsetX: dx,
            }, rail.front);
          }
        });
      });
    });
  }

  function setup(root) {
    if (root) setupRails(root);
    if (!root) return Promise.resolve();
    var els = [];
    UPRIGHT.forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) {
        if (el.dataset.v3d || el.classList.contains("v3d-part") || el.closest(".portfolio-gallery")) return;
        if (els.indexOf(el) === -1) els.push(el);
      });
    });
    els.forEach(function (el) { el.dataset.v3d = "1"; });
    FLAT_DECOR.forEach(function (sel) {
      root.querySelectorAll(sel).forEach(function (el) { el.classList.add("v3d-flat-decor"); });
    });
    return Promise.all(els.map(setupUpright));
  }

  var lastScene = null;
  function watchScene() {
    var gw = world();
    var scene = gw && gw.sceneName;
    if (scene && scene !== lastScene) {
      lastScene = scene;
      // Give the scene's DOM a moment to build before standing things up.
      setTimeout(function () { setup(mapEl()); }, 150);
    }
  }

  // Run the tilt in the same step as the game's camera (syncToDom), so the
  // margins and the tilt pivot always come from the same player position.
  // Updating them in separate frames made Dylan jitter.
  if (typeof GameWorld !== "undefined" && GameWorld.prototype.syncToDom) {
    var syncToDom = GameWorld.prototype.syncToDom;
    GameWorld.prototype.syncToDom = function () {
      var result = syncToDom.apply(this, arguments);
      if (this === world()) updateCamera();
      return result;
    };
  }

  // Fade standing pieces just in front of (south of) Dylan that overlap him.
  var faded = [];
  function updateSeeThrough() {
    var gw = world();
    if (!gw || !gw.player) return;
    var p = gw.player.getPosition();
    var feet = p.y + 20;
    faded.forEach(function (el) { el.classList.remove("v3d-see-through"); });
    faded = [];
    for (var i = 0; i < occluders.length; i++) {
      var o = occluders[i];
      if (o.bottom > feet + 2 && o.bottom < feet + 150 && o.right > p.x - 20 && o.left < p.x + 20 && o.el.isConnected) {
        o.el.classList.add("v3d-see-through");
        faded.push(o.el);
      }
    }
  }

  function tick() {
    watchScene();
    if (ready) updateSeeThrough();
    if (ready) updateDylanShadow();
    requestAnimationFrame(tick);
  }

  global.View3D = {
    enabled: true,
    clientToWorld: clientToWorld,
    tilt: TILT_DEG,
  };

  // Shadow skew/length are CSS variables so they can be tuned live.
  document.documentElement.style.setProperty("--v3d-tilt", TILT_DEG + "deg");
  document.documentElement.style.setProperty("--v3d-stretch", STRETCH.toFixed(4));
  document.documentElement.style.setProperty("--v3d-shadow-skew", SHADOW_SKEW_DEG + "deg");
  document.documentElement.style.setProperty("--v3d-shadow-length", SHADOW_LENGTH);

  $(global).load(function () {
    // The map is injected asynchronously; give it a moment to lay out.
    setTimeout(function () {
      setup(document.getElementById("map")).then(function () {
        ready = true;
        document.documentElement.classList.add("view-3d-ready");
      });
    }, 600);
    requestAnimationFrame(tick);
  });
})(window);
