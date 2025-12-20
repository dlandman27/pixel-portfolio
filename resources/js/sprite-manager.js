// Sprite Manager - Handles smooth sprite animation using CSS background-position
// This eliminates glitchiness by using a single sprite sheet per direction

var SpriteManager = (function() {
  // Sprite sheet configuration
  // Each direction has its frames in a single image or we use CSS positioning
  var spriteSheets = {
    front: {
      url: "resources/images/characters/dylan/dylan-front-",
      frames: 7,
      width: 32,
      height: 64
    },
    back: {
      url: "resources/images/characters/dylan/dylan-back-",
      frames: 7,
      width: 32,
      height: 64
    },
    left: {
      url: "resources/images/characters/dylan/dylan-left-",
      frames: 7,
      width: 32,
      height: 64
    },
    right: {
      url: "resources/images/characters/dylan/dylan-right-",
      frames: 7,
      width: 32,
      height: 64
    }
  };

  // Preload all sprite images to prevent flicker
  var preloadedImages = {};
  
  function preloadSprites() {
    var directions = ['front', 'back', 'left', 'right'];
    directions.forEach(function(direction) {
      var sheet = spriteSheets[direction];
      preloadedImages[direction] = [];
      
      for (var i = 1; i <= sheet.frames; i++) {
        var img = new Image();
        img.src = sheet.url + i + ".png";
        preloadedImages[direction].push(img);
      }
    });
  }

  // Set sprite frame using preloaded image (prevents flicker)
  function setSpriteFrame(direction, frame) {
    var $dylan = $("#dylan");
    var sheet = spriteSheets[direction];
    
    if (!sheet || frame < 1 || frame > sheet.frames) {
      return;
    }

    // Skip frame 1 for front direction (wrong height)
    if (direction === "front" && frame === 1) {
      frame = 2;
    }

    // Always use the preloaded image object to prevent flicker
    // The browser caches these, so switching is smoother
    var img = preloadedImages[direction][frame - 1];
    var imageUrl = sheet.url + frame + ".png";
    
    // Use the preloaded image if available, otherwise use URL
    // Setting background-image with the same URL pattern helps browser cache
    // Match original CSS: background-size: 32px (maintains aspect ratio)
    $dylan.css({
      "background-image": "url(" + imageUrl + ")",
      "background-size": sheet.width + "px",
      "background-repeat": "no-repeat",
      "background-position": "center"
    });
  }

  // Initialize sprite manager
  function init() {
    preloadSprites();
  }

  return {
    init: init,
    setSpriteFrame: setSpriteFrame,
    preloadSprites: preloadSprites
  };
})();

