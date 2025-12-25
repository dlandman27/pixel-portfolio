// Unified Panel System - Single tabbed interface for all game features
// Consolidates: Backpack, Fishbook, Achievements, Games, Settings, etc.

var UnifiedPanel = (function () {
  var currentTab = "home";
  var isOpen = false;
  var eventsBound = false;

  // Cache loaded tab templates as DocumentFragments
  var tabTemplates = {};

  var tabTemplatePaths = {
    home: "resources/components/unified-panel-home.html",
    backpack: "resources/components/unified-panel-backpack.html",
    fishbook: "resources/components/unified-panel-fishbook.html",
    achievements: "resources/components/unified-panel-achievements.html",
    games: "resources/components/unified-panel-games.html",
    settings: "resources/components/unified-panel-settings.html",
  };

  var tabs = {
    home: { name: "Home" },
    backpack: { name: "Backpack" },
    fishbook: { name: "Fishbook" },
    achievements: { name: "Achievements" },
    games: { name: "Games" },
    settings: { name: "Settings" },
  };

  /**
   * Ensure the unified panel shell HTML exists in the DOM.
   * Loads it from resources/components/unified-panel.html on first use.
   */
  function ensurePanelShell(onReady) {
    var $existing = $("#unified-panel");
    if ($existing.length) {
      if (typeof onReady === "function") {
        onReady($existing);
      }
      return;
    }

    var root = document.getElementById("unified-panel-root");
    if (!root) {
      console.error("Unified panel root element #unified-panel-root not found");
      return;
    }

    $.get("resources/components/unified-panel.html")
      .done(function (markup) {
        // Parse the static HTML into DOM nodes without building strings here
        var temp = document.createElement("div");
        temp.innerHTML = markup;

        while (temp.firstChild) {
          root.appendChild(temp.firstChild);
        }

        var $panel = $("#unified-panel");
        if (!$panel.length) {
          console.error("Unified panel shell failed to load");
          return;
        }

        setupEventListeners();
        if (typeof onReady === "function") {
          onReady($panel);
        }
      })
      .fail(function (err) {
        console.error("Failed to load unified panel shell", err);
      });
  }

  /**
   * Initialize the unified panel.
   * Called once on DOM ready.
   */
  function init() {
    ensurePanelShell(function () {
      // Default to home on first load
      updateActiveTab("home");
      loadTabContent("home");
    });
  }

  /**
   * Setup event listeners (bound once).
   */
  function setupEventListeners() {
    if (eventsBound) return;
    eventsBound = true;

    // Close button - use .live for older jQuery support
    $(".unified-panel-close").live("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return false;
    });

    // Overlay click
    $(".unified-panel-overlay").live("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      close();
      return false;
    });

    // Tab clicks
    $(".unified-panel-tab").live("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var tabKey = $(this).attr("data-tab");
      switchTab(tabKey);
      return false;
    });

    // Prevent clicks inside container from closing
    $(".unified-panel-container").live("click", function (e) {
      e.stopPropagation();
    });

    // ESC key to close
    $(document).keydown(function (e) {
      if (e.keyCode === 27 && isOpen) {
        e.preventDefault();
        close();
      }
    });
  }

  /**
   * Open the panel
   */
  function open(tabKey) {
    ensurePanelShell(function () {
      var $panel = $("#unified-panel");
      if (!$panel.length) {
        console.error("Unified panel element not found after shell init");
        return;
      }

      var targetTab = tabKey || "home";
      switchTab(targetTab);

      $panel.addClass("active").attr("aria-hidden", "false");
      $("body").addClass("unified-panel-open");
      isOpen = true;
    });
  }

  /**
   * Close the panel
   */
  function close() {
    var $panel = $("#unified-panel");

    if (!$panel.length) {
      $("body").removeClass("unified-panel-open");
      isOpen = false;
      return;
    }

    // Add a 'closing' state so we can play a hinge-out animation
    $panel.removeClass("active").addClass("closing").attr("aria-hidden", "true");
    $("body").removeClass("unified-panel-open");
    isOpen = false;

    // After animation completes, fully hide and clear closing state
    setTimeout(function () {
      $panel.removeClass("closing");
    }, 500);
  }

  /**
   * Switch to a different tab
   */
  function switchTab(tabKey) {
    if (!tabs[tabKey]) {
      console.warn("UnifiedPanel: Tab not found:", tabKey);
      return;
    }

    currentTab = tabKey;
    updateActiveTab(tabKey);
    loadTabContent(tabKey);
  }

  /**
   * Update active tab styling and ARIA attributes
   */
  function updateActiveTab(tabKey) {
    var $tabs = $(".unified-panel-tab");
    $tabs.removeClass("active").attr("aria-selected", "false");

    var $active = $('.unified-panel-tab[data-tab="' + tabKey + '"]');
    $active.addClass("active").attr("aria-selected", "true");

    var $tabpanel = $("#unified-panel-tabpanel");
    if ($tabpanel.length && $active.length) {
      var id = $active.attr("id");
      if (id) {
        $tabpanel.attr("aria-labelledby", id);
      }
    }
  }

  /**
   * Load the static HTML partial for a tab as a DocumentFragment.
   */
  function getTabTemplate(tabKey, callback) {
    if (!tabTemplatePaths[tabKey]) {
      console.warn("UnifiedPanel: No template path configured for tab", tabKey);
      callback(null);
      return;
    }

    if (tabTemplates[tabKey]) {
      // Clone existing fragment so each render gets fresh nodes
      var clone = tabTemplates[tabKey].cloneNode(true);
      callback(clone);
      return;
    }

    $.get(tabTemplatePaths[tabKey])
      .done(function (markup) {
        var temp = document.createElement("div");
        temp.innerHTML = markup;

        var fragment = document.createDocumentFragment();
        while (temp.firstChild) {
          fragment.appendChild(temp.firstChild);
        }

        tabTemplates[tabKey] = fragment;

        var clone = fragment.cloneNode(true);
        callback(clone);
      })
      .fail(function (err) {
        console.error("UnifiedPanel: Failed to load tab template", tabKey, err);
        callback(null);
      });
  }

  /**
   * Load content for a specific tab
   * Always ensures the shell exists before trying to render.
   */
  function loadTabContent(tabKey) {
    ensurePanelShell(function () {
      var $content = $("#unified-panel-tabpanel");
      if (!$content.length) {
        $content = $(".unified-panel-content");
      }

      if (!$content.length) {
        console.error("UnifiedPanel: content container not found");
        return;
      }

      $content.empty();

      getTabTemplate(tabKey, function (fragment) {
        if (!fragment) return;

        // Only render if this is still the active tab
        if (tabKey !== currentTab) return;

        $content.append(fragment);
        hydrateTab(tabKey, $content[0]);
      });
    });
  }

  /**
   * Attach dynamic behavior and state to a rendered tab.
   */
  function hydrateTab(tabKey, rootEl) {
    switch (tabKey) {
      case "home":
        hydrateHomeTab(rootEl);
        break;
      case "backpack":
        hydrateBackpackTab(rootEl);
        break;
      case "fishbook":
        hydrateFishbookTab(rootEl);
        break;
      case "achievements":
        // No dynamic behavior yet
        break;
      case "games":
        hydrateGamesTab(rootEl);
        break;
      case "settings":
        hydrateSettingsTab(rootEl);
        break;
    }
  }

  function hydrateHomeTab(rootEl) {
    var coinCount =
      typeof inventory !== "undefined" && inventory && inventory.coinCount
        ? inventory.coinCount
        : 0;
    var totalCoins =
      typeof COIN_CONFIG !== "undefined" && COIN_CONFIG && COIN_CONFIG.totalCoins
        ? COIN_CONFIG.totalCoins
        : 0;

    var countEl = rootEl.querySelector('[data-role="coin-count"]');
    if (countEl) {
      countEl.textContent = coinCount + " / " + totalCoins;
    }

    var completeEl = rootEl.querySelector('[data-role="coin-complete"]');
    if (completeEl) {
      var showComplete = totalCoins > 0 && coinCount >= totalCoins;
      completeEl.style.display = showComplete ? "block" : "none";
    }
  }

  function hydrateBackpackTab(rootEl) {
    if (typeof inventory === "undefined") {
      rootEl.textContent = "Inventory not available";
      return;
    }

    var items = rootEl.querySelectorAll(".inventory-item");
    for (var i = 0; i < items.length; i++) {
      var itemEl = items[i];
      var key = itemEl.getAttribute("data-item-key");
      var icon = itemEl.getAttribute("data-icon");

      var hasItem = !!(inventory && key && inventory[key]);

      itemEl.classList.remove("owned", "missing");
      itemEl.classList.add(hasItem ? "owned" : "missing");

      var statusEl = itemEl.querySelector(".inventory-item-status");
      if (statusEl) {
        statusEl.textContent = hasItem ? "✓ Owned" : "✗ Missing";
      }

      var badgeEl = itemEl.querySelector(".inventory-item-badge");
      if (badgeEl) {
        badgeEl.style.display = hasItem ? "inline-block" : "none";
      }

      var iconEl = itemEl.querySelector(".inventory-item-icon");
      if (iconEl && hasItem && icon) {
        iconEl.style.backgroundImage =
          "url(resources/images/misc/" + icon + ")";
        iconEl.style.backgroundSize = "contain";
        iconEl.style.backgroundRepeat = "no-repeat";
        iconEl.style.backgroundPosition = "center";
        iconEl.style.width = "64px";
        iconEl.style.height = "64px";
      }
    }
  }

  function hydrateFishbookTab(rootEl) {
    var btn = rootEl.querySelector('[data-role="open-fishbook-modal"]');
    if (!btn) return;

    btn.addEventListener("click", function () {
      if (typeof openFishbook === "function") {
        close();
        openFishbook();
      }
    });
  }

  function hydrateGamesTab(rootEl) {
    var fishingBtn = rootEl.querySelector('[data-role="launch-fishing"]');
    if (fishingBtn) {
      fishingBtn.addEventListener("click", function () {
        if (typeof goFishing === "function") {
          close();
          goFishing();
        }
      });
    }

    var soccerBtn = rootEl.querySelector('[data-role="launch-soccer"]');
    if (soccerBtn) {
      soccerBtn.addEventListener("click", function () {
        if (typeof choosePlayers === "function") {
          close();
          choosePlayers();
        }
      });
    }
  }

  function hydrateSettingsTab(rootEl) {
    var resetBtn = rootEl.querySelector('[data-role="reset-items"]');
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (
          window.confirm(
            "Are you sure you want to reset all items? This will clear your progress and reload the page."
          )
        ) {
          if (typeof resetAllItems === "function") {
            resetAllItems();
          }
        }
      });
    }

    // Collision debug toggle (WORLD_COLLIDERS-based only)
    var debugBtn = rootEl.querySelector(
      '[data-role="toggle-collision-debug"]'
    );
    if (debugBtn) {
      // Initialize button state based on current GameWorld debug flag (if any)
      var debugOn = false;
      if (
        window.playerController &&
        window.playerController.gameWorld &&
        typeof window.playerController.gameWorld.getColliderDebugEnabled ===
          "function"
      ) {
        debugOn =
          !!window.playerController.gameWorld.getColliderDebugEnabled();
      }

      debugBtn.textContent = debugOn
        ? "Hide Collision Boxes"
        : "Show Collision Boxes";

      debugBtn.addEventListener("click", function () {
        debugOn = !debugOn;

        // Toggle WORLD_COLLIDERS-based debug via GameWorld (if available)
        if (
          window.playerController &&
          window.playerController.gameWorld &&
          typeof window.playerController.gameWorld.setColliderDebugEnabled ===
            "function"
        ) {
          window.playerController.gameWorld.setColliderDebugEnabled(debugOn);
        }

        debugBtn.textContent = debugOn
          ? "Hide Collision Boxes"
          : "Show Collision Boxes";
      });
    }

  }

  return {
    init: init,
    open: open,
    close: close,
    switchTab: switchTab,
    isOpen: function () {
      return isOpen;
    },
  };
})();

// Initialize when DOM is ready
$(function () {
  UnifiedPanel.init();
});


