// ambient-life.js
// Small touches that make the park feel alive. Purely decorative: nothing here
// blocks input or reacts to clicks.
//   - Butterflies over the flower beds (dawn/day)
//   - Fireflies drifting around the park (dusk/night)
//   - Fish jumping in the river and the ocean
//   - Dust puffs at Dylan's feet while walking
//   - A lantern glow around Dylan that cuts through the night overlay

(function (global) {
  var REDUCED_MOTION =
    global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // World-unit areas (main map) used to place critters.
  var FLOWER_BEDS = [
    { x: 708, y: 520, width: 240, height: 96 }, // left of the bridge path
    { x: 1050, y: 520, width: 530, height: 96 }, // right of the bridge path
    { x: 1570, y: 960, width: 260, height: 380 }, // the garden gallery
  ];
  var PARK = { x: 180, y: 400, width: 1640, height: 920 };
  var WATER = [
    { x: 40, y: 236, width: 860, height: 90 }, // river, left of the bridge
    { x: 1100, y: 236, width: 860, height: 90 }, // river, right of the bridge
    { x: 80, y: 1460, width: 820, height: 380 }, // ocean, left of the dock
    { x: 1100, y: 1460, width: 820, height: 380 }, // ocean, right of the dock
  ];
  var BUTTERFLY_COLORS = ["#f9a8d4", "#fde68a", "#a5f3fc", "#fdba74", "#ffffff"];

  var layer = null;
  var butterflies = [];
  var fireflies = [];
  var lastStepDust = 0;

  function world() {
    return global.playerController && global.playerController.gameWorld;
  }

  function onMainMap() {
    var gw = world();
    return !!gw && gw.sceneName === "mainMap";
  }

  function timeOfDay() {
    var c = document.body.classList;
    if (c.contains("night")) return "night";
    if (c.contains("dusk")) return "dusk";
    if (c.contains("dawn")) return "dawn";
    return "day";
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pointIn(area) {
    return { x: rand(area.x, area.x + area.width), y: rand(area.y, area.y + area.height) };
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // ---------- Butterflies ----------

  function makeButterfly() {
    var home = pick(FLOWER_BEDS);
    var p = pointIn(home);
    var el = document.createElement("div");
    el.className = "ambient-butterfly";
    el.style.setProperty("--wing", pick(BUTTERFLY_COLORS));
    el.style.animationDelay = rand(0, 0.3).toFixed(2) + "s";
    layer.appendChild(el);
    return { el: el, home: home, x: p.x, y: p.y, target: pointIn(home), phase: rand(0, 6.28), rest: 0 };
  }

  function stepButterfly(b, t) {
    if (b.rest > 0) {
      b.rest--;
    } else {
      var dx = b.target.x - b.x;
      var dy = b.target.y - b.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) {
        b.target = pointIn(b.home);
        if (Math.random() < 0.3) b.rest = Math.floor(rand(40, 140)); // land on a flower for a bit
      } else {
        b.x += (dx / dist) * 0.35;
        b.y += (dy / dist) * 0.35;
      }
    }
    var bob = b.rest > 0 ? 0 : Math.sin(t / 180 + b.phase) * 2;
    b.el.classList.toggle("is-resting", b.rest > 0);
    b.el.style.transform = "translate(" + b.x.toFixed(1) + "px," + (b.y + bob).toFixed(1) + "px)";
  }

  // ---------- Fireflies ----------

  function makeFirefly() {
    var p = pointIn(PARK);
    var el = document.createElement("div");
    el.className = "ambient-firefly";
    el.style.animationDelay = rand(0, 4).toFixed(2) + "s";
    el.style.animationDuration = rand(2.5, 5).toFixed(2) + "s";
    layer.appendChild(el);
    return { el: el, ox: p.x, oy: p.y, rx: rand(10, 30), ry: rand(6, 18), speed: rand(0.00025, 0.0006), phase: rand(0, 6.28) };
  }

  function stepFirefly(f, t) {
    var a = t * f.speed + f.phase;
    var x = f.ox + Math.cos(a) * f.rx + Math.sin(a * 2.3) * 4;
    var y = f.oy + Math.sin(a * 1.4) * f.ry;
    f.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
  }

  // ---------- Fish jumps ----------

  function fishJump() {
    if (layer && onMainMap() && !document.hidden) {
      var spot = pointIn(pick(WATER));
      var dir = Math.random() < 0.5 ? -1 : 1;
      var wrap = document.createElement("div");
      wrap.className = "ambient-fish-jump";
      wrap.style.transform = "translate(" + spot.x.toFixed(0) + "px," + spot.y.toFixed(0) + "px)";
      wrap.innerHTML =
        '<div class="ambient-splash"></div>' +
        '<div class="ambient-fish" style="--dir:' + dir + '"></div>' +
        '<div class="ambient-splash is-late" style="--dir:' + dir + '"></div>';
      layer.appendChild(wrap);
      setTimeout(function () { wrap.remove(); }, 1600);
    }
    setTimeout(fishJump, rand(2500, 6000));
  }

  // ---------- Footstep dust ----------

  function stepDust(now) {
    var pc = global.playerController;
    var gw = world();
    if (!pc || !gw || !gw.player || pc.disableInput) return;
    var walking = pc.inputState.x !== 0 || pc.inputState.y !== 0;
    if (!walking || now - lastStepDust < 230) return;
    lastStepDust = now;
    var pos = gw.player.getPosition();
    var puff = document.createElement("div");
    puff.className = "ambient-step-dust";
    puff.style.left = (pos.x - 6 + rand(-3, 3)).toFixed(0) + "px";
    puff.style.top = (pos.y + 16).toFixed(0) + "px";
    var scene = gw._getSceneElement && gw._getSceneElement()[0];
    if (!scene) return;
    scene.appendChild(puff);
    setTimeout(function () { puff.remove(); }, 500);
  }

  // ---------- Lantern ----------

  function updateLantern() {
    var overlay = document.getElementById("day-night-overlay");
    var dylan = document.getElementById("dylan");
    if (!overlay || !dylan) return;
    var r = dylan.getBoundingClientRect();
    overlay.style.setProperty("--lantern-x", (r.left + r.width / 2).toFixed(0) + "px");
    overlay.style.setProperty("--lantern-y", (r.top + r.height * 0.6).toFixed(0) + "px");
  }

  // ---------- Loop ----------

  function tick(now) {
    var tod = timeOfDay();
    var visible = onMainMap();
    layer.style.display = visible ? "" : "none";
    layer.classList.toggle("is-night", tod === "night" || tod === "dusk");

    if (visible) {
      if (tod === "day" || tod === "dawn") butterflies.forEach(function (b) { stepButterfly(b, now); });
      else fireflies.forEach(function (f) { stepFirefly(f, now); });
    }
    if (tod === "night" || tod === "dusk") updateLantern();
    stepDust(now);
    requestAnimationFrame(tick);
  }

  function start() {
    var map = document.getElementById("map");
    if (!map) return;
    layer = document.createElement("div");
    layer.id = "ambient-layer";
    layer.setAttribute("aria-hidden", "true");
    map.appendChild(layer);

    for (var i = 0; i < 7; i++) butterflies.push(makeButterfly());
    for (var j = 0; j < 28; j++) fireflies.push(makeFirefly());

    requestAnimationFrame(tick);
    setTimeout(fishJump, 3000);
  }

  if (REDUCED_MOTION) return;

  // #map's contents are loaded asynchronously (helpers.js); wait for the game to start.
  $(window).load(function () {
    setTimeout(start, 3200);
  });
})(window);
