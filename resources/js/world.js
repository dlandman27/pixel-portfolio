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

  function startRiverAnimation() {
    var x = 0;
    setInterval(function () {
      x += 1;
      $("#wrapper").css("background-position", x + "px 0");

      $(".water.water_funnel").css("background-position", -x + "px 0");
      $(".pool.top").css("background-position", -0.5 * x + "px 0");
      $(".pool.middle").css("background-position", "0 " + 0.5 * x + "px");
      $(".pool.verticalFunnel").css(
        "background-position",
        "0 " + 0.5 * x + "px"
      );
      $(".water.waterfall1").css("background-position", -2 * x + "px 0");
      $(".pool.verticalFunnel2").css(
        "background-position",
        "0 " + 2 * x + "px"
      );
      $(".pool.verticalFunnel3").css(
        "background-position",
        "0 " + 2 * x + "px"
      );
      $(".pool.verticalFunnel4").css(
        "background-position",
        "0 " + 2 * x + "px"
      );
    }, 75);
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
