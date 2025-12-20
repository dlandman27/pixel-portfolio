// Cloud Manager - Randomly spawns and animates clouds
// Creates clouds at random intervals with varying sizes and speeds

var CloudManager = (function () {
  var cloudContainer = null;
  var spawnInterval = null;
  var activeClouds = [];
  var maxClouds = 5; // Maximum number of clouds on screen at once
  var mapPositionWatcher = null;
  var lastMapLeft = 0;
  var lastMapTop = 0;

  // Cloud size configurations
  var cloudSizes = [
    { class: 'cloud-small', width: 50, height: 18, speed: 35 },
    { class: 'cloud-medium', width: 70, height: 25, speed: 50 },
    { class: 'cloud-large', width: 100, height: 40, speed: 70 }
  ];

  /**
   * Creates a single cloud element
   */
  function createCloud() {
    if (!cloudContainer) return;

    // Don't spawn if we have too many clouds
    if (activeClouds.length >= maxClouds) return;

    // Randomly select cloud size
    var cloudConfig = cloudSizes[Math.floor(Math.random() * cloudSizes.length)];
    
    // Get current map position to calculate cloud position
    // Map uses both left/top (from centerMap) and marginLeft/marginTop (from movement)
    var mapLeft = parseInt($("#map").css("left")) || 0;
    var mapTop = parseInt($("#map").css("top")) || 0;
    var mapMarginLeft = parseInt($("#map").css("margin-left")) || 0;
    var mapMarginTop = parseInt($("#map").css("margin-top")) || 0;
    
    // Calculate viewport-relative position
    // Clouds should spawn just off the left edge of the viewport
    var viewportLeft = -100; // Start slightly off-screen left
    // Random vertical position in viewport (0-80% to avoid bottom UI)
    var viewportTop = Math.random() * (window.innerHeight * 0.8);
    
    // Calculate absolute position
    // The map's left/top is the center point, so we need to account for that
    var left = viewportLeft;
    var top = viewportTop;
    
    // Random animation duration (speed varies)
    var duration = cloudConfig.speed + (Math.random() * 20 - 10); // ±10s variation
    
    // Create cloud element
    // Store viewport-relative position (we'll update based on map movement)
    var cloud = $('<div>')
      .addClass('cloud')
      .addClass(cloudConfig.class)
      .data('viewport-left', left)
      .data('viewport-top', top)
      .data('map-margin-left', mapMarginLeft)
      .data('map-margin-top', mapMarginTop)
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
    // Random delay between 8-15 seconds (more frequent)
    var delay = 8000 + Math.random() * 7000;
    
    setTimeout(function() {
      createCloud();
      scheduleNextCloud(); // Schedule the next one
    }, delay);
  }

  /**
   * Updates cloud positions when map moves
   */
  function updateCloudPositions() {
    if (!cloudContainer || activeClouds.length === 0) return;
    
    var mapMarginLeft = parseInt($("#map").css("margin-left")) || 0;
    var mapMarginTop = parseInt($("#map").css("margin-top")) || 0;
    
    // Only update if map position changed
    if (mapMarginLeft === lastMapLeft && mapMarginTop === lastMapTop) {
      return;
    }
    
    var deltaLeft = mapMarginLeft - lastMapLeft;
    var deltaTop = mapMarginTop - lastMapTop;
    
    lastMapLeft = mapMarginLeft;
    lastMapTop = mapMarginTop;
    
    // Update each cloud's position based on map movement
    // The animation's translateX will work on top of this base position
    activeClouds.forEach(function(cloud) {
      var viewportLeft = cloud.data('viewport-left') || 0;
      var viewportTop = cloud.data('viewport-top') || 0;
      
      // Update stored map margins
      var storedMarginLeft = cloud.data('map-margin-left') || 0;
      var storedMarginTop = cloud.data('map-margin-top') || 0;
      
      // Calculate new position: viewport position + map margin delta
      var newLeft = viewportLeft + mapMarginLeft;
      var newTop = viewportTop + mapMarginTop;
      
      cloud.css({
        left: newLeft + 'px',
        top: newTop + 'px'
      });
      
      // Update stored margins
      cloud.data('map-margin-left', mapMarginLeft);
      cloud.data('map-margin-top', mapMarginTop);
    });
  }

  /**
   * Initializes the cloud system
   */
  function init() {
    cloudContainer = $('#clouds-container');
    
    if (cloudContainer.length === 0) {
      console.warn('Cloud container not found');
      return;
    }

    // Get initial map position (use margins for movement tracking)
    lastMapLeft = parseInt($("#map").css("margin-left")) || 0;
    lastMapTop = parseInt($("#map").css("margin-top")) || 0;

    // Watch for map position changes
    mapPositionWatcher = setInterval(function() {
      updateCloudPositions();
    }, 50); // Check every 50ms (same as movement interval)

    // Create initial clouds (2-3 clouds to start)
    var initialCount = 2 + Math.floor(Math.random() * 2); // 2-3 clouds
    for (var i = 0; i < initialCount; i++) {
      setTimeout(function() {
        createCloud();
      }, 2000 + (i * 3000)); // Stagger initial clouds by 3 seconds
    }

    // Start random spawning
    scheduleNextCloud();
  }

  /**
   * Stops cloud spawning (cleanup)
   */
  function stop() {
    if (spawnInterval) {
      clearInterval(spawnInterval);
      spawnInterval = null;
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
    stop: stop
  };
})();

// Initialize clouds when DOM is ready
$(function() {
  // Wait a bit after page load to start clouds
  setTimeout(function() {
    CloudManager.init();
  }, 3000); // Start clouds 3 seconds after page load
});

