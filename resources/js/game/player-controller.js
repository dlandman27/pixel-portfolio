// player-controller.js
// Owns input state and drives the GameWorld / CollisionWorld update loop.

(function (global) {
  if (typeof GameWorld === "undefined") {
    console.warn("GameWorld is not available; PlayerController will not start.");
  }

  // Disable camera grab/drag and keyboard panning.
  var CAMERA_PAN_INTERACTIONS_ENABLED = false;

  class PlayerController {
    constructor() {
      this.gameWorld = null;
      this.inputState = { x: 0, y: 0 };
      this.keysDown = {};
      this._lastTime = null;
      this._running = false;
    }

    init() {
      // Expose a flag so legacy movement in script.js can be disabled
      global.useNewMovementEngine = true;

      // Ensure a GameWorld exists
      if (!this.gameWorld) {
        this.gameWorld = new GameWorld();
        this.gameWorld.init("mainMap");
      }

      this._bindInput();
      this._bindMouse();
      this._startLoop();
    }

    _bindInput() {
      var self = this;
      var movementKeys = [37, 38, 39, 40, 65, 68, 83, 87]; // arrows + WASD

      window.addEventListener("keydown", function (e) {
        // Spacebar: dev helper to log player position for collider authoring
        if (e.keyCode === 32) {
          e.preventDefault();
          if (
            self.gameWorld &&
            typeof self.gameWorld.logPlayerPositionOnce === "function"
          ) {
            self.gameWorld.logPlayerPositionOnce();
          }
          if (
            self.gameWorld &&
            typeof self.gameWorld.logCameraState === "function"
          ) {
            self.gameWorld.logCameraState();
          }
          return;
        }

        // IJKL keys for manual camera pan (debug)
        if (
          CAMERA_PAN_INTERACTIONS_ENABLED &&
          self.gameWorld &&
          typeof self.gameWorld.panCamera === "function"
        ) {
          var panStep = 32;
          if (e.keyCode === 73) {
            // I - up
            self.gameWorld.panCamera(0, -panStep);
            return;
          } else if (e.keyCode === 75) {
            // K - down
            self.gameWorld.panCamera(0, panStep);
            return;
          } else if (e.keyCode === 74) {
            // J - left
            self.gameWorld.panCamera(-panStep, 0);
            return;
          } else if (e.keyCode === 76) {
            // L - right
            self.gameWorld.panCamera(panStep, 0);
            return;
          }
        }

        // Preserve existing behaviours for movement keys (WASD / arrows)
        if (movementKeys.indexOf(e.keyCode) !== -1) {
          self.keysDown[e.keyCode] = true;
          self._recomputeAxes();
        }
      });

      window.addEventListener("keyup", function (e) {
        if (movementKeys.indexOf(e.keyCode) !== -1) {
          self.keysDown[e.keyCode] = false;
          self._recomputeAxes();
        }
      });
    }

    _bindMouse() {
      if (!CAMERA_PAN_INTERACTIONS_ENABLED) {
        return; // disable grab/drag panning
      }
      var self = this;
      var isDragging = false;
      var startX = 0;
      var startY = 0;
      var startOffset = { x: 0, y: 0 };

      window.addEventListener("mousedown", function (e) {
        // Only start dragging if clicking on the map or tent1 (not UI)
        var target = e.target;
        var inWorld =
          target.closest &&
          (target.closest("#map") || target.closest("#tent1"));
        if (!inWorld) return;
        if (e.button !== 0) return; // left mouse only

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        if (
          self.gameWorld &&
          typeof self.gameWorld.getCameraOffset === "function"
        ) {
          startOffset = self.gameWorld.getCameraOffset();
        } else {
          startOffset = { x: 0, y: 0 };
        }
        e.preventDefault();
      });

      window.addEventListener("mousemove", function (e) {
        if (!isDragging) return;
        if (
          !self.gameWorld ||
          typeof self.gameWorld.setCameraOffset !== "function"
        ) {
          return;
        }
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        var newX = startOffset.x + dx;
        var newY = startOffset.y + dy;
        self.gameWorld.setCameraOffset(newX, newY);
      });

      window.addEventListener("mouseup", function () {
        isDragging = false;
      });

      window.addEventListener("mouseleave", function () {
        isDragging = false;
      });
    }

    _recomputeAxes() {
      var left = this.keysDown[37] || this.keysDown[65]; // left / A
      var right = this.keysDown[39] || this.keysDown[68]; // right / D
      var up = this.keysDown[38] || this.keysDown[87]; // up / W
      var down = this.keysDown[40] || this.keysDown[83]; // down / S

      var x = 0;
      var y = 0;
      if (left && !right) x = -1;
      else if (right && !left) x = 1;

      if (up && !down) y = -1;
      else if (down && !up) y = 1;

      this.inputState.x = x;
      this.inputState.y = y;
    }

    _startLoop() {
      if (this._running) return;
      this._running = true;
      this._lastTime = performance.now();

      var self = this;
      function tick(now) {
        if (!self._running) return;
        var delta = now - self._lastTime;
        self._lastTime = now;

        if (self.gameWorld) {
          self.gameWorld.update(delta, self.inputState);
        }

        requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }
  }

  // Automatically initialize controller once DOM/scripts are ready
  $(function () {
    if (typeof GameWorld === "undefined") return;
    global.playerController = new PlayerController();
    global.playerController.init();
  });

})(window);


