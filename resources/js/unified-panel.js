// Unified Panel System - Single tabbed interface for all game features
// Consolidates: Backpack, Fishbook, Achievements, Games, Settings, etc.

var UnifiedPanel = (function() {
  var currentTab = 'home';
  var isOpen = false;
  
  // Tab definitions with icons and content
  var tabs = {
    home: {
      name: 'Home',
      icon: 'home',
      content: null
    },
    backpack: {
      name: 'Backpack',
      icon: 'backpack',
      content: null // Will be populated dynamically
    },
    achievements: {
      name: 'Achievements',
      icon: 'trophy',
      content: null
    },
    settings: {
      name: 'Settings',
      icon: 'settings',
      content: null
    }
  };
  
  /**
   * Initialize the unified panel
   */
  function init() {
    createPanel();
    setupEventListeners();
    loadTabContent('backpack');
  }
  
  /**
   * Create the panel HTML structure
   */
  function createPanel() {
    // Remove existing panel if it exists
    $('#unified-panel').remove();
    
    var $panel = $('<div id="unified-panel" class="unified-panel"></div>');
    var $overlay = $('<div class="unified-panel-overlay"></div>');
    var $tabsRow = $('<div class="unified-panel-tabs-row"></div>');
    var $container = $('<div class="unified-panel-container"></div>');
    var $content = $('<div class="unified-panel-content"></div>');
    var $closeBtn = $('<button class="unified-panel-close nes-btn is-error" type="button">×</button>');
    
    // Attach close handler directly to button (using .click() for older jQuery)
    $closeBtn.click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log('Close button clicked');
      // Force close directly using the close function
      close();
      return false;
    });
    
    // Create tabs
    for (var tabKey in tabs) {
      var tab = tabs[tabKey];
      var $tab = $('<button class="unified-panel-tab" data-tab="' + tabKey + '" title="' + tab.name + '" type="button">' +
        '<span class="tab-icon nes-avatar"></span>' +
        '</button>');
      $tabsRow.append($tab);
    }
    
    // Add close button to tabs row
    $tabsRow.append($closeBtn);
    
    $container.append($content);
    $panel.append($overlay);
    $panel.append($tabsRow);
    $panel.append($container);
    
    $('body').append($panel);
    
    // Set initial active tab
    updateActiveTab('home');
  }
  
  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Close button - use event delegation with .live() for older jQuery
    $('.unified-panel-close').live('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      close();
      return false;
    });
    
    // Overlay click
    $('.unified-panel-overlay').live('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return false;
    });
    
    // Tab clicks
    $('.unified-panel-tab').live('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var tabKey = $(this).attr('data-tab');
      switchTab(tabKey);
      return false;
    });
    
    // ESC key to close
    $(document).keydown(function(e) {
      if (e.keyCode === 27 && isOpen) { // ESC key
        e.preventDefault();
        close();
        return false;
      }
    });
    
    // Prevent clicks inside container from closing
    $('.unified-panel-container').live('click', function(e) {
      e.stopPropagation();
    });
  }
  
  /**
   * Open the panel
   */
  function open(tabKey) {
    // Ensure panel exists
    var $panel = $('#unified-panel');
    if ($panel.length === 0) {
      console.log('Panel not found, initializing...');
      init();
      $panel = $('#unified-panel');
    }
    
    if ($panel.length) {
      if (tabKey) {
        switchTab(tabKey);
      } else {
        // Default to home if no tab specified
        switchTab('home');
      }
      $panel.addClass('active');
      $('body').addClass('unified-panel-open');
      isOpen = true;
    } else {
      console.error('Failed to create panel!');
    }
  }
  
  /**
   * Close the panel
   */
  function close() {
    console.log('Closing unified panel');
    var $panel = $('#unified-panel');
    
    if ($panel.length === 0) {
      console.warn('Panel element not found, but continuing to close anyway');
      // Still try to remove classes from body
      $('body').removeClass('unified-panel-open');
      isOpen = false;
      return;
    }
    
    $panel.removeClass('active');
    $('body').removeClass('unified-panel-open');
    isOpen = false;
    console.log('Panel closed successfully');
  }
  
  /**
   * Switch to a different tab
   */
  function switchTab(tabKey) {
    if (!tabs[tabKey]) {
      console.warn('Tab not found:', tabKey);
      return;
    }
    
    currentTab = tabKey;
    updateActiveTab(tabKey);
    loadTabContent(tabKey);
  }
  
  /**
   * Update active tab styling
   */
  function updateActiveTab(tabKey) {
    $('.unified-panel-tab').removeClass('active');
    $('.unified-panel-tab[data-tab="' + tabKey + '"]').addClass('active');
  }
  
  /**
   * Load content for a specific tab
   */
  function loadTabContent(tabKey) {
    var $content = $('.unified-panel-content');
    $content.empty();
    
    switch(tabKey) {
      case 'home':
        loadHomeContent($content);
        break;
      case 'backpack':
        loadBackpackContent($content);
        break;
      case 'fishbook':
        loadFishbookContent($content);
        break;
      case 'achievements':
        loadAchievementsContent($content);
        break;
      case 'games':
        loadGamesContent($content);
        break;
      case 'settings':
        loadSettingsContent($content);
        break;
    }
  }
  
  /**
   * Load home/intro content
   */
  function loadHomeContent($container) {
    var $wrapper = $('<div class="tab-content-wrapper home-content"></div>');
    
    var $intro = $('<div class="home-intro"></div>');
    var $greeting = $('<h1 class="home-greeting">Hello!</h1>');
    var $name = $('<h2 class="home-name">My name is Dylan Landman</h2>');
    var coinCount = (typeof inventory !== "undefined" && inventory.coinCount) ? inventory.coinCount : 0;
    var totalCoins = (typeof COIN_CONFIG !== "undefined" && COIN_CONFIG.totalCoins) ? COIN_CONFIG.totalCoins : 0;
    
    var $description = $('<p class="home-description">' +
      'Welcome to my pixel portfolio! Explore the map, collect items, play games, ' +
      'and discover my projects. Use the tabs above to navigate through different sections. ' +
      'Enjoy your visit!' +
      '</p>');
    
    var $coinProgress = $('<div class="coin-progress"></div>');
    $coinProgress.append('<p class="coin-progress-title">💰 Coins Collected</p>');
    $coinProgress.append('<p class="coin-progress-count">' + coinCount + ' / ' + totalCoins + '</p>');
    
    if (coinCount >= totalCoins && totalCoins > 0) {
      $coinProgress.append('<p class="coin-complete">🎉 All coins found!</p>');
    }
    
    $intro.append($greeting);
    $intro.append($name);
    $intro.append($description);
    $intro.append($coinProgress);
    $wrapper.append($intro);
    
    $container.append($wrapper);
  }
  
  /**
   * Load backpack/inventory content
   */
  function loadBackpackContent($container) {
    if (typeof inventory === 'undefined') {
      $container.html('<p>Inventory not available</p>');
      return;
    }
    
    var $wrapper = $('<div class="tab-content-wrapper backpack-content"></div>');
    var $title = $('<h2 class="tab-content-title">Inventory</h2>');
    $wrapper.append($title);
    
    var items = [
      { key: 'backpack', name: 'Backpack', icon: 'backpack-icon.png' },
      { key: 'axe', name: 'Axe', icon: 'axe-icon-found.png' },
      { key: 'wood', name: 'Wood', icon: 'wood-icon-found.png' },
      { key: 'matchbox', name: 'Matches', icon: 'matchbox-icon-found.png' },
      { key: 'minimap', name: 'Map', icon: 'map-icon-found.png' },
      { key: 'resume', name: 'Resume', icon: 'resume-icon-found.png' },
      { key: 'fishingRod', name: 'Fishing Rod', icon: 'fishing-rod-found.png' },
      { key: 'fishbook', name: 'Fishbook', icon: 'fishbook-icon-found.png' }
    ];
    
    var $grid = $('<div class="inventory-grid"></div>');
    
    items.forEach(function(item) {
      var hasItem = !!inventory[item.key];
      var $item = $('<div class="inventory-item ' + (hasItem ? 'owned' : 'missing') + '">' +
        '<div class="inventory-item-icon"></div>' +
        '<div class="inventory-item-name">' + item.name + '</div>' +
        `<a href="#" class="nes-badge">
            <span class="is-success is-icon">FOUND</span>
            </a>` +
        '<div class="inventory-item-status">' + (hasItem ? '✓ Owned' : '✗ Missing') + '</div>' +
        '</div>');
      
      if (hasItem) {
        $item.find('.inventory-item-icon').css({
          'background-image': 'url(resources/images/misc/' + item.icon + ')',
          'background-size': 'contain',
          'background-repeat': 'no-repeat',
          'background-position': 'center',
          'width': '64px',
          'height': '64px'
        });
      }
      
      $grid.append($item);
    });
    
    $wrapper.append($grid);
    $container.append($wrapper);
  }
  
  /**
   * Load fishbook content
   */
  function loadFishbookContent($container) {
    var $wrapper = $('<div class="tab-content-wrapper fishbook-content"></div>');
    
    if (typeof openFishbook === 'function') {
      // Use existing fishbook modal content if available
      // For now, create a placeholder
      $wrapper.html('<h2 class="tab-content-title">Fish Collection</h2><p>Fishbook content will go here</p>');
    } else {
      $wrapper.html('<h2 class="tab-content-title">Fish Collection</h2><p>Fishbook not available</p>');
    }
    
    $container.append($wrapper);
  }
  
  /**
   * Load achievements content
   */
  function loadAchievementsContent($container) {
    var $wrapper = $('<div class="tab-content-wrapper achievements-content"></div>');
    var $title = $('<h2 class="tab-content-title">Achievements & Challenges</h2>');
    $wrapper.append($title);
    
    // Placeholder for now - will be populated with actual achievements
    var $list = $('<div class="achievements-list"></div>');
    $list.html('<p>Achievement system coming soon!</p>');
    $wrapper.append($list);
    
    $container.append($wrapper);
  }
  
  /**
   * Load games content
   */
  function loadGamesContent($container) {
    var $wrapper = $('<div class="tab-content-wrapper games-content"></div>');
    var $title = $('<h2 class="tab-content-title">Games</h2>');
    $wrapper.append($title);
    
    var $gamesList = $('<div class="games-list"></div>');
    
    // Fishing game
    var $fishingBtn = $('<button class="nes-btn is-primary game-button">' +
      '<span class="game-icon">🎣</span>' +
      '<span class="game-name">Fishing</span>' +
      '</button>');
    $fishingBtn.click(function() {
      if (typeof goFishing === 'function') {
        close();
        goFishing();
      }
    });
    
    // Soccer game
    var $soccerBtn = $('<button class="nes-btn is-primary game-button">' +
      '<span class="game-icon">⚽</span>' +
      '<span class="game-name">Soccer</span>' +
      '</button>');
    $soccerBtn.click(function() {
      if (typeof choosePlayers === 'function') {
        close();
        choosePlayers();
      }
    });
    
    $gamesList.append($fishingBtn);
    $gamesList.append($soccerBtn);
    $wrapper.append($gamesList);
    $container.append($wrapper);
  }
  
  /**
   * Load settings content
   */
  function loadSettingsContent($container) {
    var $wrapper = $('<div class="tab-content-wrapper settings-content"></div>');
    var $title = $('<h2 class="tab-content-title">Settings</h2>');
    $wrapper.append($title);
    
    var $settingsList = $('<div class="settings-list"></div>');
    
    // Reset items button
    var $resetBtn = $('<button class="nes-btn is-error settings-button">Reset All Items</button>');
    $resetBtn.click(function() {
      if (confirm('Are you sure you want to reset all items? This will clear your progress and reload the page.')) {
        if (typeof resetAllItems === 'function') {
          resetAllItems();
        }
      }
    });
    
    $settingsList.append($resetBtn);
    $wrapper.append($settingsList);
    $container.append($wrapper);
  }
  
  return {
    init: init,
    open: open,
    close: close,
    switchTab: switchTab,
    isOpen: function() { return isOpen; }
  };
})();

// Initialize when DOM is ready
$(function() {
  UnifiedPanel.init();
});

