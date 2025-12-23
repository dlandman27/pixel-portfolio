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

  // Water animation disabled for now.
  function startRiverAnimation() {
    return;
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
