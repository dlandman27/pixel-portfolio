// intro.js
// Runs the opening once, in order:
//   1. DYLAN / LANDMAN letters fall in (CSS) while the page loads.
//   2. As soon as the letters have landed AND the page has loaded, the
//      letters tumble away and a circle wipe opens on Dylan.
//   3. Dylan drops in, lands with a dust puff, then the tutorial bubble shows.
// Any key/click/tap during the loader skips ahead as soon as loading is done.

(function (global) {
  // Tells GameWorld/startGame to leave the drop, reveal and tutorial to us.
  global.INTRO_SEQUENCE = true;

  var LETTERS_LANDED_MS = 1100; // last letter's fall ends (see .loader-name span delays)
  var SKIP_MIN_MS = 450; // never cut the letters off before they're readable
  var LEAVE_MS = 380; // letters tumbling away
  var IRIS_MS = 650; // circle wipe opening
  var REDUCED_MOTION =
    global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var startedAt = performance.now();
  var pageLoaded = false;
  var skipRequested = false;
  var finished = false;

  function elapsed() {
    return performance.now() - startedAt;
  }

  function maybeBegin() {
    if (finished || !pageLoaded) return;
    var holdUntil = skipRequested ? SKIP_MIN_MS : LETTERS_LANDED_MS;
    if (elapsed() < holdUntil) {
      setTimeout(maybeBegin, holdUntil - elapsed());
      return;
    }
    finished = true;
    begin();
  }

  function begin() {
    var loader = document.querySelector(".loading-screen");
    if (typeof startGame === "function") startGame();
    if (!loader) {
      revealDylan();
      return;
    }
    loader.classList.add("is-ready");

    if (REDUCED_MOTION) {
      $(loader).fadeOut(250, function () {
        loader.remove();
        revealDylan();
      });
      return;
    }

    loader.classList.add("is-leaving");
    setTimeout(function () {
      openIris(loader, function () {
        loader.remove();
      });
      // Dylan starts falling as the circle opens around him.
      setTimeout(revealDylan, IRIS_MS * 0.35);
    }, LEAVE_MS);
  }

  // Circle wipe centered on Dylan, growing in chunky 8px steps for a retro feel.
  function openIris(loader, done) {
    var dylan = document.getElementById("dylan");
    var r = dylan ? dylan.getBoundingClientRect() : null;
    var cx = r && r.width ? r.left + r.width / 2 : global.innerWidth / 2;
    var cy = r && r.height ? r.top + r.height * 0.6 : global.innerHeight / 2;
    var maxR = Math.hypot(Math.max(cx, global.innerWidth - cx), Math.max(cy, global.innerHeight - cy)) + 16;
    var t0 = performance.now();

    function frame(now) {
      var t = Math.min(1, (now - t0) / IRIS_MS);
      var eased = t * t * (3 - 2 * t);
      var radius = Math.round((eased * maxR) / 8) * 8;
      var mask =
        "radial-gradient(circle at " + cx + "px " + cy + "px, transparent " + radius + "px, #000 " + (radius + 1) + "px)";
      loader.style.webkitMaskImage = mask;
      loader.style.maskImage = mask;
      if (t < 1) requestAnimationFrame(frame);
      else done();
    }
    requestAnimationFrame(frame);
  }

  function revealDylan() {
    var gw = global.playerController && global.playerController.gameWorld;
    if (gw && typeof gw._playIntroDrop === "function") {
      gw._playIntroDrop();
    } else {
      $("#dylan").css("visibility", "visible");
      if (global.playerController) global.playerController.disableInput = false;
    }
    setTimeout(landingPuff, 430);
    setTimeout(function () {
      if (typeof openTutorial === "function" && getCookie("title-screen") != "true") {
        openTutorial();
      }
    }, 750);
  }

  function landingPuff() {
    var gw = global.playerController && global.playerController.gameWorld;
    var map = document.getElementById("map");
    if (!gw || !gw.player || !map) return;
    var pos = gw.player.getPosition();
    var puff = document.createElement("div");
    puff.className = "grab-dust-puff";
    puff.style.left = pos.x - 16 + "px";
    puff.style.top = pos.y + 10 + "px";
    map.appendChild(puff);
    setTimeout(function () { puff.remove(); }, 600);
  }

  function requestSkip(e) {
    if (finished) return;
    skipRequested = true;
    var loader = document.querySelector(".loading-screen");
    if (loader) loader.classList.add("is-skipping");
    maybeBegin();
  }

  global.addEventListener("keydown", requestSkip);
  global.addEventListener("pointerdown", requestSkip);

  $(global).load(function () {
    pageLoaded = true;
    maybeBegin();
  });
})(window);
