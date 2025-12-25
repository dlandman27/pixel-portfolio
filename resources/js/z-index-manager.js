// z-index-manager.js
// Manages dynamic z-index updates based on player position
// Uses ZINDEX_RULES configuration to determine when to change z-indexes

(function (global) {
  "use strict";

  var debugEnabled = false;
  var currentScene = null;
  var debugOverlays = [];

  /**
   * Check if a position condition matches the player's position
   * @param {Object} condition - Condition object (e.g., { top: { max: 500 }, left: { min: 100 } })
   * @param {number} playerY - Player's Y position
   * @param {number} playerX - Player's X position
   * @returns {boolean} - True if condition matches
   */
  function checkCondition(condition, playerY, playerX) {
    if (!condition) return false;

    // Check top condition
    if (condition.top) {
      if (condition.top.max !== undefined && playerY > condition.top.max) return false;
      if (condition.top.min !== undefined && playerY < condition.top.min) return false;
      if (condition.top.exact !== undefined && playerY !== condition.top.exact) return false;
    }

    // Check left condition
    if (condition.left) {
      if (condition.left.max !== undefined && playerX > condition.left.max) return false;
      if (condition.left.min !== undefined && playerX < condition.left.min) return false;
      if (condition.left.exact !== undefined && playerX !== condition.left.exact) return false;
    }

    return true;
  }

  /**
   * Get the appropriate z-index for a rule based on player position
   * @param {Object} rule - Z-index rule from ZINDEX_RULES
   * @param {number} playerY - Player's Y position
   * @param {number} playerX - Player's X position
   * @returns {number|null} - Z-index to apply, or null if no condition matches
   */
  function getZIndexForRule(rule, playerY, playerX) {
    // Check whenAbove condition
    if (rule.whenAbove && checkCondition(rule.whenAbove, playerY, playerX)) {
      return rule.whenAbove.zIndex;
    }

    // Check whenBelow condition
    if (rule.whenBelow && checkCondition(rule.whenBelow, playerY, playerX)) {
      return rule.whenBelow.zIndex;
    }

    // Use default if no condition matches
    if (rule.default) {
      return rule.default.zIndex;
    }

    return null;
  }

  /**
   * Get the scene element (map, tent1, cave, etc.)
   * @param {string} sceneName - Name of the scene
   * @returns {jQuery} - jQuery object for the scene element
   */
  function getSceneElement(sceneName) {
    if (sceneName === "mainMap") return $("#map");
    if (sceneName === "tent1") return $("#tent1");
    if (sceneName === "cave") return $("#cave");
    return null;
  }

  /**
   * Add a debug rectangle overlay
   * @param {jQuery} $parent - Parent element
   * @param {Object} condition - Condition object
   * @param {string} className - CSS class name
   * @param {string} label - Label text
   */
  function addDebugRect($parent, condition, className, label) {
    if (!condition || !$parent || !$parent.length) return;

    var $rect = $("<div>")
      .addClass("zindex-debug " + className)
      .css({
        position: "absolute",
        "pointer-events": "none"
      });

    // Determine position and size from condition
    var top = condition.top ? (condition.top.max || condition.top.min || condition.top.exact || 0) : 0;
    var left = condition.left ? (condition.left.max || condition.left.min || condition.left.exact || 0) : 0;

    // Set position (adjust based on condition type)
    // Add 32px offset to push all z-index debug overlays down
    var topOffset = 32;
    if (condition.top) {
      if (condition.top.max !== undefined) {
        $rect.css({ top: topOffset + "px", height: (condition.top.max + topOffset) + "px" });
      } else if (condition.top.min !== undefined) {
        $rect.css({ top: (condition.top.min + topOffset) + "px", bottom: 0 });
      } else if (condition.top.exact !== undefined) {
        $rect.css({ top: (condition.top.exact + topOffset) + "px", height: "2px" });
      }
    }

    if (condition.left) {
      if (condition.left.max !== undefined) {
        $rect.css({ left: 0, width: condition.left.max + "px" });
      } else if (condition.left.min !== undefined) {
        $rect.css({ left: condition.left.min + "px", right: 0 });
      } else if (condition.left.exact !== undefined) {
        $rect.css({ left: condition.left.exact + "px", width: "2px" });
      }
    }

    // Add label
    if (label) {
      $rect.append($("<span>").text(label).css({
        position: "absolute",
        top: "-20px",
        left: "0",
        "font-size": "10px",
        color: "yellow",
        "background-color": "rgba(0,0,0,0.7)",
        padding: "2px 4px"
      }));
    }

    $parent.append($rect);
    debugOverlays.push($rect);
  }

  /**
   * Clear all debug overlays
   */
  function clearDebugOverlays() {
    debugOverlays.forEach(function ($overlay) {
      if ($overlay && $overlay.remove) {
        $overlay.remove();
      }
    });
    debugOverlays = [];
  }

  /**
   * Render debug overlays for the current scene
   */
  function renderDebugOverlays() {
    clearDebugOverlays();
    if (!debugEnabled || !currentScene || typeof ZINDEX_RULES === "undefined") return;

    var rules = ZINDEX_RULES[currentScene];
    if (!rules || !Array.isArray(rules)) return;

    var $parent = getSceneElement(currentScene);
    if (!$parent || !$parent.length) return;

    rules.forEach(function (rule) {
      if (rule.whenAbove) {
        addDebugRect(
          $parent,
          rule.whenAbove,
          "zindex-debug-above",
          rule.selector + " (above: " + rule.whenAbove.zIndex + ")"
        );
      }
      if (rule.whenBelow) {
        addDebugRect(
          $parent,
          rule.whenBelow,
          "zindex-debug-below",
          rule.selector + " (below: " + rule.whenBelow.zIndex + ")"
        );
      }
    });
  }

  /**
   * ZIndexManager - Public API
   */
  var ZIndexManager = {
    /**
     * Initialize the z-index manager
     * @param {string} sceneName - Initial scene name
     */
    init: function (sceneName) {
      currentScene = sceneName;
      if (debugEnabled) {
        renderDebugOverlays();
      }
    },

    /**
     * Update z-indexes based on player position
     * @param {number} playerY - Player's Y position
     * @param {number} playerX - Player's X position
     * @param {string} sceneName - Current scene name
     */
    update: function (playerY, playerX, sceneName) {
      if (typeof ZINDEX_RULES === "undefined") {
        console.warn("ZINDEX_RULES is not defined. Did you load zindex.config.js?");
        return;
      }

      // Update current scene if it changed
      if (sceneName && sceneName !== currentScene) {
        currentScene = sceneName;
        if (debugEnabled) {
          renderDebugOverlays();
        }
      }

      var rules = ZINDEX_RULES[sceneName || currentScene];
      if (!rules || !Array.isArray(rules)) return;

      // Check if player is sitting on any log/bench
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

      // Special case: when sitting on any log/bench, ensure player z-index is high
      if (isSittingOnAnyLog) {
        var $dylan = $("#dylan");
        if ($dylan.length) {
          var currentPlayerZIndex = parseInt($dylan.css("z-index"), 10);
          // Set player z-index to 100 to ensure they're above the log/bench
          if (isNaN(currentPlayerZIndex) || currentPlayerZIndex !== 100) {
            $dylan.css("z-index", 100);
          }
        }
      }

      rules.forEach(function (rule) {
        var $elements = $(rule.selector);
        if (!$elements.length) return;

        // Special case: when sitting on top bench, completely skip bench rule
        if (isSittingOnTopBench && rule.selector === ".bench") {
          return; // Skip this rule entirely - will handle below
        }

        // Special case: when sitting on left or right stump, completely skip tree-stump rule
        if ((isSittingOnLeftStump || isSittingOnRightStump) && rule.selector === ".tree-stump") {
          return; // Skip this rule entirely - will handle below
        }

        var zIndex = getZIndexForRule(rule, playerY, playerX);
        if (zIndex !== null) {
          $elements.each(function () {
            var $el = $(this);
            // Skip top bench if sitting on it
            if (isSittingOnTopBench && $el.hasClass("top") && $el.hasClass("bench")) {
              return; // Will be handled below
            }
            // Skip left stump if sitting on it
            if (isSittingOnLeftStump && $el.hasClass("left") && $el.hasClass("tree-stump")) {
              return; // Will be handled below
            }
            // Skip right stump if sitting on it
            if (isSittingOnRightStump && $el.hasClass("right") && $el.hasClass("tree-stump")) {
              return; // Will be handled below
            }
            var currentZIndex = parseInt($el.css("z-index"), 10);
            if (isNaN(currentZIndex) || currentZIndex !== zIndex) {
              $el.css("z-index", zIndex);
            }
          });
        }
      });

      // Special case: when sitting on top bench, force top bench to z-index 10 AFTER all rules
      if (isSittingOnTopBench) {
        var $topBench = $(".bench.top");
        if ($topBench.length) {
          $topBench.each(function () {
            var $el = $(this);
            // Force z-index to 10 so player appears above (player z-index is 100)
            if ($el[0] && $el[0].style) {
              $el[0].style.setProperty("z-index", "10", "important");
            }
            $el.css("z-index", "10");
          });
        }
      }

      // Special case: when sitting on left stump, force left stump to z-index 10 AFTER all rules
      if (isSittingOnLeftStump) {
        var $leftStump = $(".tree-stump.left");
        if ($leftStump.length) {
          $leftStump.each(function () {
            var $el = $(this);
            // Force z-index to 10 so player appears above (player z-index is 100)
            if ($el[0] && $el[0].style) {
              $el[0].style.setProperty("z-index", "10", "important");
            }
            $el.css("z-index", "10");
          });
        }
      }

      // Special case: when sitting on right stump, force right stump to z-index 10 AFTER all rules
      if (isSittingOnRightStump) {
        var $rightStump = $(".tree-stump.right");
        if ($rightStump.length) {
          $rightStump.each(function () {
            var $el = $(this);
            // Force z-index to 10 so player appears above (player z-index is 100)
            if ($el[0] && $el[0].style) {
              $el[0].style.setProperty("z-index", "10", "important");
            }
            $el.css("z-index", "10");
          });
        }
      }
    },

    /**
     * Enable or disable debug overlays
     * @param {boolean} enabled - Whether debug is enabled
     * @param {string} sceneName - Optional scene name to render for
     */
    setDebugEnabled: function (enabled, sceneName) {
      debugEnabled = enabled;
      if (sceneName) {
        currentScene = sceneName;
      }
      if (debugEnabled) {
        renderDebugOverlays();
      } else {
        clearDebugOverlays();
      }
    },

    /**
     * Clear all debug overlays
     */
    clearDebugOverlays: clearDebugOverlays,

    /**
     * Reset the z-index manager (clear state)
     */
    reset: function () {
      clearDebugOverlays();
      currentScene = null;
    }
  };

  // Export to global scope
  global.ZIndexManager = ZIndexManager;
})(window);
