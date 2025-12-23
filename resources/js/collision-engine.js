// Collision detection engine that uses COLLISION_CONFIG
// This replaces the hardcoded collision logic with a data-driven approach

var CollisionEngine = (function() {
  // Debug overlay state
  var debugEnabled = false;
  var debugElements = [];
  var dylanDebugEl = null;

  function clearDebugOverlays() {
    for (var i = 0; i < debugElements.length; i++) {
      if (debugElements[i] && debugElements[i].parentNode) {
        debugElements[i].parentNode.removeChild(debugElements[i]);
      }
    }
    debugElements = [];
  }

  function removeDylanDebugBox() {
    if (dylanDebugEl && dylanDebugEl.parentNode) {
      dylanDebugEl.parentNode.removeChild(dylanDebugEl);
    }
    dylanDebugEl = null;
  }

  function addDebugRect(parentSelector, x, y, width, height, kind, description) {
    var $parent = $(parentSelector);
    if (!$parent.length) return;

    var $el = $("<div class='collision-debug collision-debug-" + kind + "'></div>");
    $el.css({
      position: "absolute",
      left: x + "px",
      top: y + "px",
      width: width + "px",
      height: height + "px"
    });
    if (description) {
      $el.attr("title", description);
    }
    $parent.append($el);
    debugElements.push($el[0]);
  }

  function updateDylanDebugBox(dTop, dLeft) {
    if (!debugEnabled) return;

    var $map = $("#map");
    if (!$map.length) return;

    // Approximate Dylan's collision hitbox (tweak as needed)
    var boxWidth = 24;
    var boxHeight = 40;

    // Slightly inset from sprite edges so it feels like body/feet, not hair
    var boxLeft = dLeft + 4;
    var boxTop = dTop + 24;

    if (!dylanDebugEl || !dylanDebugEl.parentNode) {
      var $el = $(
        "<div class='collision-debug collision-debug-dylan'></div>"
      );
      $el.css({
        position: "absolute",
        width: boxWidth + "px",
        height: boxHeight + "px"
      });
      $map.append($el);
      dylanDebugEl = $el[0];
    }

    dylanDebugEl.style.left = boxLeft + "px";
    dylanDebugEl.style.top = boxTop + "px";
  }

  function renderDebugOverlays() {
    clearDebugOverlays();
    if (!debugEnabled || typeof COLLISION_CONFIG === "undefined") return;

    // Main map collisions rendered into #map
    if (COLLISION_CONFIG.mainMap) {
      var main = COLLISION_CONFIG.mainMap;
      // Vertical rules (top fences, etc.) become horizontal bars
      if (main.vertical && main.vertical.length) {
        for (var i = 0; i < main.vertical.length; i++) {
          var v = main.vertical[i];

          // Prefer explicit debug rectangles if provided
          if (v.debugRect) {
            var dr = v.debugRect;
            addDebugRect(
              dr.parent || "#map",
              dr.x,
              dr.y,
              dr.width,
              dr.height,
              "vertical",
              v.description || ""
            );
            continue;
          }

          if (!v.position || !v.position.top) continue;
          // Derive the actual boundary line from exact/min/max
          var top = null;
          if (v.position.top.exact !== undefined) {
            top = v.position.top.exact;
          } else if (typeof v.position.top.max === "number") {
            top = v.position.top.max;
          } else if (typeof v.position.top.min === "number") {
            top = v.position.top.min;
          }
          if (top === null) continue;

          // Determine left range
          var ranges = [];
          if (v.position.left) {
            if (typeof v.position.left.min === "number" && typeof v.position.left.max === "number") {
              ranges.push({ min: v.position.left.min, max: v.position.left.max });
            }
            if (v.position.left.or && v.position.left.or.length) {
              for (var j = 0; j < v.position.left.or.length; j++) {
                var or = v.position.left.or[j];
                if (typeof or.min === "number" && typeof or.max === "number") {
                  ranges.push({ min: or.min, max: or.max });
                }
              }
            }
          }

          if (!ranges.length) {
            // Fallback: draw a full-width line across typical map width
            ranges.push({ min: 0, max: 2000 });
          }

          for (var r = 0; r < ranges.length; r++) {
            var minL = ranges[r].min;
            var maxL = ranges[r].max;
            addDebugRect(
              "#map",
              minL,
              top - 2,
              Math.max(2, maxL - minL),
              4,
              "vertical",
              v.description || ""
            );
          }
        }
      }

      // Horizontal rules (left/right walls) become vertical bars
      if (main.horizontal && main.horizontal.length) {
        for (var k = 0; k < main.horizontal.length; k++) {
          var h = main.horizontal[k];

          // Prefer explicit debug rectangles if provided
          if (h.debugRect) {
            var hdr = h.debugRect;
            addDebugRect(
              hdr.parent || "#map",
              hdr.x,
              hdr.y,
              hdr.width,
              hdr.height,
              "horizontal",
              h.description || ""
            );
            continue;
          }

          if (!h.position || !h.position.left) continue;
          // Derive the actual boundary line from exact/min/max
          var left = null;
          if (h.position.left.exact !== undefined) {
            left = h.position.left.exact;
          } else if (typeof h.position.left.max === "number") {
            left = h.position.left.max;
          } else if (typeof h.position.left.min === "number") {
            left = h.position.left.min;
          }
          if (left === null) continue;

          var tRanges = [];
          if (h.position.top) {
            if (typeof h.position.top.min === "number" && typeof h.position.top.max === "number") {
              tRanges.push({ min: h.position.top.min, max: h.position.top.max });
            }
            if (h.position.top.or && h.position.top.or.length) {
              for (var m = 0; m < h.position.top.or.length; m++) {
                var tor = h.position.top.or[m];
                if (typeof tor.min === "number" && typeof tor.max === "number") {
                  tRanges.push({ min: tor.min, max: tor.max });
                }
              }
            }
          }

          if (!tRanges.length) {
            tRanges.push({ min: 0, max: 2000 });
          }

          for (var tr = 0; tr < tRanges.length; tr++) {
            var minT = tRanges[tr].min;
            var maxT = tRanges[tr].max;
            addDebugRect(
              "#map",
              left - 2,
              minT,
              4,
              Math.max(2, maxT - minT),
              "horizontal",
              h.description || ""
            );
          }
        }
      }
    }

    // Tent 1 interior collisions rendered into #tent1 if present
    if (COLLISION_CONFIG.tent1) {
      var tent = COLLISION_CONFIG.tent1;
      if (tent.vertical && tent.vertical.length) {
        for (var tv = 0; tv < tent.vertical.length; tv++) {
          var vt = tent.vertical[tv];

          // Prefer explicit debug rectangles if provided
          if (vt.debugRect) {
            var tdr = vt.debugRect;
            addDebugRect(
              tdr.parent || "#tent1",
              tdr.x,
              tdr.y,
              tdr.width,
              tdr.height,
              "vertical",
              vt.description || ""
            );
            continue;
          }

          if (!vt.position || !vt.position.top) continue;
          var tTop = null;
          if (vt.position.top.exact !== undefined) {
            tTop = vt.position.top.exact;
          } else if (typeof vt.position.top.max === "number") {
            tTop = vt.position.top.max;
          } else if (typeof vt.position.top.min === "number") {
            tTop = vt.position.top.min;
          }
          if (tTop === null) continue;
          var tRanges2 = [];
          if (vt.position.left) {
            if (typeof vt.position.left.min === "number" && typeof vt.position.left.max === "number") {
              tRanges2.push({ min: vt.position.left.min, max: vt.position.left.max });
            }
            if (vt.position.left.or && vt.position.left.or.length) {
              for (var to = 0; to < vt.position.left.or.length; to++) {
                var lOr = vt.position.left.or[to];
                if (typeof lOr.min === "number" && typeof lOr.max === "number") {
                  tRanges2.push({ min: lOr.min, max: lOr.max });
                }
              }
            }
          }
          if (!tRanges2.length) {
            tRanges2.push({ min: 0, max: 400 });
          }

          for (var rr = 0; rr < tRanges2.length; rr++) {
            var tMinL = tRanges2[rr].min;
            var tMaxL = tRanges2[rr].max;
            addDebugRect(
              "#tent1",
              tMinL,
              tTop - 2,
              Math.max(2, tMaxL - tMinL),
              4,
              "vertical",
              vt.description || ""
            );
          }
        }
      }

      if (tent.horizontal && tent.horizontal.length) {
        for (var th = 0; th < tent.horizontal.length; th++) {
          var ht = tent.horizontal[th];

          // Prefer explicit debug rectangles if provided
          if (ht.debugRect) {
            var htdr = ht.debugRect;
            addDebugRect(
              htdr.parent || "#tent1",
              htdr.x,
              htdr.y,
              htdr.width,
              htdr.height,
              "horizontal",
              ht.description || ""
            );
            continue;
          }

          if (!ht.position || !ht.position.left) continue;
          var tLeft = null;
          if (ht.position.left.exact !== undefined) {
            tLeft = ht.position.left.exact;
          } else if (typeof ht.position.left.max === "number") {
            tLeft = ht.position.left.max;
          } else if (typeof ht.position.left.min === "number") {
            tLeft = ht.position.left.min;
          }
          if (tLeft === null) continue;
          var tTopRanges = [];
          if (ht.position.top) {
            if (typeof ht.position.top.min === "number" && typeof ht.position.top.max === "number") {
              tTopRanges.push({ min: ht.position.top.min, max: ht.position.top.max });
            }
            if (ht.position.top.or && ht.position.top.or.length) {
              for (var ttor = 0; ttor < ht.position.top.or.length; ttor++) {
                var tt = ht.position.top.or[ttor];
                if (typeof tt.min === "number" && typeof tt.max === "number") {
                  tTopRanges.push({ min: tt.min, max: tt.max });
                }
              }
            }
          }
          if (!tTopRanges.length) {
            tTopRanges.push({ min: -64, max: 256 });
          }

          for (var tr2 = 0; tr2 < tTopRanges.length; tr2++) {
            var tMinT = tTopRanges[tr2].min;
            var tMaxT = tTopRanges[tr2].max;
            addDebugRect(
              "#tent1",
              tLeft - 2,
              tMinT,
              4,
              Math.max(2, tMaxT - tMinT),
              "horizontal",
              ht.description || ""
            );
          }
        }
      }
    }
  }

  function setDebugEnabled(enabled) {
    debugEnabled = !!enabled;
    if (debugEnabled) {
      renderDebugOverlays();
    } else {
      clearDebugOverlays();
      removeDylanDebugBox();
    }
  }

  // Helper to check if a position matches a condition
  function checkPosition(position, dylanTop, dylanLeft) {
    if (!position) return true;
    
    var top = parseInt(dylanTop, 10);
    var left = parseInt(dylanLeft, 10);
    
    if (position.top) {
      if (position.top.exact !== undefined && top !== position.top.exact) return false;
      if (position.top.min !== undefined && top < position.top.min) return false;
      if (position.top.max !== undefined && top > position.top.max) return false;
    }
    
    if (position.left) {
      if (position.left.exact !== undefined && left !== position.left.exact) return false;
      if (position.left.min !== undefined && left < position.left.min) return false;
      if (position.left.max !== undefined && left > position.left.max) return false;
      
      // Handle "or" conditions for left
      if (position.left.or) {
        var matches = false;
        for (var i = 0; i < position.left.or.length; i++) {
          var orCond = position.left.or[i];
          var orMatches = true;
          if (orCond.exact !== undefined && left !== orCond.exact) orMatches = false;
          if (orCond.min !== undefined && left < orCond.min) orMatches = false;
          if (orCond.max !== undefined && left > orCond.max) orMatches = false;
          if (orMatches) {
            matches = true;
            break;
          }
        }
        if (!matches) return false;
      }
    }
    
    // Handle "or" conditions for top
    if (position.top && position.top.or) {
      var matches = false;
      for (var i = 0; i < position.top.or.length; i++) {
        var orCond = position.top.or[i];
        var orMatches = true;
        if (orCond.exact !== undefined && top !== orCond.exact) orMatches = false;
        if (orCond.min !== undefined && top < orCond.min) orMatches = false;
        if (orCond.max !== undefined && top > orCond.max) orMatches = false;
        if (orMatches) {
          matches = true;
          break;
        }
      }
      if (!matches) return false;
    }
    
    return true;
  }
  
  // Process z-index updates
  function updateZIndex(zIndexRule, dylanTop, dylanLeft) {
    if (!zIndexRule || !zIndexRule.selector) return;
    
    var top = parseInt(dylanTop, 10);
    var left = parseInt(dylanLeft, 10);
    var newZIndex = null;
    
    if (zIndexRule.whenAbove && checkPosition(zIndexRule.whenAbove, dylanTop, dylanLeft)) {
      newZIndex = zIndexRule.whenAbove.zIndex;
    } else if (zIndexRule.whenBelow && checkPosition(zIndexRule.whenBelow, dylanTop, dylanLeft)) {
      newZIndex = zIndexRule.whenBelow.zIndex;
    } else if (zIndexRule.default) {
      newZIndex = zIndexRule.default.zIndex;
    }
    
    if (newZIndex !== null) {
      $(zIndexRule.selector).css("z-index", newZIndex);
    }
  }
  
  // Main collision check function
  function checkCollisions(config, elem, keyCode1, keyCode2, oldValue) {
    if (!config || typeof COLLISION_CONFIG === "undefined") {
      return null; // No collision, allow movement
    }
    
    var dylanTop = $("#dylan").css("top");
    var dylanLeft = $("#dylan").css("left");

    // Update Dylan's debug hitbox if enabled
    if (debugEnabled && dylanTop != null && dylanLeft != null) {
      var dTopNum = parseInt(dylanTop, 10);
      var dLeftNum = parseInt(dylanLeft, 10);
      if (!isNaN(dTopNum) && !isNaN(dLeftNum)) {
        updateDylanDebugBox(dTopNum, dLeftNum);
      }
    }
    var ks = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keysPressed : (typeof keysPressed !== "undefined" ? keysPressed : {});
    
    // Check global blocks
    if (config.globalBlocks) {
      for (var i = 0; i < config.globalBlocks.length; i++) {
        var block = config.globalBlocks[i];
        if (block.condition && block.condition()) {
          return parseInt(oldValue, 10);
        }
      }
    }
    
    // Set distance per iteration based on element type
    if (config.distancePerIteration && config.distancePerIteration[elem] !== undefined) {
      var dist = config.distancePerIteration[elem];
      if (typeof WORLD !== "undefined" && WORLD.movement) {
        WORLD.movement.distancePerIteration = dist;
      } else if (typeof distancePerIteration !== "undefined") {
        distancePerIteration = dist;
      }
    }
    
    // Check viewport boundaries
    if (config.viewport) {
      for (var i = 0; i < config.viewport.length; i++) {
        var viewport = config.viewport[i];
        if (viewport.element === elem && checkPosition(viewport.condition, dylanTop, dylanLeft)) {
          return parseInt(oldValue, 10);
        }
      }
    }
    
    // Check vertical collisions (for dylan-top, body-top, dylan-bottom)
    if ((elem === "dylan-top" || elem === "body-top" || elem === "dylan-bottom") && config.vertical) {
      for (var i = 0; i < config.vertical.length; i++) {
        var collision = config.vertical[i];
        
        // Skip if condition is not met
        if (collision.condition && !collision.condition()) {
          continue;
        }
        
        // Handle z-index updates
        if (collision.zIndex) {
          updateZIndex(collision.zIndex, dylanTop, dylanLeft);
          continue;
        }
        
        // Handle distance modifiers (like stairs)
        if (collision.distanceModifier) {
          if (collision.distanceModifier[elem] !== undefined && checkPosition(collision.position, dylanTop, dylanLeft)) {
            var modDist = collision.distanceModifier[elem];
            if (typeof WORLD !== "undefined" && WORLD.movement) {
              WORLD.movement.distancePerIteration = modDist;
            } else if (typeof distancePerIteration !== "undefined") {
              distancePerIteration = modDist;
            }
          }
          continue;
        }
        
        // Check collision boundaries
        if (collision.position && collision.blockKey) {
          if (checkPosition(collision.position, dylanTop, dylanLeft)) {
            var blockKey = collision.blockKey === "keyCode1" ? keyCode1 : keyCode2;
            if (ks[blockKey]) {
              // Execute action if provided
              if (collision.action && typeof collision.action === "function") {
                collision.action();
              }
              return parseInt(oldValue, 10);
            }
          }
        }
      }
    }
    
    // Check horizontal collisions (for dylan-left, body-left, dylan-right)
    if ((elem === "dylan-left" || elem === "body-left" || elem === "dylan-right") && config.horizontal) {
      for (var i = 0; i < config.horizontal.length; i++) {
        var collision = config.horizontal[i];
        
        // Skip if condition is not met
        if (collision.condition && !collision.condition()) {
          continue;
        }
        
        // Handle z-index updates
        if (collision.zIndex) {
          updateZIndex(collision.zIndex, dylanTop, dylanLeft);
          continue;
        }
        
        // Check collision boundaries
        if (collision.position && collision.blockKey) {
          if (checkPosition(collision.position, dylanTop, dylanLeft)) {
            var blockKey = collision.blockKey === "keyCode1" ? keyCode1 : keyCode2;
            if (ks[blockKey]) {
              // Execute action if provided
              if (collision.action && typeof collision.action === "function") {
                collision.action();
              }
              return parseInt(oldValue, 10);
            }
          }
        }
      }
    }
    
    // No collision detected - calculate movement
    var dist = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.distancePerIteration : (typeof distancePerIteration !== "undefined" ? distancePerIteration : 4);
    var ks = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keysPressed : (typeof keysPressed !== "undefined" ? keysPressed : {});
    var newValue = parseInt(oldValue, 10)
      - (ks[keyCode1] ? dist : 0)
      + (ks[keyCode2] ? dist : 0);
    
    return newValue;
  }
  
  // Public API
  return {
    checkCollisions: checkCollisions,
    setDebugEnabled: setDebugEnabled,
    renderDebugOverlays: renderDebugOverlays
  };
})();

