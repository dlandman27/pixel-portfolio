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
  var PLAYER_DEFAULT_SPEED = 2.2;

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
      // Bonfire camera animation state
      this._bonfireCameraTarget = null; // { x, y } when sitting, null when not
      this._bonfireCameraCurrent = null; // Current interpolated position
      // Star creation interval
      this._starCreationInterval = null;
      this._shootingStarInterval = null;
      // Animation state
      this._animFrame = 2;
      this._animAccum = 0;
      this._lastDir = "down"; // 'down' | 'up' | 'left' | 'right'
      this._lastFacingApplied = null;
      this._lastFrameApplied = null;
      this._introPlayed = false;
      // Player speed (configurable via settings)
      this._playerSpeed = this._getInitialSpeed();
    }
    
    /**
     * Get initial player speed from cookie or default
     */
    _getInitialSpeed() {
      if (typeof getCookie === "function") {
        var savedSpeed = getCookie("character-speed");
        if (savedSpeed) {
          return parseFloat(savedSpeed);
        }
      }
      return PLAYER_DEFAULT_SPEED;
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
      
      // Clear z-index debug overlays when changing scenes
      if (typeof ZIndexManager !== "undefined") {
        ZIndexManager.setDebugEnabled(false);
      }
      
      // Reset z-index tracking when changing scenes
      if (typeof ZIndexManager !== "undefined") {
        ZIndexManager.reset();
      }
      
      // Stop star creation when changing scenes
      if (this._starCreationInterval) {
        clearInterval(this._starCreationInterval);
        this._starCreationInterval = null;
      }
      
      // Stop shooting star creation when changing scenes
      if (this._shootingStarInterval) {
        clearInterval(this._shootingStarInterval);
        this._shootingStarInterval = null;
      }
      
      // Notify CloudManager of scene change
      if (typeof CloudManager !== "undefined" && typeof CloudManager.onSceneChange === "function") {
        CloudManager.onSceneChange(sceneName);
      }

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
      // Build tent DOM if entering tent
      if (this.sceneName === "tent1" && typeof buildTentDomIfNeeded === "function") {
        buildTentDomIfNeeded();
      }
      // Build cave DOM if entering cave
      if (this.sceneName === "cave" && typeof buildCaveDomIfNeeded === "function") {
        buildCaveDomIfNeeded();
        // Immediately update z-indexes after building cave DOM so signs have correct z-index on entry
        if (this.player) {
          this.updateZIndexes();
        }
      }
      // Move Dylan to the active scene container
      this._moveDylanToActiveScene();
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
        maxSpeed: this._playerSpeed
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
      } else {
        // Ensure input is enabled for all other scenes
        if (global.playerController) {
          global.playerController.disableInput = false;
        }
      }

      // Initialize z-index manager for this scene
      if (typeof ZIndexManager !== "undefined") {
        ZIndexManager.init(this.sceneName);
        // If debug was enabled, render debug overlays
        if (this._colliderDebugEnabled) {
          ZIndexManager.setDebugEnabled(true, this.sceneName);
        }
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
      
      // Check if input is disabled
      var inputDisabled = false;
      if (global.playerController && global.playerController.disableInput) {
        effectiveInput = { x: 0, y: 0 };
        inputDisabled = true;
        if (this.player && typeof this.player.setVelocity === "function") {
          this.player.setVelocity({ x: 0, y: 0 });
        }
      }
      
      // Store original input BEFORE any modifications (use the raw input parameter)
      var originalInput = input ? { x: input.x || 0, y: input.y || 0 } : { x: 0, y: 0 };
      
      // Apply bonfire stairs modifier (migrated from old navigation.js)
      // Bottom stairs: left/right movement also moves up/down (diagonal)
      // Top stairs: vertical speed is increased when moving
      // We bypass applyInput and set velocity directly when on stairs
      var onStairs = false;
      var stairsVelocity = null;
      
      if (this.sceneName === "mainMap" && this.player) {
        var pos = this.player.getPosition();
        var maxSpeed = this.player.maxSpeed || 4;
        
        // Bottom/Left stairs area: world coordinates converted from old CSS coordinates
        // Old CSS: left 736-816, top 908-952 (exclusive: top < 952)
        // World: x = CSS left + 16, y = CSS top + 44
        var stairsBottomMinX = 752;
        var stairsBottomMaxX = 832;
        var stairsBottomMinY = 952;
        var stairsBottomMaxY = 996;
        
        // Top/Front stairs area - exact coordinates: x: 972, y: 602, w: 56, h: 68
        var stairsTopMinX = 972;
        var stairsTopMaxX = 972 + 56;
        var stairsTopMinY = 602;
        var stairsTopMaxY = 602 + 68;
        
        // Check bottom stairs (diagonal movement: left+up, right+down)
        if (pos.x >= stairsBottomMinX && pos.x <= stairsBottomMaxX &&
            pos.y >= stairsBottomMinY && pos.y < stairsBottomMaxY) {
          // On bottom bonfire stairs - set velocity directly for diagonal movement
          // Only apply when moving horizontally (matches old behavior)
          if (originalInput.x !== 0) {
            onStairs = true;
            // Calculate velocity maintaining 3:1 ratio from old frame-based movement
            // Old: 12px/frame horizontal, 4px/frame vertical = 3:1 ratio
            var stairsSpeed = maxSpeed * 2.5; // Scale to match old frame-based speed
            var vx = originalInput.x * stairsSpeed;
            // Vertical: left (x < 0) moves up (y < 0), right (x > 0) moves down (y > 0)
            var vy = originalInput.x * stairsSpeed / 3; // 1/3 of horizontal speed
            stairsVelocity = { x: vx, y: vy };
          }
        }
        // Check top stairs (increased vertical speed)
        else if (pos.x >= stairsTopMinX && pos.x <= stairsTopMaxX &&
                 pos.y >= stairsTopMinY && pos.y <= stairsTopMaxY) {
          // On top bonfire stairs - increase vertical speed when moving up/down
          // Horizontal movement should work normally (no vertical component)
          if (originalInput.y !== 0 || originalInput.x !== 0) {
            onStairs = true;
            // Calculate velocity with increased vertical speed
            var stairsSpeed = maxSpeed * 2.5;
            var vx = originalInput.x * stairsSpeed;
            var vy = 0;
            if (originalInput.y !== 0) {
              // Moving up or down - increase vertical speed
              vy = originalInput.y * stairsSpeed;
            }
            // If only moving horizontally, just use normal horizontal speed (no vertical component)
            stairsVelocity = { x: vx, y: vy };
          }
        }
      }
      
      // If on stairs, set velocity directly and skip applyInput
      // Otherwise, use normal input
      if (onStairs && stairsVelocity) {
        // Set velocity BEFORE physics update so it's used during the update
        if (this.player && typeof this.player.setVelocity === "function") {
          this.player.setVelocity(stairsVelocity);
        }
        // Update physics with zero input (velocity already set above)
        // But we need to prevent applyInput from overriding it
        // So we'll manually update the engine without calling applyInput
        if (this.collisionWorld && this.collisionWorld.engine) {
          // Skip applyInput and just update the engine
          var Engine = Matter.Engine;
          Engine.update(this.collisionWorld.engine, deltaMs);
        } else {
          this.collisionWorld.update(deltaMs, { x: 0, y: 0 });
        }
        // Re-apply velocity after update in case it was modified
        if (this.player && typeof this.player.setVelocity === "function") {
          this.player.setVelocity(stairsVelocity);
        }
      } else {
        // Normal movement - use regular input
        this.collisionWorld.update(deltaMs, effectiveInput);
      }
      this.updateAnimation(deltaMs, effectiveInput);
      this.syncToDom();
      this.updateDoors();
      this.updateZIndexes();
      
      // Update player debug box position every frame if debug is enabled
      if (this._colliderDebugEnabled && this.player) {
        this._updatePlayerDebugBox();
      }

      // Do not re-render debug overlays every frame; only on enable/scene change
    }
    
    /**
     * Update player debug box position to follow the character
     */
    _updatePlayerDebugBox() {
      if (!this.player) return;
      
      // Find the player debug element
      var $playerDebug = null;
      for (var i = 0; i < this._colliderDebugEls.length; i++) {
        var el = this._colliderDebugEls[i];
        if (el && el.classList && el.classList.contains("world-collider-debug-player")) {
          $playerDebug = $(el);
          break;
        }
      }
      
      if (!$playerDebug || !$playerDebug.length) return;
      
      // Update position based on current player position
      var pos = this.player.getPosition();
      var footY = pos.y + PLAYER_COLLIDER_HEIGHT / 2;
      var left = pos.x - PLAYER_COLLIDER_WIDTH / 2;
      var top = footY - PLAYER_COLLIDER_HEIGHT;
      
      $playerDebug.css({
        left: left + "px",
        top: top + "px"
      });
    }

    /**
     * Update tent doors based on player position.
     * Replicates legacy door logic from script.js move() function.
     */
    updateDoors() {
      if (this.sceneName !== "mainMap") return;
      if (!this.player) return;
      
      var $dylan = $("#dylan");
      if (!$dylan.length) return;
      
      var dylanLeft = parseInt($dylan.css("left"));
      
      // Control tent1 door based on player position
      // Door opens when player moves left (left < 428), closes when moving right (left >= 428)
      if (typeof doorOpen === "undefined") {
        global.doorOpen = false;
      }
      
      if (!global.doorOpen) {
        // Door is closed, check if we should open it
        if (dylanLeft < 428) {
          $(".tentdoor.tent1").animate({ "height": 0 }, 1000);
          global.doorOpen = true;
        }
      } else {
        // Door is open, check if we should close it
        if (dylanLeft >= 428) {
          $(".tentdoor.tent1").animate({ "height": 38 }, 1000);
          global.doorOpen = false;
        }
      }
    }

    /**
     * Update z-indexes of objects based on player position.
     * Uses ZIndexManager to dynamically change z-indexes so player can walk behind/in front of objects.
     */
    updateZIndexes() {
      if (!this.player) return;
      if (typeof ZIndexManager === "undefined") return;
      
      // Get player position (center of collider)
      var pos = this.player.getPosition();
      
      // Update z-indexes based on player position
      ZIndexManager.update(pos.y, pos.x, this.sceneName);
      
      // Update timeline signs z-index individually based on their Y position
      if (this.sceneName === "cave") {
        var $signs = $(".cave-timeline-sign-interact");
        $signs.each(function() {
          var $sign = $(this);
          var signY = parseFloat($sign.attr("data-sign-y")) || 0;
          // Player z-index in cave is 9999
          // Use player's center Y position for comparison
          // signY is the sign's top Y position (stored in data-sign-y)
          // In cave: Y increases as you go down
          // When player Y > sign Y: player should be in front (player is below sign)
          // When player Y <= sign Y: sign should be in front (player is at or above sign)
          if (pos.y > signY) {
            // Player center is below sign top - player should be in front (sign behind player)
            $sign.css("z-index", "9998");
          } else {
            // Player center is at or above sign top - sign should be in front of player
            $sign.css("z-index", "10000");
          }
        });
      }
      
      // Update bonfire vignette effect
      this.updateBonfireVignette(pos);
    }
    
    /**
     * Update bonfire vignette effect based on player position.
     * Creates a cozy, focused atmosphere when player is in the bonfire area.
     * Uses two vignette layers to darken both background and foreground elements.
     */
    updateBonfireVignette(pos) {
      if (this.sceneName !== "mainMap") return;
      
      var $vignetteBottom = $("#bonfire-vignette-bottom");
      var $vignetteMiddle = $("#bonfire-vignette-middle");
      var $vignetteTop = $("#bonfire-vignette-top");
      var $stars = $("#bonfire-stars");
      if (!$vignetteBottom.length && !$vignetteMiddle.length && !$vignetteTop.length) return;
      
      // Bonfire area boundaries (adjusted to match collision bounds)
      // Center is approximately at x: 984, y: 652
      var bonfireMinX = 780;  // Left wall
      var bonfireMaxX = 1292; // Right wall
      var bonfireMinY = 650;  // Top cliff
      var bonfireMaxY = 1068; // Bottom trees
      
      // Check if player is in bonfire area
      var inBonfireArea = pos.x >= bonfireMinX && pos.x <= bonfireMaxX &&
                         pos.y >= bonfireMinY && pos.y <= bonfireMaxY;
            
      // Toggle vignette class on all three layers
      if (inBonfireArea) {
        $vignetteBottom.addClass("active");
        $vignetteMiddle.addClass("active");
        $vignetteTop.addClass("active");
        
        // Show stars container
        if ($stars.length) {
          $stars.addClass("active");
          
          // Initialize star creation interval if not already set
          if (!this._starCreationInterval) {
            this._startStarCreation($stars);
          }
          
          // Initialize shooting star creation if not already set
          if (!this._shootingStarInterval) {
            this._startShootingStarCreation($stars);
          }
        }
      } else {
        $vignetteBottom.removeClass("active");
        $vignetteMiddle.removeClass("active");
        $vignetteTop.removeClass("active");
        
        // Hide stars and stop creating new ones
        if ($stars.length) {
          $stars.removeClass("active");
        }
        
        // Stop star creation
        if (this._starCreationInterval) {
          clearInterval(this._starCreationInterval);
          this._starCreationInterval = null;
        }
        
        // Stop shooting star creation
        if (this._shootingStarInterval) {
          clearInterval(this._shootingStarInterval);
          this._shootingStarInterval = null;
        }
      }
    }
    
    /**
     * Start creating stars continuously while in bonfire area
     */
    _startStarCreation($container) {
      var self = this;
      var mapWidth = 2000;
      var mapHeight = 1200;
      
      // Create a new star every 200-400ms
      this._starCreationInterval = setInterval(function() {
        // Remove old stars that have faded out (opacity 0 after animation)
        $container.find(".bonfire-star").each(function() {
          var $star = $(this);
          // Check if animation has completed (stars fade out at 50% of 4s = 2s)
          var animationDelay = parseFloat($star.css("animation-delay")) || 0;
          var elapsed = (Date.now() - ($star.data("createdAt") || Date.now())) / 1000;
          if (elapsed > 2 + animationDelay) {
            $star.remove();
          }
        });
        
        // Create a new star
        var $star = $("<div>").addClass("bonfire-star");
        
        // Random position across the map
        var x = Math.random() * mapWidth;
        var y = Math.random() * mapHeight;
        
        // Make some stars brighter (20% chance)
        if (Math.random() < 0.2) {
          $star.addClass("bright");
        }
        
        // Random animation delay for variety (0-1s)
        var delay = Math.random() * 1;
        $star.css({
          left: x + "px",
          top: y + "px",
          "animation-delay": delay + "s"
        });
        
        // Track when star was created
        $star.data("createdAt", Date.now());
        
        $container.append($star);
        
        // Remove star after animation completes (4s + delay)
        setTimeout(function() {
          $star.remove();
        }, (4000 + delay * 1000));
      }, 300); // Create a new star every 300ms
    }
    
    /**
     * Start creating shooting stars occasionally for ambiance
     */
    _startShootingStarCreation($container) {
      var self = this;
      var mapWidth = 2000;
      var mapHeight = 1200;
      
      // Create a shooting star every 3-8 seconds
      function createShootingStar() {
        var $shootingStar = $("<div>").addClass("shooting-star");
        
        // Random starting position (top-left area for diagonal movement)
        var startX = Math.random() * (mapWidth * 0.3); // Start in left 30% of map
        var startY = Math.random() * (mapHeight * 0.2); // Start in top 20% of map
        
        $shootingStar.css({
          left: startX + "px",
          top: startY + "px"
        });
        
        $container.append($shootingStar);
        
        // Remove after animation completes (2s)
        setTimeout(function() {
          $shootingStar.remove();
        }, 2000);
        
        // Schedule next shooting star (3-8 seconds)
        var nextDelay = 3000 + Math.random() * 5000;
        self._shootingStarInterval = setTimeout(createShootingStar, nextDelay);
      }
      
      // Start the first shooting star after a short delay
      var initialDelay = 2000 + Math.random() * 3000;
      this._shootingStarInterval = setTimeout(createShootingStar, initialDelay);
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
        
        // Set z-index based on scene
        var currentZIndex = $dylan.css("z-index");
        var cssUpdate = {
          left: left + "px",
          top: top + "px"
        };
        // Set z-index based on scene: 9999 in tent and cave, 49 on main map
        // Special case: when sitting on any log/bench, set player z-index to 100
        var isSittingOnTopBench = typeof window !== "undefined" && 
                                   typeof window.onLogTop !== "undefined" && 
                                   window.onLogTop === true;
        var isSittingOnLeftStump = typeof window !== "undefined" && 
                                   typeof window.onLogLeft !== "undefined" && 
                                   window.onLogLeft === true;
        var isSittingOnRightStump = typeof window !== "undefined" && 
                                    typeof window.onLogRight !== "undefined" && 
                                    window.onLogRight === true;
        var isSittingOnAnyLog = isSittingOnTopBench || isSittingOnLeftStump || isSittingOnRightStump;
        
        if (this.sceneName === "tent1" || this.sceneName === "cave") {
          if (currentZIndex !== "9999") {
            cssUpdate["z-index"] = "9999";
          }
        } else if (this.sceneName === "mainMap") {
          // When sitting on any log/bench, player should be above (z-index 100)
          if (isSittingOnAnyLog) {
            if (currentZIndex !== "100") {
              cssUpdate["z-index"] = "100";
            }
          } else {
            // Reset to 49 when on main map (correct z-index for player on main map)
            if (currentZIndex !== "49") {
              cssUpdate["z-index"] = "49";
            }
          }
        }
        $dylan.css(cssUpdate);
      }

      // Camera follow: keep player centered using world pos and effective scale.
      var $parent = this._getSceneElement();
      if ($parent.length) {
        var sceneWidth = WORLD_WIDTH;
        var sceneHeight = WORLD_HEIGHT;
        
        if (this.sceneName === "tent1") {
          sceneWidth = 416;
          sceneHeight = 1200;
        } else if (this.sceneName === "cave") {
          sceneWidth = 2000;
          sceneHeight = 1200;
        }
        
        var mapWidthPx = sceneWidth * EFFECTIVE_MAP_SCALE;
        var mapHeightPx = sceneHeight * EFFECTIVE_MAP_SCALE;
        
        // Special handling for tent: center horizontally, follow vertically (no clamping)
        if (this.sceneName === "tent1") {
          var newMarginLeft = (window.innerWidth - mapWidthPx) / 2;
          
          // Follow player vertically with camera offset (no clamping in tent)
          var viewportCenterY = window.innerHeight / 2;
          var camY = pos.y;
          var newMarginTop = viewportCenterY - camY * EFFECTIVE_MAP_SCALE + this._cameraOffset.y;
          newMarginTop = Math.round(newMarginTop);
          
          // No clamping in tent - allow free camera movement
          
          $parent.css({
            "margin-left": Math.round(newMarginLeft) + "px",
            "margin-top": newMarginTop + "px"
          });
        }
        // For small scenes (like tent) that fit within viewport, center the scene itself
        else if (mapWidthPx <= window.innerWidth && mapHeightPx <= window.innerHeight) {
          var newMarginLeft = (window.innerWidth - mapWidthPx) / 2;
          var newMarginTop = (window.innerHeight - mapHeightPx) / 2;
          
          $parent.css({
            "margin-left": Math.round(newMarginLeft) + "px",
            "margin-top": Math.round(newMarginTop) + "px"
          });
        } else {
          // For large scenes, follow the player with camera clamping
          var viewportCenterX = window.innerWidth / 2;
          var viewportCenterY = window.innerHeight / 2;

          var camX, camY;
          
          // Check if player is sitting on a log - if so, smoothly center camera on bonfire instead of player
          var isSitting = typeof window !== "undefined" && typeof window.onLog !== "undefined" && window.onLog;
          var bonfireCenterX = 999;
          var bonfireCenterY = 834;
          
          if (isSitting) {
            // Set target for smooth camera movement
            if (!this._bonfireCameraTarget) {
              // Initialize target and current position
              this._bonfireCameraTarget = { x: bonfireCenterX, y: bonfireCenterY };
              // Start from current camera position (derived from current margin)
              var $parent = this._getSceneElement();
              if ($parent.length) {
                var currentMarginLeft = parseInt($parent.css("margin-left")) || 0;
                var currentMarginTop = parseInt($parent.css("margin-top")) || 0;
                var viewportCenterX = window.innerWidth / 2;
                var viewportCenterY = window.innerHeight / 2;
                // Reverse the camera formula: worldPos = (viewportCenter - margin + offset) / scale
                var currentWorldX = (viewportCenterX - currentMarginLeft + this._cameraOffset.x) / EFFECTIVE_MAP_SCALE;
                var currentWorldY = (viewportCenterY - currentMarginTop + this._cameraOffset.y) / EFFECTIVE_MAP_SCALE;
                this._bonfireCameraCurrent = { x: currentWorldX, y: currentWorldY };
              } else {
                this._bonfireCameraCurrent = { x: bonfireCenterX, y: bonfireCenterY };
              }
            } else {
              // Update target in case it changed
              this._bonfireCameraTarget = { x: bonfireCenterX, y: bonfireCenterY };
            }
            
            // Smoothly interpolate towards target (lerp with factor 0.1 for smooth movement)
            var lerpFactor = 0.1;
            this._bonfireCameraCurrent.x += (this._bonfireCameraTarget.x - this._bonfireCameraCurrent.x) * lerpFactor;
            this._bonfireCameraCurrent.y += (this._bonfireCameraTarget.y - this._bonfireCameraCurrent.y) * lerpFactor;
            
            camX = this._bonfireCameraCurrent.x;
            camY = this._bonfireCameraCurrent.y;
          } else {
            // Not sitting - clear bonfire camera state and follow player
            this._bonfireCameraTarget = null;
            this._bonfireCameraCurrent = null;
            camX = pos.x;
            camY = pos.y;
          }

          // Optional micro-adjust to fine-tune visual centering
          var NUDGE_X = 0; // negative shifts camera left; adjust as needed
          var NUDGE_Y = 0;  // negative shifts camera up; adjust as needed

          // Always apply camera offset - it allows free panning even when snapped
          var newMarginLeft =
            viewportCenterX - camX * EFFECTIVE_MAP_SCALE + this._cameraOffset.x + NUDGE_X;
          var newMarginTop =
            viewportCenterY - camY * EFFECTIVE_MAP_SCALE + this._cameraOffset.y + NUDGE_Y;

          // Snap to whole pixels to avoid subpixel drift/lead
          newMarginLeft = Math.round(newMarginLeft);
          newMarginTop = Math.round(newMarginTop);

          // Normal clamping for all areas
          // Clamp so the camera never slides past the left or top page edges.
          if (newMarginLeft > 0) {
            newMarginLeft = 0;
          }
          
          var minMarginLeft = window.innerWidth - mapWidthPx;
          if (newMarginLeft < minMarginLeft) {
            newMarginLeft = minMarginLeft;
          }
          
          if (newMarginTop > 0) {
            newMarginTop = 0;
          }
          
          var bottomBufferPx = 0;
          if (this.sceneName === "mainMap") {
            bottomBufferPx = 2000; // allow slight extra downward pan on main map
          }
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
    }

    // ---- Collider debug overlays (WORLD_COLLIDERS-based) ----

    setColliderDebugEnabled(enabled) {
      this._colliderDebugEnabled = !!enabled;
      this._colliderDebugRendered = false;
      if (this._colliderDebugEnabled) {
        this.renderColliderDebugOverlays();
        this._colliderDebugRendered = true;
        // Also enable z-index debug visualization
        if (typeof ZIndexManager !== "undefined") {
          ZIndexManager.setDebugEnabled(true, this.sceneName);
        }
      } else {
        this.clearColliderDebugOverlays();
        // Disable z-index debug visualization
        if (typeof ZIndexManager !== "undefined") {
          ZIndexManager.setDebugEnabled(false);
        }
      }
    }

    getColliderDebugEnabled() {
      return !!this._colliderDebugEnabled;
    }

    /**
     * Set player movement speed
     */
    setPlayerSpeed(speed) {
      this._playerSpeed = speed;
      // Update the player's maxSpeed directly
      if (this.player) {
        this.player.maxSpeed = speed;
      }
    }

    /**
     * Get current player speed
     */
    getPlayerSpeed() {
      return this._playerSpeed;
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
      
      // Add purple debug overlay for bonfire stairs areas
      if (this.sceneName === "mainMap") {
        // Bottom/Left stairs area (stairs-left.campfire at CSS top: 752px, left: 752px)
        // Old code checked: left 736-816, top 908-952
        // World coordinates: x = CSS left + 16, y = CSS top + 44
        var stairsLeftMinX = 752;
        var stairsLeftMaxX = 832;
        var stairsLeftMinY = 952;
        var stairsLeftMaxY = 996;
        var stairsLeftWidth = stairsLeftMaxX - stairsLeftMinX;
        var stairsLeftHeight = stairsLeftMaxY - stairsLeftMinY;
        
        var $stairsLeftDebug = $("<div class='world-collider-debug world-collider-debug-stairs'></div>");
        $stairsLeftDebug.css({
          position: "absolute",
          left: stairsLeftMinX + "px",
          top: stairsLeftMinY + "px",
          width: stairsLeftWidth + "px",
          height: stairsLeftHeight + "px",
          border: "2px dashed rgba(168, 85, 247, 0.9)", // purple
          backgroundColor: "rgba(168, 85, 247, 0.25)", // purple with transparency
          pointerEvents: "none",
          zIndex: 999998
        });
        $stairsLeftDebug.attr("title", "Bonfire Left Stairs Area");
        $parent.append($stairsLeftDebug);
        this._colliderDebugEls.push($stairsLeftDebug[0]);
        
        // Top/Front stairs area - exact coordinates provided by user
        // x: 972, y: 602, width: 56, height: 68
        var stairsFrontMinX = 972;
        var stairsFrontMaxX = 972 + 56;
        var stairsFrontMinY = 602;
        var stairsFrontMaxY = 602 + 68;
        var stairsFrontWidth = 56;
        var stairsFrontHeight = 68;
        
        var $stairsFrontDebug = $("<div class='world-collider-debug world-collider-debug-stairs'></div>");
        $stairsFrontDebug.css({
          position: "absolute",
          left: stairsFrontMinX + "px",
          top: stairsFrontMinY + "px",
          width: stairsFrontWidth + "px",
          height: stairsFrontHeight + "px",
          border: "2px dashed rgba(168, 85, 247, 0.9)", // purple
          backgroundColor: "rgba(168, 85, 247, 0.25)", // purple with transparency
          pointerEvents: "none",
          zIndex: 999998
        });
        $stairsFrontDebug.attr("title", "Bonfire Front/Top Stairs Area");
        $parent.append($stairsFrontDebug);
        this._colliderDebugEls.push($stairsFrontDebug[0]);
      }

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

      // Timeline sign z-index transition points (show where z-index changes)
      if (this.sceneName === "cave" && typeof TIMELINE_ENTRIES !== "undefined") {
        TIMELINE_ENTRIES.forEach(function(entry, idx) {
          var signY = (entry.y || 0) - 10;
          // Show the Y position where z-index transitions (at signY)
          var $zIndexDebug = $(
            "<div class='world-collider-debug' style='border: 2px dashed rgba(255, 255, 0, 0.8); background-color: rgba(255, 255, 0, 0.1);'></div>"
          );
          $zIndexDebug.css({
            position: "absolute",
            left: "0px",
            top: signY + "px",
            width: "2000px",
            height: "2px"
          });
          $zIndexDebug.attr("title", "Z-Index Transition: Sign " + idx + " (" + (entry.year || "") + ") - Player behind above this line, in front below");
          $parent.append($zIndexDebug);
          this._colliderDebugEls.push($zIndexDebug[0]);
        }.bind(this));
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
      if (sceneName === "cave") {
        $("#cave").css("display", "block");
        $("#map").css("display", "none");
        $("#tent1").css("display", "none");
      } else if (sceneName === "tent1") {
        $("#tent1").css("display", "block");
        $("#map").css("display", "none");
        $("#cave").css("display", "none");
        // Close timeline modal if open when leaving cave
        if (typeof closeTimelineModal === "function") {
          closeTimelineModal();
        }
      } else {
        $("#map").css("display", "block");
        $("#tent1").css("display", "none");
        $("#cave").css("display", "none");
        // Close timeline modal if open when leaving cave
        if (typeof closeTimelineModal === "function") {
          closeTimelineModal();
        }
        // Re-apply visibility state of collectible items based on inventory
        this._updateCollectibleVisibility();
      }
    }

    /**
     * Update visibility of collectible items based on inventory state.
     * This ensures items that have been collected remain hidden when returning to the map.
     */
    _updateCollectibleVisibility() {
      if (typeof inventory === "undefined") return;
      
      // Fishing rod
      if (inventory.fishingRod) {
        $(".fishing-rod").css("display", "none");
      } else {
        $(".fishing-rod").css("display", "block");
      }
      
      // Matchbox
      if (inventory.matchbox) {
        $(".matchbox").css("display", "none");
      } else {
        $(".matchbox").css("display", "block");
      }
      
      // Resume/Paper
      if (inventory.resume) {
        $(".paper").css("display", "none");
      } else {
        $(".paper").css("display", "block");
      }
      
      // Minimap
      if (inventory.minimap) {
        $(".scroll").css("display", "none");
      } else {
        $(".scroll").css("display", "block");
      }
      
      // Axe (stump state)
      if (inventory.axe) {
        $("#stump").css("background-image", "url(" + (typeof URL !== "undefined" ? URL.getNature() : "") + "/stump.png)");
      } else {
        $("#stump").css("background-image", "url(" + (typeof URL !== "undefined" ? URL.getNature() : "") + "/stump-with-axe.png)");
      }
      
      // Wood log
      if (inventory.wood) {
        $("#wood-log").css("display", "none");
      }
      
      // Fishbook
      if (inventory.fishbook) {
        $(".book-item").css("display", "none");
      } else {
        $(".book-item").css("display", "block");
      }
      
      // Coins - hide collected coins
      if (inventory.coins && Array.isArray(inventory.coins)) {
        inventory.coins.forEach(function(coinId) {
          $(".coin-item[data-coin-id='" + coinId + "']").remove();
        });
      }
    }

    _moveDylanToActiveScene() {
      var $dylan = $("#dylan");
      if (!$dylan.length) return;

      var targetContainer;
      if (this.sceneName === "cave") {
        targetContainer = $("#cave");
      } else if (this.sceneName === "tent1") {
        targetContainer = $("#tent1");
      } else {
        targetContainer = $("#map");
      }

      // Only move if Dylan is not already in the target container
      if (targetContainer.length && $dylan.parent()[0] !== targetContainer[0]) {
        targetContainer.append($dylan);
      }
      
      // Ensure Dylan is visible
      $dylan.css({
        "visibility": "visible",
        "display": "block"
      });
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
      return $("#map");
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

  // Build tent DOM on-demand (used when entering tent scene)
  function buildTentDomIfNeeded() {
    var $tent = $("#tent1");
    if (!$tent.length) return;

    // Add all tent elements directly to #tent1 (like cave does)
    $tent.empty();
    
    // Add the main tentInterior background container
    $tent.append('<div class="tentInterior tent1"></div>');
    // Only add matchbox if it hasn't been collected yet
    if (typeof inventory !== "undefined" && !inventory.matchbox) {
      $tent.append('<a><div onClick="takeMatchbox()" class="matchbox"></div></a>');
    }
    $tent.append('<div class="divider"></div>');
    $tent.append('<div class="tentInterior tent1 door front"></div>');
    $tent.append('<div class="tentInterior tent1 backwall"></div>');
    $tent.append('<div class="tentInterior tent1 divider-wall"></div>');
    $tent.append('<div class="tentInterior tent1 divider-wall bottomLining"></div>');
    $tent.append('<div class="tentInterior tent1 divider-wall topLining"></div>');
    $tent.append('<div class="tentInterior tent1 divider-wall topLining t2"></div>');
    $tent.append('<div class="tentInterior tent1 bottomLining"></div>');
    $tent.append('<div class="tentInterior tent1 topLining"></div>');
    $tent.append('<div class="tentInterior tent1 topLining t2"></div>');
    
    // Kitchen
    $tent.append('<div class="shelf"></div>');
    $tent.append('<div class="kitchen"></div>');
    $tent.append('<div class="kitchen-floor"></div>');
    $tent.append('<div class="backdoor"></div>');
    $tent.append('<div class="doormat back"></div>');
    $tent.append('<div class="kitchen-table"></div>');
    
    // Center
    $tent.append('<a><div onClick="openPaintingLightbox()" class="painting"></div></a>');
    $tent.append('<div class="doormat front"></div>');
    
    // Den
    $tent.append('<a><div onClick="sitOnCouch()" class="couch"></div></a>');
    $tent.append('<a><div onClick="openTVScreen()" class="tv back"><div class="tv front"><p style="position: absolute; left: 13px; color: darkgray; font-size: 0.4rem; top: 10px;">About Me</p></div></div></a>');
  }

  // Build cave DOM on-demand (used when entering cave scene)
  function buildCaveDomIfNeeded() {
    var $cave = $("#cave");
    if (!$cave.length) return;
    var $hall = $('<div class="cave-hall"></div>');
    var $sideRocksLeft = $('<div class="cave-side-rocks-left"></div>');
    var $sideRocksRight = $('<div class="cave-side-rocks-right"></div>');
    var $overlayLeft = $('<div class="cave-dark left"></div>');
    var $overlayRight = $('<div class="cave-dark right"></div>');
    var $exit = $('<div class="cave-exit" aria-label="Exit cave"></div>');
    var $exitLightBeam = $('<div class="cave-exit-light-beam"></div>');
    var $exitRocksLeft = $('<div class="cave-exit-rocks-left"></div>');
    var $exitRocksTop = $('<div class="cave-exit-rocks-top"></div>');

    $cave.empty();
    $cave.append($overlayLeft);
    $cave.append($overlayRight);
    $cave.append($exitLightBeam);
    $cave.append($sideRocksLeft);
    $cave.append($sideRocksRight);
    $cave.append($hall);
    $cave.append($exitRocksLeft);
    $cave.append($exitRocksTop);
    $cave.append($exit);

    if (typeof TIMELINE_ENTRIES !== "undefined") {
      // Create desktop timeline signs (absolute positioned)
      TIMELINE_ENTRIES.forEach(function (entry, idx) {
        var side = entry.side === "right" ? "right" : "left";
        var $sign = $('<div class="cave-sign ' + side + '"></div>');
        var year = entry.year || "";
        var title = entry.title || "";
        var desc = entry.description || "";
        var img = entry.image || "";
        
        if (img) {
          var $img = $('<div class="img"></div>');
          $img.css("background-image", "url(" + img + ")");
          $sign.append($img);
        }
        
        $sign.append("<div class='year'>" + year + "</div>");
        $sign.append("<div class='title'>" + title + "</div>");
        $sign.append("<div class='desc'>" + desc + "</div>");
        $sign.css("top", (entry.y || 0) + "px");
        $cave.append($sign);
        
        // Add interactive sign aligned with each timeline entry
        // Position on left or right side of bridge based on entry side
        var $interactiveSign = $('<div class="cave-timeline-sign-interact"></div>');
        // Cave hall is at left: 940px, width: 120px (center at 1000px)
        // Position signs closer to center, on the appropriate side
        var signX;
        if (side === "left") {
          signX = 940; // Left side of bridge
        } else {
          signX = 1028; // Right side of bridge, closer to center
        }
        // Align sign vertically with the timeline entry (same Y position, adjusted 4px up)
        var signY = (entry.y || 0) - 10;
        $interactiveSign.css({
          "left": signX + "px",
          "top": signY + "px",
          "z-index": "9998" // Default z-index (behind player's 9999)
        });
        $interactiveSign.attr("data-timeline-index", idx);
        $interactiveSign.attr("data-sign-y", signY); // Store Y position for z-index calculation
        
        $cave.append($interactiveSign);
      });
      
      // Create timeline modal
      var $timelineModal = $('<div class="timeline-modal"></div>');
      var $timelineModalOverlay = $('<div class="timeline-modal-overlay"></div>');
      var $timelineModalContent = $('<div class="timeline-modal-content"></div>');
      var $timelineModalClose = $('<a class="timeline-modal-close" onClick="closeTimelineModal()"><i class="nes-icon close"></i></a>');
      
      $timelineModalContent.append($timelineModalClose);
      $timelineModal.append($timelineModalOverlay);
      $timelineModal.append($timelineModalContent);
      $('body').append($timelineModal);
      
      // Add click handlers for interactive signs using event delegation
      // Use native addEventListener to avoid jQuery dependency issues
      document.addEventListener('click', function(e) {
        var target = e.target;
        var signElement = null;
        
        // Check if clicked element or its parent is the interactive sign
        while (target && target !== document.body) {
          if (target.classList && target.classList.contains('cave-timeline-sign-interact')) {
            signElement = target;
            break;
          }
          target = target.parentElement;
        }
        
        if (signElement) {
          var index = parseInt(signElement.getAttribute("data-timeline-index"));
          if (!isNaN(index) && typeof TIMELINE_ENTRIES !== "undefined" && TIMELINE_ENTRIES[index]) {
            if (typeof openTimelineModal === "function") {
              openTimelineModal(TIMELINE_ENTRIES[index]);
            }
          }
        }
      });
      
      // Close modal on overlay click
      var overlayElement = $timelineModalOverlay[0] || $timelineModalOverlay;
      if (overlayElement && overlayElement.addEventListener) {
        overlayElement.addEventListener('click', function() {
          if (typeof closeTimelineModal === "function") {
            closeTimelineModal();
          }
        });
      }
    }
  }

  global.GameWorld = GameWorld;
})(window);


