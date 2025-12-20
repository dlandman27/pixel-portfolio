// Global game menu toggle & quicklinks
// Depends on jQuery and existing global functions (openPortfolio, openFishbook, openDoc, openTutorial)

$(function () {
  var $navToggle = $("#game-menu-toggle");
  var $navPanel = $("#game-menu-panel");
  var $statusToggle = $("#status-menu-toggle");
  var $statusPanel = $("#status-menu-panel");
  var $backdrop = $(".game-menu-backdrop");

  if ($navToggle.length === 0 || $navPanel.length === 0) {
    return;
  }

  function closeAllMenus() {
    document.body.classList.remove("game-menu-open");
    document.body.classList.remove("status-menu-open");
  }

  function openNavMenu() {
    document.body.classList.add("game-menu-open");
    document.body.classList.remove("status-menu-open");
  }

  function openStatusMenu() {
    document.body.classList.add("status-menu-open");
    document.body.classList.remove("game-menu-open");
    updateStatusPanel();
  }

  function updateStatusPanel() {
    if (typeof inventory === "undefined") return;
    var items = [
      { key: "backpack", selector: ".status-item.status-backpack" },
      { key: "minimap", selector: ".status-item.status-minimap" },
      { key: "axe", selector: ".status-item.status-axe" },
      { key: "wood", selector: ".status-item.status-wood" },
      { key: "matchbox", selector: ".status-item.status-matches" },
      { key: "resume", selector: ".status-item.status-resume" },
      { key: "fishingRod", selector: ".status-item.status-fishingRod" },
      { key: "fishbook", selector: ".status-item.status-fishbook" },
    ];

    items.forEach(function (item) {
      var $row = $(item.selector);
      if (!$row.length) return;
      var hasItem = !!inventory[item.key];
      $row.toggleClass("owned", hasItem);
      $row.toggleClass("missing", !hasItem);
      $row.find(".status-item-state").text(hasItem ? "Unlocked" : "Missing");
    });
  }

  // Toggle main nav menu on hamburger click
  $navToggle.click(function (e) {
    e.stopPropagation();
    if (document.body.classList.contains("game-menu-open")) {
      closeAllMenus();
    } else {
      openNavMenu();
    }
  });

  // Toggle status / backpack panel
  if ($statusToggle.length) {
    $statusToggle.click(function (e) {
      e.stopPropagation();
      if (document.body.classList.contains("status-menu-open")) {
        closeAllMenus();
      } else {
        openStatusMenu();
      }
    });
  }

  // Handle clicks inside the nav panel (including quicklink actions)
  $navPanel.click(function (e) {
    e.stopPropagation();
    var $target = $(e.target);
    var action = $target.attr("data-menu-action");
    if (!action) return;

    closeAllMenus();

    switch (action) {
      case "portfolio":
        if (typeof openPortfolio === "function") openPortfolio();
        break;
      case "fishbook":
        if (typeof openFishbook === "function") openFishbook();
        break;
      case "resume":
        // Use location=2 to bypass in-world resume gate for quick menu
        if (typeof openDoc === "function") openDoc(2);
        break;
      case "tutorial":
        if (typeof openTutorial === "function") openTutorial();
        break;
      case "inventory":
        if (typeof openInventory === "function") openInventory();
        break;
      case "map":
        // Center map using WORLD helper if available
        if (typeof WORLD !== "undefined" && typeof WORLD.centerMap === "function") {
          WORLD.centerMap();
        }
        break;
      case "reset-items":
        if (typeof resetAllItems === "function") {
          // Show confirmation dialog
          if (confirm("Are you sure you want to reset all items? This will clear your progress and reload the page.")) {
            resetAllItems();
          }
        }
        break;
      default:
        break;
    }
  });

  // Clicking backdrop or anywhere else closes menus
  if ($backdrop.length) {
    $backdrop.click(function () {
      closeAllMenus();
    });
  }

  $(document).click(function () {
    closeAllMenus();
  });
});


