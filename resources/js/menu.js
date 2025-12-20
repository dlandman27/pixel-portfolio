// Global game menu toggle & quicklinks
// Depends on jQuery and existing global functions (openPortfolio, openFishbook, openDoc, openTutorial)

$(function () {
  var $toggle = $("#game-menu-toggle");
  var $panel = $("#game-menu-panel");

  if ($toggle.length === 0 || $panel.length === 0) {
    return;
  }

  function closeMenu() {
    document.body.classList.remove("game-menu-open");
  }

  function openMenu() {
    document.body.classList.add("game-menu-open");
  }

  // Toggle menu on hamburger click
  $toggle.click(function (e) {
    e.stopPropagation();
    if (document.body.classList.contains("game-menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Handle clicks inside the panel (including quicklink actions)
  $panel.click(function (e) {
    e.stopPropagation();
    var $target = $(e.target);
    var action = $target.attr("data-menu-action");
    if (!action) return;

    closeMenu();

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
        // Center map or reset position if such a helper exists later
        if (typeof centerMap === "function") centerMap();
        break;
      default:
        break;
    }
  });

  // Clicking anywhere else closes the menu
  $(document).click(function () {
    closeMenu();
  });
});


