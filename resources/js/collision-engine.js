// Collision detection engine that uses COLLISION_CONFIG
// This replaces the hardcoded collision logic with a data-driven approach

var CollisionEngine = (function() {
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
    checkCollisions: checkCollisions
  };
})();

