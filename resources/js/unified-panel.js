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
    work: "resources/components/unified-panel-work.html",
    contact: "resources/components/unified-panel-contact.html",
    wardrobe: "resources/components/unified-panel-wardrobe.html",
    backpack: "resources/components/unified-panel-backpack.html",
    fishbook: "resources/components/unified-panel-fishbook.html",
    achievements: "resources/components/unified-panel-achievements.html",
    games: "resources/components/unified-panel-games.html",
    journal: "resources/components/unified-panel-journal.html",
    settings: "resources/components/unified-panel-settings.html",
  };

  // Page titles (shown in the panel header and the start menu).
  var tabs = {
    home: { name: "About" },
    work: { name: "Work" },
    contact: { name: "Contact" },
    wardrobe: { name: "Wardrobe" },
    backpack: { name: "Bag" },
    fishbook: { name: "Fishbook" },
    achievements: { name: "Achievements" },
    games: { name: "Games" },
    journal: { name: "Journal" },
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

    // Back: return to the start menu
    $(".unified-panel-back").live("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      close();
      if (typeof StartMenu !== "undefined") StartMenu.open(currentTab);
      return false;
    });

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
      if (typeof StartMenu !== "undefined") StartMenu.close();
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

    // Add a 'closing' state so the panel can fade out
    $panel.removeClass("active").addClass("closing").attr("aria-hidden", "true");
    $("body").removeClass("unified-panel-open");
    isOpen = false;

    // After animation completes, fully hide and clear closing state
    setTimeout(function () {
      $panel.removeClass("closing");
    }, 160); // matches unifiedPanelOut in style.css
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
    $("#unified-panel-title").text(tabs[tabKey].name);
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
      case "work":
        hydrateWorkTab(rootEl);
        break;
      case "wardrobe":
        hydrateWardrobeTab(rootEl);
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
      case "journal":
        if (window.Park) Park.hydrate(rootEl);
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
    var viewWorkBtn = rootEl.querySelector('[data-role="view-work"]');
    if (viewWorkBtn) {
      viewWorkBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        switchTab("work");
      });
    }

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

  var WORK_FILTERS = {
    all: function () { return true; },
    software: function (p) { return p.type === "website" || p.type === "mobile-app"; },
    research: function (p) { return p.type === "research-paper"; },
    logo: function (p) { return p.type === "logo"; },
    motion: function (p) { return p.type === "graphic"; },
  };

  // Set when a project is opened from the Work tab so closing the lightbox
  // brings the visitor back to the list instead of dropping them in the world.
  var returnToWorkTab = false;
  // Filter to apply the next time the Work tab renders (set by openWork).
  var pendingWorkFilter = null;

  function openWork(filter) {
    pendingWorkFilter = WORK_FILTERS[filter] ? filter : null;
    if (isOpen) switchTab("work");
    else open("work");
  }

  function buildWorkCard(project) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "work-card";
    card.setAttribute("data-project-id", project.id);

    var thumb = document.createElement("div");
    thumb.className = "work-card-thumb";
    if (project.image) {
      thumb.style.backgroundImage = "url(" + project.image.replace(/ /g, "%20") + ")";
    } else if (project.video) {
      var video = document.createElement("video");
      video.src = project.video.replace(/ /g, "%20") + "#t=0.5";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      thumb.appendChild(video);
      card.addEventListener("mouseenter", function () { video.play().catch(function () {}); });
      card.addEventListener("mouseleave", function () { video.pause(); });
      thumb.classList.add("is-video");
    } else {
      thumb.textContent = project.placeholder || project.title;
      thumb.classList.add("is-placeholder");
      if (project.placeholderFractal) thumb.classList.add("fractal-pattern");
    }
    card.appendChild(thumb);

    var title = document.createElement("span");
    title.className = "work-card-title";
    title.textContent = project.title;
    card.appendChild(title);

    card.addEventListener("click", function () {
      if (typeof openProjectLightbox !== "function") return;
      returnToWorkTab = true;
      close();
      openProjectLightbox(project.id);
    });
    return card;
  }

  function hydrateWorkTab(rootEl) {
    var grid = rootEl.querySelector('[data-role="work-grid"]');
    if (!grid || typeof PORTFOLIO_PROJECTS === "undefined") return;

    function render(filterKey) {
      grid.innerHTML = "";
      PORTFOLIO_PROJECTS.filter(WORK_FILTERS[filterKey] || WORK_FILTERS.all).forEach(function (project) {
        grid.appendChild(buildWorkCard(project));
      });
    }

    var buttons = rootEl.querySelectorAll(".work-filter");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        Array.prototype.forEach.call(buttons, function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        render(btn.getAttribute("data-filter"));
      });
    });

    var initial = pendingWorkFilter || "all";
    pendingWorkFilter = null;
    Array.prototype.forEach.call(buttons, function (b) {
      b.classList.toggle("active", b.getAttribute("data-filter") === initial);
    });
    render(initial);
  }

  function hydrateWardrobeTab(rootEl) {
    if (typeof Skins === "undefined") return;
    var outfitGrid = rootEl.querySelector('[data-role="outfit-grid"]');
    var hatGrid = rootEl.querySelector('[data-role="hat-grid"]');
    var previewDylan = rootEl.querySelector('[data-role="preview-dylan"]');
    var previewHat = rootEl.querySelector('[data-role="preview-hat"]');
    var previewName = rootEl.querySelector('[data-role="preview-name"]');

    function outfitFrame(outfitId) {
      var folder = outfitId === "classic"
        ? "resources/images/characters/dylan"
        : "resources/images/characters/skins/" + outfitId;
      return "url(" + folder + "/dylan-front-2.png)";
    }

    function card(item, kind, isCurrent) {
      var unlocked = Skins.isUnlocked(item);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wardrobe-item" + (isCurrent ? " is-current" : "") + (unlocked ? "" : " is-locked");
      btn.setAttribute("aria-pressed", isCurrent ? "true" : "false");

      var art = document.createElement("span");
      art.className = "wardrobe-item-art";
      if (kind === "outfit") {
        art.style.backgroundImage = outfitFrame(item.id);
      } else if (item.id !== "none") {
        var img = document.createElement("img");
        img.src = "resources/images/characters/hats/" + item.id + ".png";
        img.alt = "";
        art.appendChild(img);
      } else {
        art.textContent = "—";
      }
      btn.appendChild(art);

      var label = document.createElement("span");
      label.className = "wardrobe-item-name";
      label.textContent = unlocked ? item.name : "Locked";
      btn.appendChild(label);

      if (!unlocked) {
        btn.title = Skins.hintFor(item);
        var hint = document.createElement("span");
        hint.className = "wardrobe-item-hint";
        hint.textContent = Skins.hintFor(item);
        btn.appendChild(hint);
      }

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (kind === "outfit") Skins.setOutfit(item.id);
        else Skins.setHat(item.id);
      });
      return btn;
    }

    function render() {
      var current = Skins.current();
      outfitGrid.innerHTML = "";
      hatGrid.innerHTML = "";
      Skins.OUTFITS.forEach(function (o) { outfitGrid.appendChild(card(o, "outfit", o.id === current.outfit)); });
      Skins.HATS.forEach(function (h) { hatGrid.appendChild(card(h, "hat", h.id === current.hat)); });

      previewDylan.style.backgroundImage = outfitFrame(current.outfit);
      if (current.hat === "none") {
        previewHat.style.display = "none";
      } else {
        previewHat.style.display = "";
        previewHat.src = "resources/images/characters/hats/" + current.hat + ".png";
      }
      var outfitName = Skins.OUTFITS.filter(function (o) { return o.id === current.outfit; })[0];
      var hatName = Skins.HATS.filter(function (h) { return h.id === current.hat; })[0];
      previewName.textContent = (outfitName ? outfitName.name : "") + (current.hat !== "none" && hatName ? " + " + hatName.name : "");
    }

    Skins.onChange(function () {
      if (document.body.contains(outfitGrid)) render();
    });
    render();
  }

  // Wrap the global lightbox close so the Work tab reopens after viewing a project.
  $(function () {
    if (typeof closeProjectLightbox !== "function") return;
    var originalClose = closeProjectLightbox;
    window.closeProjectLightbox = function () {
      originalClose.apply(this, arguments);
      if (returnToWorkTab) {
        returnToWorkTab = false;
        open("work");
      }
    };
  });

  function hydrateBackpackTab(rootEl) {
    if (typeof inventory === "undefined") {
      rootEl.textContent = "Inventory not available";
      return;
    }

    var items = rootEl.querySelectorAll(".inventory-item");
    var firstItem = null;
    
    // Update item display and add click handlers
    for (var i = 0; i < items.length; i++) {
      var itemEl = items[i];
      var key = itemEl.getAttribute("data-item-key");
      var icon = itemEl.getAttribute("data-icon");

      var hasItem = !!(inventory && key && inventory[key]);

      itemEl.classList.remove("owned", "missing", "selected");
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
      if (iconEl && icon) {
        // Always show the icon, whether owned or missing
        iconEl.style.backgroundImage =
          "url(resources/images/misc/" + icon + ")";
        iconEl.style.backgroundSize = "contain";
        iconEl.style.backgroundRepeat = "no-repeat";
        iconEl.style.backgroundPosition = "center";
        iconEl.style.width = "64px";
        iconEl.style.height = "64px";
      }
      
      // Add click handler to show item details
      (function(el) {
        el.addEventListener("click", function() {
          selectInventoryItem(rootEl, el);
        });
      })(itemEl);
      
      // Track the first item for auto-selection
      if (!firstItem) {
        firstItem = itemEl;
      }
    }
    
    // Auto-select the first item
    if (firstItem) {
      selectInventoryItem(rootEl, firstItem);
    }
  }
  
  function selectInventoryItem(rootEl, itemEl) {
    // Remove selected class from all items
    var allItems = rootEl.querySelectorAll(".inventory-item");
    for (var i = 0; i < allItems.length; i++) {
      allItems[i].classList.remove("selected");
    }
    
    // Add selected class to clicked item
    itemEl.classList.add("selected");
    
    // Update detail panel
    var detailImageEl = rootEl.querySelector('[data-role="detail-image"]');
    var detailTitleEl = rootEl.querySelector('[data-role="detail-title"]');
    var detailDescEl = rootEl.querySelector('[data-role="detail-description"]');
    var detailStatusEl = rootEl.querySelector('[data-role="detail-status"]');
    
    var key = itemEl.getAttribute("data-item-key");
    var icon = itemEl.getAttribute("data-icon");
    var title = itemEl.getAttribute("data-item-title");
    var description = itemEl.getAttribute("data-item-description");
    var hasItem = !!(inventory && key && inventory[key]);
    
    if (detailImageEl && icon) {
      // Always show the icon, whether owned or missing
      detailImageEl.style.backgroundImage = "url(resources/images/misc/" + icon + ")";
      detailImageEl.style.backgroundSize = "contain";
      detailImageEl.style.backgroundRepeat = "no-repeat";
      detailImageEl.style.backgroundPosition = "center";
      
      // Add/remove missing class for grayscale effect
      if (hasItem) {
        detailImageEl.classList.remove("missing");
      } else {
        detailImageEl.classList.add("missing");
      }
    }
    
    if (detailTitleEl) {
      detailTitleEl.textContent = title || "Unknown Item";
    }
    
    if (detailDescEl) {
      detailDescEl.textContent = description || "No description available.";
    }
    
    if (detailStatusEl) {
      detailStatusEl.textContent = hasItem ? "✓ You own this item" : "✗ You haven't found this yet";
      detailStatusEl.style.color = hasItem ? "#4ade80" : "#f87171";
      detailStatusEl.style.fontWeight = "bold";
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
    var gameCards = rootEl.querySelectorAll(".game-card");
    var firstCard = null;
    
    // Add click handlers to all game cards
    for (var i = 0; i < gameCards.length; i++) {
      var cardEl = gameCards[i];
      
      (function(el) {
        el.addEventListener("click", function() {
          selectGame(rootEl, el);
        });
      })(cardEl);
      
      // Track first card for auto-selection
      if (!firstCard) {
        firstCard = cardEl;
      }
    }
    
    // Auto-select the first game
    if (firstCard) {
      selectGame(rootEl, firstCard);
    }
  }
  
  function selectGame(rootEl, cardEl) {
    // Remove selected class from all cards
    var allCards = rootEl.querySelectorAll(".game-card");
    for (var i = 0; i < allCards.length; i++) {
      allCards[i].classList.remove("selected");
    }
    
    // Add selected class to clicked card
    cardEl.classList.add("selected");
    
    // Update detail panel
    var detailTitleEl = rootEl.querySelector('[data-role="game-detail-title"]');
    var detailLocationEl = rootEl.querySelector('[data-role="game-detail-location"]');
    var detailDescEl = rootEl.querySelector('[data-role="game-detail-description"]');
    var detailRulesEl = rootEl.querySelector('[data-role="game-detail-rules"]');
    var detailScoreEl = rootEl.querySelector('[data-role="game-detail-score"]');
    var detailActionsEl = rootEl.querySelector('[data-role="game-detail-actions"]');
    
    var gameKey = cardEl.getAttribute("data-game-key");
    var gameTitle = cardEl.getAttribute("data-game-title");
    var gameLocation = cardEl.getAttribute("data-game-location");
    var gameDesc = cardEl.getAttribute("data-game-description");
    var gameRules = cardEl.getAttribute("data-game-rules");
    
    if (detailTitleEl) {
      detailTitleEl.textContent = gameTitle || "Game";
    }
    
    if (detailLocationEl) {
      detailLocationEl.textContent = gameLocation || "";
    }
    
    if (detailDescEl) {
      detailDescEl.textContent = gameDesc || "";
    }
    
    if (detailRulesEl) {
      detailRulesEl.innerHTML = "<strong>How to Play:</strong><br>" + (gameRules || "");
    }
    
    if (detailScoreEl) {
      // Get high score from cookies if available
      var highScore = "";
      if (gameKey === "fishing" && typeof Cookies !== "undefined") {
        var fishScore = Cookies.get("fishscore");
        if (fishScore) {
          highScore = "🏆 High Score: " + fishScore + " points";
        }
      } else if (gameKey === "soccer" && typeof Cookies !== "undefined") {
        var soccerScore = Cookies.get("soccerscore");
        if (soccerScore) {
          highScore = "🏆 High Score: " + soccerScore + " goals";
        }
      }
      detailScoreEl.textContent = highScore;
      detailScoreEl.style.display = highScore ? "block" : "none";
    }
    
    // Update action button
    if (detailActionsEl) {
      detailActionsEl.innerHTML = "";
      
      var actionBtn = document.createElement("button");
      actionBtn.className = "nes-btn is-primary";
      actionBtn.style.marginRight = "0.5rem";
      
      if (gameKey === "fishing") {
        // Play Fishing button removed - users should access fishing from the dock sign
        
        // Add fishbook button
        var fishbookBtn = document.createElement("button");
        fishbookBtn.className = "nes-btn is-primary";
        fishbookBtn.textContent = "View Fishbook";
        fishbookBtn.addEventListener("click", function() {
          if (typeof openFishbook === "function") {
            close();
            openFishbook();
          }
        });
        detailActionsEl.appendChild(fishbookBtn);
        
      } else if (gameKey === "soccer") {
        actionBtn.textContent = "Play Soccer";
        actionBtn.addEventListener("click", function() {
          if (typeof choosePlayers === "function") {
            close();
            choosePlayers();
          }
        });
        detailActionsEl.appendChild(actionBtn);
      }
    }
  }

  function hydrateAchievementsTab(rootEl) {
    // Get achievement data
    var itemsCollected = 0;
    var totalItems = 6;
    var coinsCollected = 0;
    var totalCoins = 20;
    var fishCaught = 0;
    var totalFish = 10;
    
    // Count collected items (inventory)
    if (typeof inventory !== "undefined") {
      if (inventory.axe) itemsCollected++;
      if (inventory.wood) itemsCollected++;
      if (inventory.matchbox) itemsCollected++;
      if (inventory.minimap) itemsCollected++;
      if (inventory.resume) itemsCollected++;
      if (inventory.fishingRod) itemsCollected++;
      
      // Count collected coins
      coinsCollected = inventory.coinCount || 0;
    }
    
    // Count caught fish
    if (typeof FISHREP !== "undefined") {
      var fishCollection = FISHREP.getCollection();
      for (var fishKey in fishCollection) {
        if (fishCollection[fishKey] === true) {
          fishCaught++;
        }
      }
    }
    
    // Update progress bars and text
    var itemsProgress = rootEl.querySelector('[data-progress-items]');
    var itemsText = rootEl.querySelector('[data-progress-text-items]');
    if (itemsProgress && itemsText) {
      itemsProgress.value = itemsCollected;
      itemsText.textContent = itemsCollected + ' / ' + totalItems;
      
      // Add success color if complete
      if (itemsCollected >= totalItems) {
        itemsProgress.classList.add('is-success');
      }
    }
    
    var coinsProgress = rootEl.querySelector('[data-progress-coins]');
    var coinsText = rootEl.querySelector('[data-progress-text-coins]');
    if (coinsProgress && coinsText) {
      coinsProgress.value = coinsCollected;
      coinsText.textContent = coinsCollected + ' / ' + totalCoins;
      
      // Add success color if complete
      if (coinsCollected >= totalCoins) {
        coinsProgress.classList.add('is-success');
      }
    }
    
    var fishProgress = rootEl.querySelector('[data-progress-fish]');
    var fishText = rootEl.querySelector('[data-progress-text-fish]');
    if (fishProgress && fishText) {
      fishProgress.value = fishCaught;
      fishText.textContent = fishCaught + ' / ' + totalFish;
      
      // Add success color if complete
      if (fishCaught >= totalFish) {
        fishProgress.classList.add('is-success');
      }
    }
    
    // Move completed achievements to completed section
    var completedList = rootEl.querySelector('[data-role="completed-list"]');
    var inProgressList = rootEl.querySelector('[data-role="in-progress-list"]');
    var completedSection = rootEl.querySelector('[data-role="completed-achievements"]');
    
    if (completedList && inProgressList) {
      // Check each achievement
      var achievementCards = rootEl.querySelectorAll('.achievement-card');
      var hasCompleted = false;
      
      for (var i = 0; i < achievementCards.length; i++) {
        var card = achievementCards[i];
        var achievementKey = card.getAttribute('data-achievement-key');
        var isComplete = false;
        
        if (achievementKey === 'collect-all-items' && itemsCollected >= totalItems) {
          isComplete = true;
        } else if (achievementKey === 'collect-all-coins' && coinsCollected >= totalCoins) {
          isComplete = true;
        } else if (achievementKey === 'collect-all-fish' && fishCaught >= totalFish) {
          isComplete = true;
        }
        
        if (isComplete) {
          hasCompleted = true;
          card.classList.add('completed');
          
          // Remove progress bar and add completed badge
          var progressEl = card.querySelector('.achievement-progress');
          if (progressEl) {
            progressEl.innerHTML = '<div class="achievement-completed-badge">✓ Completed!</div>';
          }
          
          // Move to completed section
          completedList.appendChild(card);
        }
      }
      
      // Show/hide completed section based on whether there are completed achievements
      if (completedSection) {
        completedSection.style.display = hasCompleted ? 'flex' : 'none';
      }
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
        ? "Hide Debug Overlays"
        : "Show Debug Overlays";

      debugBtn.addEventListener("click", function () {
        debugOn = !debugOn;

        // Toggle WORLD_COLLIDERS-based debug via GameWorld (if available)
        // This also toggles z-index debug visualization
        if (
          window.playerController &&
          window.playerController.gameWorld &&
          typeof window.playerController.gameWorld.setColliderDebugEnabled ===
            "function"
        ) {
          window.playerController.gameWorld.setColliderDebugEnabled(debugOn);
        }

        debugBtn.textContent = debugOn
          ? "Hide Debug Overlays"
          : "Show Debug Overlays";
      });
    }

    // Character speed setting
    var speedBtns = rootEl.querySelectorAll('[data-role="set-speed"]');
    if (speedBtns.length > 0) {
      // Get current speed from cookie or default
      var currentSpeed = getCookie("character-speed") || "2.2";
      
      // Update button states based on current speed
      function updateSpeedButtons() {
        speedBtns.forEach(function(btn) {
          var btnSpeed = btn.getAttribute("data-speed");
          if (btnSpeed === currentSpeed) {
            btn.classList.add("is-primary");
          } else {
            btn.classList.remove("is-primary");
          }
        });
      }
      
      // Initialize button states
      updateSpeedButtons();
      
      // Add click handlers
      speedBtns.forEach(function(btn) {
        btn.addEventListener("click", function() {
          var newSpeed = btn.getAttribute("data-speed");
          currentSpeed = newSpeed;
          
          // Save to cookie
          setCookie("character-speed", newSpeed);
          
          // Update button states
          updateSpeedButtons();
          
          // Apply to game world if available
          if (
            window.playerController &&
            window.playerController.gameWorld &&
            typeof window.playerController.gameWorld.setPlayerSpeed === "function"
          ) {
            window.playerController.gameWorld.setPlayerSpeed(parseFloat(newSpeed));
          }
        });
      });
    }

  }

  return {
    init: init,
    open: open,
    close: close,
    switchTab: switchTab,
    openWork: openWork,
    isOpen: function () {
      return isOpen;
    },
  };
})();

