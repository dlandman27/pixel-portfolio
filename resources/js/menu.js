// Global game menu toggle & quicklinks
// Depends on jQuery and existing global functions (openPortfolio, openFishbook, openDoc, openTutorial)

$(function () {
  var $toggle = $("#game-menu-toggle");
  var $panel = $("#game-menu-panel");

  if ($toggle.length === 0 || $panel.length === 0) {
    return;
  }

  function closeMenu() {
    $panel.removeClass("is-open");
  }

  function openMenu() {
    $panel.addClass("is-open");
  }

  $toggle.on("click", function (e) {
    e.stopPropagation();
    if ($panel.hasClass("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Clicks inside the panel should not close it
  $panel.on("click", function (e) {
    e.stopPropagation();
  });

  // Clicking anywhere else closes the menu
  $(document).on("click", function () {
    closeMenu();
  });

  // Handle quicklink actions
  $panel.on("click", "[data-menu-action]", function () {
    var action = $(this).attr("data-menu-action");
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
      default:
        break;
    }
  });
});


