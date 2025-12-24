// World helpers: camera centering, ambient animations, and movement system
// Exposes a global WORLD object used by script.js and menu.js

var WORLD = (function () {
  // Camera settings (previously hard-coded in script.js)
  var mapZoomFactor = 1.2;
  var mapBaseTopOffset = 700;

  // Key constants (ASCII codes)
  var KEYS = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    UP: 38,
    LEFT: 37,
    DOWN: 40,
    RIGHT: 39,
    ENTER: 13,
    SPACE: 32,
  };

  // Movement state (shared with script.js)
  var movementState = {
    frame: 1,
    anim: null,
    keysPressed: {},
    keyPressed: false,
    // Base movement speed (pixels per tick). Increase for faster movement.
    distancePerIteration: 4,
    dylan: null, // Will be set to $("#dylan") when DOM is ready
  };

  function centerMap() {
    $("#map").css({
      left: mapZoomFactor * (window.innerWidth / 2),
      top: mapBaseTopOffset + window.innerHeight / 2,
    });
  }

  // Water animation (top river/edge) with cached selectors and rAF for smoother perf
  function startRiverAnimation() {
    var $wrapper = $("#wrapper");
    var $waterFunnel = $(".water.water_funnel");
    var $poolTop = $(".pool.top");
    var $poolMiddle = $(".pool.middle");
    var $poolVF = $(".pool.verticalFunnel");
    var $waterfall1 = $(".water.waterfall1");
    var $poolVF2 = $(".pool.verticalFunnel2");
    var $poolVF3 = $(".pool.verticalFunnel3");
    var $poolVF4 = $(".pool.verticalFunnel4");

    // Skip if no water elements exist
    if (
      !$wrapper.length &&
      !$waterFunnel.length &&
      !$poolTop.length &&
      !$poolMiddle.length &&
      !$poolVF.length &&
      !$waterfall1.length &&
      !$poolVF2.length &&
      !$poolVF3.length &&
      !$poolVF4.length
    ) {
      return;
    }

    var x = 0;
    var speed = 8; // pixels per second baseline (frame-rate independent)
    var last = performance.now();

    function tick(now) {
      var dt = (now - last) / 1000;
      last = now;
      x += speed * dt;

      if ($wrapper.length) $wrapper.css("background-position", x + "px 0");
      if ($waterFunnel.length)
        $waterFunnel.css("background-position", -x + "px 0");
      if ($poolTop.length)
        $poolTop.css("background-position", -0.5 * x + "px 0");
      if ($poolMiddle.length)
        $poolMiddle.css("background-position", "0 " + 0.5 * x + "px");
      if ($poolVF.length)
        $poolVF.css("background-position", "0 " + 0.5 * x + "px");
      if ($waterfall1.length)
        $waterfall1.css("background-position", -2 * x + "px 0");
      if ($poolVF2.length)
        $poolVF2.css("background-position", "0 " + 2 * x + "px");
      if ($poolVF3.length)
        $poolVF3.css("background-position", "0 " + 2 * x + "px");
      if ($poolVF4.length)
        $poolVF4.css("background-position", "0 " + 2 * x + "px");

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // Initialize movement system (call after DOM is ready)
  function initMovement() {
    movementState.dylan = $("#dylan");
  }


  return {
    KEYS: KEYS,
    centerMap: centerMap,
    movement: movementState,
    initMovement: initMovement,
    mapZoomFactor: mapZoomFactor,
    mapBaseTopOffset: mapBaseTopOffset,
    startRiverAnimation: startRiverAnimation,
  };
})();