// Initialize when DOM is ready
$(function () {
  UnifiedPanel.init();
});



// ---------------------------------------------------------------------------
// Start menu: an RPG-style list that pops out from the side rail. Each item
// opens a page in the unified panel. Arrow keys / Enter / Esc work, and while
// it (or a page) is open the arrow keys don't walk Dylan around.
// ---------------------------------------------------------------------------
var StartMenu = (function () {
  var SECTIONS = [
    ["home", "work", "contact"],
    ["journal", "wardrobe", "backpack", "fishbook", "achievements", "games"],
    ["settings"],
  ];
  var LABELS = {
    home: "About", work: "Work", contact: "Contact", wardrobe: "Wardrobe", backpack: "Bag",
    fishbook: "Fishbook", achievements: "Achievements", games: "Games", journal: "Journal", settings: "Settings",
  };

  var el = null;
  var isOpen = false;

  function build() {
    el = document.createElement("nav");
    el.id = "start-menu";
    el.className = "start-menu";
    el.setAttribute("aria-label", "Menu");
    el.setAttribute("aria-hidden", "true");
    SECTIONS.forEach(function (keys, i) {
      if (i > 0) {
        var hr = document.createElement("div");
        hr.className = "start-menu-divider";
        el.appendChild(hr);
      }
      keys.forEach(function (key) {
        var item = document.createElement("button");
        item.type = "button";
        item.className = "start-menu-item";
        item.setAttribute("data-tab", key);
        item.textContent = LABELS[key];
        item.addEventListener("click", function (e) {
          e.stopPropagation();
          UnifiedPanel.open(key);
        });
        item.addEventListener("mouseenter", function () { item.focus(); });
        el.appendChild(item);
      });
    });
    el.addEventListener("click", function (e) { e.stopPropagation(); });
    document.body.appendChild(el);
  }

  function items() {
    return Array.prototype.slice.call(el.querySelectorAll(".start-menu-item"));
  }

  function open(focusTab) {
    if (!el) build();
    isOpen = true;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    document.body.classList.add("start-menu-open");
    var target = el.querySelector('[data-tab="' + (focusTab || "home") + '"]') || items()[0];
    target.focus();
  }

  function close() {
    if (!el || !isOpen) return;
    isOpen = false;
    el.classList.remove("is-open");
    el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("start-menu-open");
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  var MOVE_KEYS = { 37: 1, 38: 1, 39: 1, 40: 1, 65: 1, 68: 1, 83: 1, 87: 1 };

  // Capture phase, so it runs before the player controller sees the key.
  window.addEventListener(
    "keydown",
    function (e) {
      var typing = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if (isOpen) {
        if (e.keyCode === 27) {
          e.preventDefault();
          close();
          return;
        }
        if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 87 || e.keyCode === 83) {
          e.preventDefault();
          e.stopImmediatePropagation();
          var list = items();
          var i = list.indexOf(document.activeElement);
          var step = e.keyCode === 38 || e.keyCode === 87 ? -1 : 1;
          list[(i + step + list.length) % list.length].focus();
          return;
        }
      }
      // Don't walk Dylan around behind an open menu or page.
      if ((isOpen || UnifiedPanel.isOpen()) && MOVE_KEYS[e.keyCode] && !typing) {
        e.stopImmediatePropagation();
      }
    },
    true
  );

  // Clicking the world closes the menu.
  document.addEventListener("click", function () { close(); });

  return { open: open, close: close, toggle: toggle, isOpen: function () { return isOpen; } };
})();
