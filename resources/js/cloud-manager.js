// Cloud Manager - Randomly spawns and animates clouds
// Creates clouds at random intervals with varying sizes and speeds
// Only active on mainMap scene

var CloudManager = (function () {
  var cloudContainer = null;
  var spawnTimeout = null; // Changed from interval to timeout for recursive scheduling
  var activeClouds = [];
  var maxClouds = 5; // Maximum number of clouds on screen at once
  var isActive = false; // Track if clouds should be active
  var currentScene = null; // Track current scene
  var mapPositionWatcher = null;
  var lastMapMarginLeft = 0;
  var lastMapMarginTop = 0;

  // Cloud size configurations
  var cloudSizes = [
    { class: 'cloud-small', width: 50, height: 18, speed: 35 },
    { class: 'cloud-medium', width: 70, height: 25, speed: 50 },
    { class: 'cloud-large', width: 100, height: 40, speed: 70 }
  ];

  /**
   * Checks if we're currently in the main map scene
   */
  function isInMainMap() {
    // Try to get scene from GameWorld if available
    if (typeof window !== "undefined" && window.playerController && 
        window.playerController.gameWorld) {
      return window.playerController.gameWorld.sceneName === "mainMap";
    }
    // Fallback: check if tent/cave are visible (if they're hidden, we're likely in main map)
    var tentVisible = $("#tent1").is(":visible");
    var caveVisible = $("#cave").is(":visible");
    return !tentVisible && !caveVisible;
  }

  /**
   * Creates a single cloud element
   */
  function createCloud() {
    if (!cloudContainer) return;
    
    // Only create clouds if we're in main map
    if (!isInMainMap()) return;

    // Don't spawn if we have too many clouds
    if (activeClouds.length >= maxClouds) return;

    // Randomly select cloud size
    var cloudConfig = cloudSizes[Math.floor(Math.random() * cloudSizes.length)];
    
    // Get current map position to sync cloud movement
    var mapMarginLeft = parseInt($("#map").css("margin-left")) || 0;
    var mapMarginTop = parseInt($("#map").css("margin-top")) || 0;
    
    // Clouds spawn relative to viewport, but will move with map
    // Spawn just off the left edge of the viewport
    var baseLeft = -100; // Start slightly off-screen left
    // Random vertical position in viewport (0-80% to avoid bottom UI)
    var baseTop = Math.random() * (window.innerHeight * 0.8);
    
    // Calculate initial position accounting for current map position
    var left = baseLeft + mapMarginLeft;
    var top = baseTop + mapMarginTop;
    
    // Random animation duration (speed varies)
    var duration = cloudConfig.speed + (Math.random() * 20 - 10); // ±10s variation
    
    // Create cloud element - store base position for map movement tracking
    var cloud = $('<div>')
      .addClass('cloud')
      .addClass(cloudConfig.class)
      .data('base-left', baseLeft)
      .data('base-top', baseTop)
      .css({
        top: top + 'px',
        left: left + 'px',
        animation: 'floatCloud ' + duration + 's linear forwards'
      });

    // Add to container
    cloudContainer.append(cloud);
    activeClouds.push(cloud);

    // Remove cloud when animation completes
    setTimeout(function() {
      cloud.remove();
      var index = activeClouds.indexOf(cloud);
      if (index > -1) {
        activeClouds.splice(index, 1);
      }
    }, duration * 1000);
  }

  /**
   * Randomly spawns a cloud after a random delay
   */
  function scheduleNextCloud() {
    // Clear any existing timeout
    if (spawnTimeout) {
      clearTimeout(spawnTimeout);
      spawnTimeout = null;
    }
    
    // Only schedule if we're active and in main map
    if (!isActive || !isInMainMap()) {
      return;
    }
    
    // Random delay between 8-15 seconds
    var delay = 8000 + Math.random() * 7000;
    
    spawnTimeout = setTimeout(function() {
      if (isActive && isInMainMap()) {
        createCloud();
        scheduleNextCloud(); // Schedule the next one
      }
    }, delay);
  }

  /**
   * Updates cloud positions when map moves
   * Clouds move with the map to maintain their position relative to the world
   */
  function updateCloudPositions() {
    // Only update if we're active and in main map
    if (!isActive || !isInMainMap()) return;
    
    if (!cloudContainer || activeClouds.length === 0) return;
    
    var mapMarginLeft = parseInt($("#map").css("margin-left")) || 0;
    var mapMarginTop = parseInt($("#map").css("margin-top")) || 0;
    
    // Only update if map position changed
    if (mapMarginLeft === lastMapMarginLeft && mapMarginTop === lastMapMarginTop) {
      return;
    }
    
    // Calculate delta movement
    var deltaLeft = mapMarginLeft - lastMapMarginLeft;
    var deltaTop = mapMarginTop - lastMapMarginTop;
    
    lastMapMarginLeft = mapMarginLeft;
    lastMapMarginTop = mapMarginTop;
    
    // Update each cloud's position based on map movement
    // The CSS animation's translateX handles horizontal movement, but we adjust base position
    activeClouds.forEach(function(cloud) {
      var baseLeft = cloud.data('base-left') || 0;
      var baseTop = cloud.data('base-top') || 0;
      
      // Update position: base position + current map margin
      var newLeft = baseLeft + mapMarginLeft;
      var newTop = baseTop + mapMarginTop;
      
      cloud.css({
        left: newLeft + 'px',
        top: newTop + 'px'
      });
    });
  }

  /**
   * Initializes the cloud system (only for main map)
   */
  function init() {
    cloudContainer = $('#clouds-container');
    
    if (cloudContainer.length === 0) {
      console.warn('Cloud container not found');
      return;
    }

    // Only initialize if we're in main map
    if (!isInMainMap()) {
      return;
    }

    isActive = true;
    currentScene = "mainMap";

    // Get initial map position
    lastMapMarginLeft = parseInt($("#map").css("margin-left")) || 0;
    lastMapMarginTop = parseInt($("#map").css("margin-top")) || 0;

    // Watch for map position changes to update cloud positions
    if (mapPositionWatcher) {
      clearInterval(mapPositionWatcher);
    }
    mapPositionWatcher = setInterval(function() {
      updateCloudPositions();
    }, 50); // Check every 50ms (same as movement interval)

    // Create initial clouds (2-3 clouds to start)
    var initialCount = 2 + Math.floor(Math.random() * 2); // 2-3 clouds
    for (var i = 0; i < initialCount; i++) {
      setTimeout(function() {
        if (isActive && isInMainMap()) {
          createCloud();
        }
      }, 2000 + (i * 3000)); // Stagger initial clouds by 3 seconds
    }

    // Start random spawning
    scheduleNextCloud();
  }
  
  /**
   * Handles scene changes - starts/stops clouds based on scene
   */
  function onSceneChange(sceneName) {
    currentScene = sceneName;
    
    if (sceneName === "mainMap") {
      // Start clouds if not already active
      if (!isActive) {
        init();
      }
    } else {
      // Stop clouds when leaving main map
      if (isActive) {
        stop();
      }
    }
  }

  /**
   * Stops cloud spawning (cleanup)
   */
  function stop() {
    isActive = false;
    
    if (spawnTimeout) {
      clearTimeout(spawnTimeout);
      spawnTimeout = null;
    }
    if (mapPositionWatcher) {
      clearInterval(mapPositionWatcher);
      mapPositionWatcher = null;
    }
    // Remove all active clouds
    activeClouds.forEach(function(cloud) {
      cloud.remove();
    });
    activeClouds = [];
  }

  return {
    init: init,
    stop: stop,
    onSceneChange: onSceneChange
  };
})();

// Initialize clouds when DOM is ready and integrate with GameWorld
$(function() {
  // Wait for game to initialize, then check if we should start clouds
  setTimeout(function() {
    // Check if we're in main map and start clouds
    if (CloudManager && typeof CloudManager.onSceneChange === "function") {
      // Try to get current scene from GameWorld
      var sceneName = "mainMap"; // Default
      if (typeof window !== "undefined" && window.playerController && 
          window.playerController.gameWorld) {
        sceneName = window.playerController.gameWorld.sceneName || "mainMap";
      }
      CloudManager.onSceneChange(sceneName);
    } else {
      // Fallback: just init if function not available
      CloudManager.init();
    }
  }, 3000); // Start clouds 3 seconds after page load
});

