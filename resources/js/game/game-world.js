// game-world.js
// Game-specific world wrapper that uses the reusable CollisionWorld engine
// and the WORLD_COLLIDERS data config to drive Dylan and world collisions.

(function (global) {
  if (typeof CollisionWorld === "undefined") {
    console.error(
      "CollisionWorld is not available. Did you load engine/collision-world.js?"
    );
    return;
  }

  // Sprite and collider dimensions for Dylan.
  // These control both the physics body and the debug overlay.
  var PLAYER_SPRITE_WIDTH = 32;
  var PLAYER_SPRITE_HEIGHT = 64;
  var PLAYER_COLLIDER_WIDTH = 24;
  var PLAYER_COLLIDER_HEIGHT = 40;
  var PLAYER_MAX_SPEED = 2.2;

  // World/map dimensions (in world units) – match #wrapper in CSS.
  var WORLD_WIDTH = 2000;
  var WORLD_HEIGHT = 1200;
  // Visual map scale (matches CSS: transform: scale(3, 3))
  var MAP_SCALE = 3;
  // CSS zoom is visual-only; ignore it for camera math so centering isn't affected.
  var MAP_ZOOM = 1;
  // Effective scale used for camera math (keep equal to MAP_SCALE)
  var EFFECTIVE_MAP_SCALE = MAP_SCALE;
  // Intro settings
  var INTRO_DURATION_MS = 1300;

  class GameWorld {
    constructor() {
      this.collisionWorld = null;
      this.sceneName = null;
      this.player = null;
      // Collider debug overlays default OFF
      this._colliderDebugEnabled = false;
      this._colliderDebugEls = [];
      this._initialMapMarginLeft = 0;
      this._initialMapMarginTop = 0;
      this._spawn = { x: 0, y: 0 };
      this._cameraOffset = { x: 0, y: 0 };
      // Animation state
      this._animFrame = 2;
      this._animAccum = 0;
      this._lastDir = "down"; // 'down' | 'up' | 'left' | 'right'
      this._lastFacingApplied = null;
      this._lastFrameApplied = null;
      this._introPlayed = false;
    }

    /**
     * Initialize the game world from WORLD_COLLIDERS for a given scene.
     * sceneName: 'mainMap', 'tent1', etc.
     */
    init(sceneName) {
      this._buildScene(sceneName, null);
      // Hide player until intro completes
      $("#dylan").css("visibility", "hidden");
    }

    /**
     * Change to a different scene (e.g., enter tent/cave).
     * options.spawnOverride can set a custom spawn {x,y} within the target scene.
     */
    changeScene(sceneName, options) {
      options = options || {};
      var spawnOverride = options.spawnOverride || null;

      // Clear debug overlays from previous scene
      this.clearColliderDebugOverlays();

      // Rebuild scene
      this._buildScene(sceneName, spawnOverride);
    }

    /**
     * Internal helper to build scene bodies/triggers/player.
     */
    _buildScene(sceneName, spawnOverride) {
      if (typeof WORLD_COLLIDERS === "undefined") {
        console.error("WORLD_COLLIDERS is not defined. Did you load world.config.js?");
        return;
      }

      this.sceneName = sceneName || "mainMap";
      this._setSceneVisibility(this.sceneName);
      // Force debug overlays to regenerate on scene change
      this._colliderDebugRendered = false;
      var cfg = WORLD_COLLIDERS[this.sceneName];
      if (!cfg) {
        console.error("WORLD_COLLIDERS has no entry for scene:", this.sceneName);
        return;
      }

      this._spawn = spawnOverride || cfg.playerSpawn || { x: 0, y: 0 };

      // Capture initial map camera offsets so we can pan relative to spawn
      var $parent = this._getSceneElement();
      if ($parent.length) {
        var ml = parseInt($parent.css("margin-left"), 10);
        var mt = parseInt($parent.css("margin-top"), 10);
        this._initialMapMarginLeft = isNaN(ml) ? 0 : ml;
        this._initialMapMarginTop = isNaN(mt) ? 0 : mt;
      } else {
        this._initialMapMarginLeft = 0;
        this._initialMapMarginTop = 0;
      }

      this.collisionWorld = new CollisionWorld({});

      // Player spawn
      var spawn = this._spawn;
      this.player = this.collisionWorld.addPlayer({
        x: spawn.x,
        y: spawn.y,
        width: PLAYER_COLLIDER_WIDTH,
        height: PLAYER_COLLIDER_HEIGHT,
        maxSpeed: PLAYER_MAX_SPEED
      });

      // Register solids
      if (cfg.solids && cfg.solids.length) {
        for (var i = 0; i < cfg.solids.length; i++) {
          var s = cfg.solids[i];
          this.collisionWorld.addSolidRect({
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            tag: s.tag
          });
        }
      }

      // Register triggers
      if (cfg.triggers && cfg.triggers.length) {
        for (var j = 0; j < cfg.triggers.length; j++) {
          var t = cfg.triggers[j];
          this.collisionWorld.addTriggerRect({
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
            tag: t.tag
          });
        }
      }

      // Wire trigger-based scene transitions if provided in config
      this._wireSceneTriggers(cfg);

      // Example: wire tutorial trigger if present
      var self = this;
      this.collisionWorld.on("enter:tutorialArea", function () {
        if (typeof openTutorial === "function") {
          openTutorial();
        }
      });

      // Initial sync of Dylan to physics position (do not auto-center; preserve manual offset)
      this.syncToDom();

      // Play intro drop only the first time we enter the main map
      if (!this._introPlayed && this.sceneName === "mainMap") {
        if (global.playerController) {
          global.playerController.disableInput = true;
        }
        this._playIntroDrop();
        this._introPlayed = true;
      }

      // If debug was enabled before init, render overlays once
      if (this._colliderDebugEnabled) {
        this.renderColliderDebugOverlays();
        this._colliderDebugRendered = true;
      }
    }

    /**
     * Advance physics and sync Dylan to DOM.
     * input: { x: -1..1, y: -1..1 }
     */
    update(deltaMs, input) {
      if (!this.collisionWorld) return;
      var effectiveInput = input || { x: 0, y: 0 };
      if (global.playerController && global.playerController.disableInput) {
        effectiveInput = { x: 0, y: 0 };
        if (this.player && typeof this.player.setVelocity === "function") {
          this.player.setVelocity({ x: 0, y: 0 });
        }
      }
      this.collisionWorld.update(deltaMs, effectiveInput);
      this.updateAnimation(deltaMs, effectiveInput);
      this.syncToDom();

      // Do not re-render debug overlays every frame; only on enable/scene change
    }

    /**
     * Push the physics player position into the #dylan DOM element.
     * We treat the physics body position as the center of the collider,
     * whose bottom edge roughly corresponds to Dylan's feet.
     */
    syncToDom() {
      if (!this.player) return;
      var pos = this.player.getPosition();
      var $dylan = $("#dylan");
      if ($dylan.length) {
        // Compute foot position from collider center
        var footY = pos.y + PLAYER_COLLIDER_HEIGHT / 2;
        var left = pos.x - PLAYER_SPRITE_WIDTH / 2;
        var top = footY - PLAYER_SPRITE_HEIGHT;
        $dylan.css({
          left: left + "px",
          top: top + "px"
        });
      }

      // Camera follow: keep player centered using world pos and effective scale.
      var $parent = this._getSceneElement();
      if ($parent.length) {
        var viewportCenterX = window.innerWidth / 2;
        var viewportCenterY = window.innerHeight / 2;

        var camX = pos.x;
        var camY = pos.y;

        // Optional micro-adjust to fine-tune visual centering
        var NUDGE_X = 0; // negative shifts camera left; adjust as needed
        var NUDGE_Y = 0;  // negative shifts camera up; adjust as needed

        var newMarginLeft =
          viewportCenterX - camX * EFFECTIVE_MAP_SCALE + this._cameraOffset.x + NUDGE_X;
        var newMarginTop =
          viewportCenterY - camY * EFFECTIVE_MAP_SCALE + this._cameraOffset.y + NUDGE_Y;

        // Snap to whole pixels to avoid subpixel drift/lead
        newMarginLeft = Math.round(newMarginLeft);
        newMarginTop = Math.round(newMarginTop);

        // Clamp so the camera never slides past the left or top page edges.
        // This may break perfect centering near boundaries but prevents showing empty space.
        if (newMarginLeft > 0) {
          newMarginLeft = 0;
        }
        // Prevent exposing empty space on the right edge.
        // Map width is based on world width scaled by EFFECTIVE_MAP_SCALE.
        var mapWidthPx = WORLD_WIDTH * EFFECTIVE_MAP_SCALE;
        var minMarginLeft = window.innerWidth - mapWidthPx;
        if (newMarginLeft < minMarginLeft) {
          newMarginLeft = minMarginLeft;
        }
        // Clamp so the camera never slides below the top of the page.
        // This may break perfect centering near the top boundary, but prevents showing empty space.
        if (newMarginTop > 0) {
          newMarginTop = 0;
        }
        // Prevent exposing empty space on the bottom edge.
        // Map height is based on world height scaled by EFFECTIVE_MAP_SCALE.
        var mapHeightPx =
          (this.sceneName === "cave" ? 1200 : WORLD_HEIGHT) * EFFECTIVE_MAP_SCALE;
        var bottomBufferPx = 2000; // allow slight extra downward pan
        var minMarginTop = window.innerHeight - mapHeightPx - bottomBufferPx;
        if (newMarginTop < minMarginTop) {
          newMarginTop = minMarginTop;
        }

        $parent.css({
          "margin-left": newMarginLeft + "px",
          "margin-top": newMarginTop + "px"
        });
      }
    }

    // ---- Collider debug overlays (WORLD_COLLIDERS-based) ----

    setColliderDebugEnabled(enabled) {
      this._colliderDebugEnabled = !!enabled;
      this._colliderDebugRendered = false;
      if (this._colliderDebugEnabled) {
        this.renderColliderDebugOverlays();
        this._colliderDebugRendered = true;
      } else {
        this.clearColliderDebugOverlays();
      }
    }

    getColliderDebugEnabled() {
      return !!this._colliderDebugEnabled;
    }

    clearColliderDebugOverlays() {
      for (var i = 0; i < this._colliderDebugEls.length; i++) {
        var el = this._colliderDebugEls[i];
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
      this._colliderDebugEls = [];
    }

    renderColliderDebugOverlays() {
      // Avoid rebuilding repeatedly each frame; only build when enabled/changed.
      if (!this._colliderDebugEnabled) return;
      // Clear existing overlays once before drawing
      this.clearColliderDebugOverlays();
      if (typeof WORLD_COLLIDERS === "undefined") return;

      var cfg = WORLD_COLLIDERS[this.sceneName];
      if (!cfg) return;

      var parentSelector =
        this.sceneName === "tent1" ? "#tent1" : this.sceneName === "cave" ? "#cave" : "#map";
      var $parent = $(parentSelector);
      if (!$parent.length) return;

      // Solids
      if (cfg.solids && cfg.solids.length) {
        for (var i = 0; i < cfg.solids.length; i++) {
          var s = cfg.solids[i];
          var $el = $(
            "<div class='world-collider-debug world-collider-debug-solid'></div>"
          );
          $el.css({
            position: "absolute",
            left: s.x + "px",
            top: s.y + "px",
            width: s.width + "px",
            height: s.height + "px"
          });
          if (s.tag) {
            $el.attr("title", s.tag);
          }
          $parent.append($el);
          this._colliderDebugEls.push($el[0]);
        }
      }

      // Triggers
      if (cfg.triggers && cfg.triggers.length) {
        for (var j = 0; j < cfg.triggers.length; j++) {
          var t = cfg.triggers[j];
          var $tEl = $(
            "<div class='world-collider-debug world-collider-debug-trigger'></div>"
          );
          $tEl.css({
            position: "absolute",
            left: t.x + "px",
            top: t.y + "px",
            width: t.width + "px",
            height: t.height + "px",
            background: "rgba(255,0,0,0.15)",
            border: "2px solid rgba(255,0,0,0.7)"
          });
          if (t.tag) {
            $tEl.attr("title", t.tag);
          }
          $parent.append($tEl);
          this._colliderDebugEls.push($tEl[0]);
        }
      }

      // Player hitbox (for reference)
      if (this.player) {
        var pos = this.player.getPosition();
        var footY = pos.y + PLAYER_COLLIDER_HEIGHT / 2;
        var left = pos.x - PLAYER_COLLIDER_WIDTH / 2;
        var top = footY - PLAYER_COLLIDER_HEIGHT;
        var $pEl = $(
          "<div class='world-collider-debug world-collider-debug-player'></div>"
        );
        $pEl.css({
          position: "absolute",
          left: left + "px",
          top: top + "px",
          width: PLAYER_COLLIDER_WIDTH + "px",
          height: PLAYER_COLLIDER_HEIGHT + "px"
        });
        $pEl.attr("title", "player");
        $parent.append($pEl);
        this._colliderDebugEls.push($pEl[0]);
      }
    }

    // Utility: log current player center position to console for collider authoring
    logPlayerPositionOnce() {
      if (!this.player) return;
      var pos = this.player.getPosition();
      console.log(
        "WORLD_COLLIDER_POINT:",
        Math.round(pos.x),
        Math.round(pos.y)
      );
    }

    // Utility: log player and camera state (for debugging)
    logCameraState() {
      if (!this.player) return;
      var pos = this.player.getPosition();
      var $parent = this._getSceneElement();
      var ml = $parent.length ? parseInt($parent.css("margin-left"), 10) || 0 : 0;
      var mt = $parent.length ? parseInt($parent.css("margin-top"), 10) || 0 : 0;
      console.log(
        "[CameraLog] player=", pos.x.toFixed(1), pos.y.toFixed(1),
        "offset=", this._cameraOffset.x.toFixed(1), this._cameraOffset.y.toFixed(1),
        "margin=", ml.toFixed(1), mt.toFixed(1),
        "scene=", this.sceneName
      );
    }

    // Utility: pan camera by a fixed offset (in world pixels)
    panCamera(dx, dy) {
      this._cameraOffset.x += dx;
      this._cameraOffset.y += dy;
      // Re-apply camera immediately
      this.syncToDom();
      if (this._colliderDebugEnabled) {
        this.renderColliderDebugOverlays();
      }
    }

    // Utility: set camera offset absolutely (used for mouse dragging)
    setCameraOffset(x, y) {
      this._cameraOffset.x = x;
      this._cameraOffset.y = y;
      this.syncToDom();
      if (this._colliderDebugEnabled) {
        this.renderColliderDebugOverlays();
      }
    }

    getCameraOffset() {
      return { x: this._cameraOffset.x, y: this._cameraOffset.y };
    }

    _setSceneVisibility(sceneName) {
      var $map = $("#map");
      var $cave = $("#cave");
      var $tent1 = $("#tent1");

      if (sceneName === "cave") {
        if ($map.length) $map.hide();
        if ($tent1.length) $tent1.hide();
        if ($cave.length) $cave.show();
      } else if (sceneName === "tent1") {
        if ($map.length) $map.hide();
        if ($cave.length) $cave.hide();
        if ($tent1.length) $tent1.show();
      } else {
        if ($map.length) $map.show();
        if ($cave.length) $cave.hide();
        if ($tent1.length) $tent1.hide();
      }
    }

    _getSceneElement() {
      var selector =
        this.sceneName === "tent1"
          ? "#tent1"
          : this.sceneName === "cave"
          ? "#cave"
          : "#map";
      var $el = $(selector);
      if ($el.length) return $el;
      return $("body");
    }

    // Intro animation: make Dylan fall in from above the viewport
    _playIntroDrop() {
      var $dylan = $("#dylan");
      if (!$dylan.length) return;
      $dylan.removeClass("intro-drop");
      // Force reflow so animation can restart if needed
      void $dylan[0].offsetWidth;
      $dylan.addClass("intro-drop");
      // Show player immediately as drop starts
      $dylan.css("visibility", "visible");
      // Disable movement during intro
      if (global.playerController) {
        global.playerController.disableInput = true;
        global.playerController.keysDown = {};
        global.playerController.inputState = { x: 0, y: 0 };
      }
      if (this.player && typeof this.player.setVelocity === "function") {
        this.player.setVelocity({ x: 0, y: 0 });
      }
      // Clean up after animation finishes to avoid lingering transforms
      setTimeout(function () {
        $dylan.removeClass("intro-drop");
        if (global.playerController) {
          global.playerController.disableInput = false;
        }
      }, INTRO_DURATION_MS);
    }

    // Utility: recenter camera on the player's current world position.
    // Clears manual pan offsets and lets syncToDom recompute from physics.
    centerCameraOnPlayer() {
      this._cameraOffset.x = 0;
      this._cameraOffset.y = 0;
      this.syncToDom();
      if (this._colliderDebugEnabled) {
        this.renderColliderDebugOverlays();
      }
    }

    // Wire scene transitions from trigger definitions
    _wireSceneTriggers(cfg) {
      var self = this;
      if (!cfg || !cfg.triggers || !cfg.triggers.length) return;
      cfg.triggers.forEach(function (t) {
        if (!t.tag || !t.nextScene) return;
        var eventName = "enter:" + t.tag;
        self.collisionWorld.on(eventName, function () {
          self.changeScene(t.nextScene, {
            spawnOverride: t.nextSpawn || null
          });
        });
      });
    }

    // ---- Sprite animation based on input direction ----

    updateAnimation(deltaMs, input) {
      var dx = input && typeof input.x === "number" ? input.x : 0;
      var dy = input && typeof input.y === "number" ? input.y : 0;

      var isMoving = dx !== 0 || dy !== 0;
      var dir = this._lastDir;

      if (isMoving) {
        // Choose dominant axis for direction
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx < 0 ? "left" : "right";
        } else {
          dir = dy < 0 ? "up" : "down";
        }
      }

      // If direction changed, reset animation frame
      if (dir !== this._lastDir) {
        this._animFrame = 2;
        this._animAccum = 0;
        this._lastDir = dir;
      }

      if (isMoving) {
        this._animAccum += deltaMs;
        var frameDuration = 90; // ms per frame (slightly snappier)
        if (this._animAccum >= frameDuration) {
          this._animAccum = 0;
          this._animFrame++;
          if (this._animFrame > 7) {
            this._animFrame = 2; // cycle frames 2..7
          }
        }
      } else {
        // Idle pose: stand on frame 2
        this._animFrame = 2;
      }

      // Apply sprite frame if SpriteManager is available
      var frame = this._animFrame;
      var facing;
      switch (dir) {
        case "up":
          facing = "back";
          break;
        case "down":
          facing = "front";
          break;
        case "left":
          facing = "left";
          break;
        case "right":
          facing = "right";
          break;
      }

      // Only update sprite when facing/frame actually change
      if (facing !== this._lastFacingApplied || frame !== this._lastFrameApplied) {
        this._lastFacingApplied = facing;
        this._lastFrameApplied = frame;

        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame(facing, frame);
        } else {
          // Fallback: basic background-image updates if SpriteManager is unavailable
          var url =
            typeof URL !== "undefined" && URL.getDylan
              ? URL.getDylan()
              : "resources/images/characters/dylan";
          var suffix = "";
          if (facing === "front") suffix = "/dylan-front-";
          else if (facing === "back") suffix = "/dylan-back-";
          else if (facing === "left") suffix = "/dylan-left-";
          else if (facing === "right") suffix = "/dylan-right-";
          $("#dylan").css(
            "background-image",
            "url(" + url + suffix + frame + ".png)"
          );
        }
      }
    }
  }

  global.GameWorld = GameWorld;
})(window);


