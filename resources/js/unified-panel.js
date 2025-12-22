// Unified Panel System - Single tabbed interface for all game features
// Consolidates: Backpack, Fishbook, Achievements, Games, Settings, etc.

var UnifiedPanel = (function () {
  var currentTab = "home";
  var isOpen = false;
  var eventsBound = false;

  // Cache loaded tab templates as DocumentFragments
  var tabTemplates = {};

  // Simple cache-busting suffix so HTML changes to components always show up
  // Bump this value whenever component HTML changes.
  var TEMPLATE_VERSION = "v=4";

  var tabTemplatePaths = {
    home: "resources/components/unified-panel-home.html?" + TEMPLATE_VERSION,
    backpack:
      "resources/components/unified-panel-backpack.html?" + TEMPLATE_VERSION,
    fishbook:
      "resources/components/unified-panel-fishbook.html?" + TEMPLATE_VERSION,
    achievements:
      "resources/components/unified-panel-achievements.html?" +
      TEMPLATE_VERSION,
    games: "resources/components/unified-panel-games.html?" + TEMPLATE_VERSION,
    settings:
      "resources/components/unified-panel-settings.html?" + TEMPLATE_VERSION,
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

    $.get("resources/components/unified-panel.html?" + TEMPLATE_VERSION)
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

      // Reset any closing animation classes
      var $container = $panel.find(".unified-panel-container");
      $container.removeClass("hinge-out");

      var targetTab = tabKey || "home";
      switchTab(targetTab);

      $panel.addClass("active").attr("aria-hidden", "false");
      // Trigger hinge-in animation
      $container.addClass("hinge-in");
      setTimeout(function () {
        $container.removeClass("hinge-in");
      }, 450);

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

    var $container = $panel.find(".unified-panel-container");

    // Play hinge-out animation, then actually hide the panel
    $container.removeClass("hinge-in").addClass("hinge-out");

    setTimeout(function () {
      $panel.removeClass("active").attr("aria-hidden", "true");
      $("body").removeClass("unified-panel-open");
      $container.removeClass("hinge-out");
      isOpen = false;
    }, 400);
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
      var contentEl =
        document.getElementById("unified-panel-tabpanel") ||
        document.querySelector(".unified-panel-content");

      // If the shell loaded without a content container for some reason,
      // create one programmatically so tabs always have somewhere to render.
      if (!contentEl) {
        var panelEl = document.getElementById("unified-panel");
        if (!panelEl) {
          console.error("UnifiedPanel: panel element not found");
          return;
        }

        var container = document.createElement("div");
        container.className = "unified-panel-container";

        contentEl = document.createElement("div");
        contentEl.className = "unified-panel-content";
        contentEl.id = "unified-panel-tabpanel";
        contentEl.setAttribute("role", "tabpanel");

        container.appendChild(contentEl);
        panelEl.appendChild(container);
      }

      var $content = $(contentEl);
      $content.empty();

      getTabTemplate(tabKey, function (fragment) {
        if (!fragment) return;

        // Only render if this is still the active tab
        if (tabKey !== currentTab) return;

        $content.append(fragment);
        hydrateTab(tabKey, contentEl);
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
        hydrateAchievementsTab(rootEl);
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

    var detailRoot = rootEl.querySelector('[data-role="item-detail"]');
    var detailImage = detailRoot
      ? detailRoot.querySelector('[data-role="detail-image"]')
      : null;
    var detailTitle = detailRoot
      ? detailRoot.querySelector('[data-role="detail-title"]')
      : null;
    var detailDescription = detailRoot
      ? detailRoot.querySelector('[data-role="detail-description"]')
      : null;
    var detailStatus = detailRoot
      ? detailRoot.querySelector('[data-role="detail-status"]')
      : null;

    function selectItem(itemEl) {
      if (!detailRoot || !itemEl) return;

      // Clear previous selection
      for (var j = 0; j < items.length; j++) {
        items[j].classList.remove("selected");
      }
      itemEl.classList.add("selected");

      var title =
        itemEl.getAttribute("data-item-title") ||
        itemEl.querySelector(".inventory-item-name").textContent;
      var description =
        itemEl.getAttribute("data-item-description") || "";
      var missingDescription =
        itemEl.getAttribute("data-item-missing") || "";
      var statusTextEl = itemEl.querySelector(".inventory-item-status");
      var isOwned = itemEl.classList.contains("owned");

      if (detailTitle) {
        detailTitle.textContent = title;
      }
      if (detailDescription) {
        detailDescription.textContent = description;
      }
      if (detailStatus && statusTextEl) {
        detailStatus.className = detailStatus.className
          .replace(/\bowned\b/g, "")
          .replace(/\bmissing\b/g, "");

        if (isOwned) {
          detailStatus.className += " owned";
          detailStatus.textContent =
            "In your pack · " + statusTextEl.textContent;
        } else {
          detailStatus.className += " missing";
          detailStatus.textContent =
            (statusTextEl.textContent || "Not found yet") +
            (missingDescription ? " · " + missingDescription : "");
        }
      }

      if (detailImage) {
        var iconEl = itemEl.querySelector(".inventory-item-icon");
        var bg = iconEl
          ? iconEl.style.backgroundImage || ""
          : "";
        detailImage.style.backgroundImage = bg;
        if (isOwned) {
          detailImage.className = detailImage.className.replace(
            /\bmissing\b/g,
            ""
          );
        } else if (detailImage.className.indexOf("missing") === -1) {
          detailImage.className += " missing";
        }
      }
    }

    for (var i = 0; i < items.length; i++) {
      var itemEl = items[i];
      var key = itemEl.getAttribute("data-item-key");
      var icon = itemEl.getAttribute("data-icon");

      var hasItem = !!(inventory && key && inventory[key]);

      itemEl.classList.remove("owned", "missing");
      itemEl.classList.add(hasItem ? "owned" : "missing");

      var statusEl = itemEl.querySelector(".inventory-item-status");
      if (statusEl) {
        statusEl.textContent = hasItem ? "Owned" : "Missing";
      }

      var badgeEl = itemEl.querySelector(".inventory-item-badge");
      if (badgeEl) {
        badgeEl.style.display = hasItem ? "inline-block" : "none";
      }

      var iconEl = itemEl.querySelector(".inventory-item-icon");
      if (iconEl && icon) {
        // data-icon now contains a path under resources/images (e.g. 'misc/backpack2.png')
        iconEl.style.backgroundImage = "url(resources/images/" + icon + ")";
        iconEl.style.backgroundSize = "contain";
        iconEl.style.backgroundRepeat = "no-repeat";
        iconEl.style.backgroundPosition = "center";
        iconEl.style.width = "64px";
        iconEl.style.height = "64px";
      }

      // Bind selection handler
      itemEl.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        selectItem(this);
      });
    }

    // Auto-select first owned item, or first item if none owned
    if (items.length && detailRoot) {
      var firstOwned = rootEl.querySelector(".inventory-item.owned");
      selectItem(firstOwned || items[0]);
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

    // Populate high scores if available
    var scoreEls = rootEl.querySelectorAll('[data-role="game-score"]');
    for (var i = 0; i < scoreEls.length; i++) {
      var el = scoreEls[i];
      var game = el.getAttribute("data-game");
      if (!game) continue;

      if (game === "soccer") {
        var val = 0;
        if (typeof getCookie === "function") {
          var cookieVal = getCookie("soccer-high-score");
          if (cookieVal !== "") {
            var parsed = parseInt(cookieVal, 10);
            if (!isNaN(parsed)) {
              val = parsed;
            }
          }
        }
        el.textContent = val;
      } else if (game === "fishing") {
        // No explicit high score yet; show dash by default.
        el.textContent = "—";
      }
    }
  }

  function hydrateAchievementsTab(rootEl) {
    var metrics = rootEl.querySelectorAll(".achievement-metric");
    if (!metrics.length) return;

    var totalCoins =
      typeof COIN_CONFIG !== "undefined" && COIN_CONFIG && COIN_CONFIG.totalCoins
        ? COIN_CONFIG.totalCoins
        : 0;
    var coinCount =
      typeof inventory !== "undefined" && inventory && inventory.coinCount
        ? inventory.coinCount
        : 0;

    var fishCollection =
      typeof FISHREP !== "undefined" && FISHREP && FISHREP.collection
        ? FISHREP.collection
        : null;
    var totalFish = fishCollection ? Object.keys(fishCollection).length : 0;
    var caughtFish = fishCollection
      ? Object.values(fishCollection).filter(function (x) {
          return !!x;
        }).length
      : 0;

    var itemKeys = ["backpack", "minimap", "resume", "fishingRod", "fishbook"];
    var ownedItems = 0;
    var totalItems = itemKeys.length;
    if (typeof inventory !== "undefined" && inventory) {
      for (var i = 0; i < itemKeys.length; i++) {
        if (inventory[itemKeys[i]]) {
          ownedItems++;
        }
      }
    }

    function applyMetric(metricEl, current, max) {
      var summaryEl = metricEl.querySelector('[data-role="metric-summary"]');
      var barEl = metricEl.querySelector('[data-role="metric-bar"]');
      max = max || 0;

      if (summaryEl) {
        summaryEl.textContent = max > 0 ? current + " / " + max : "" + current;
      }

      if (barEl) {
        var pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
        barEl.style.width = pct + "%";
      }
    }

    for (var idx = 0; idx < metrics.length; idx++) {
      var metric = metrics[idx];
      var type = metric.getAttribute("data-metric");
      if (type === "coins") {
        applyMetric(metric, coinCount, totalCoins);
      } else if (type === "fish") {
        applyMetric(metric, caughtFish, totalFish);
      } else if (type === "items") {
        applyMetric(metric, ownedItems, totalItems);
      }
    }
  }

  function hydrateSettingsTab(rootEl) {
    var resetBtn = rootEl.querySelector('[data-role="reset-items"]');
    if (!resetBtn) return;

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


