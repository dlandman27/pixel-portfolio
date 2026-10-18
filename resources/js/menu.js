// Menu button: toggles the start menu (resources/js/unified-panel.js), or closes an open page.

$(function () {
  $("#game-menu-toggle").click(function (e) {
    e.stopPropagation();
    if (typeof UnifiedPanel === "undefined") return;
    if (UnifiedPanel.isOpen()) {
      UnifiedPanel.close();
    } else if (typeof StartMenu !== "undefined") {
      StartMenu.toggle();
    } else {
      UnifiedPanel.open("home");
    }
  });
});

// "My Work" shortcut + shareable deep links:
//   #work            -> opens the Work tab
//   #project=<id>    -> opens that project's lightbox (ids from portfolio.config.js)
$(function () {
  $("#work-shortcut").click(function (e) {
    e.stopPropagation();
    if (typeof UnifiedPanel === "undefined") return;
    if (UnifiedPanel.isOpen()) {
      UnifiedPanel.switchTab("work");
    } else {
      UnifiedPanel.open("work");
    }
  });

  // Keep the URL in sync with the open project so it can be copied and shared.
  if (typeof openProjectLightbox === "function" && typeof closeProjectLightbox === "function") {
    var originalOpen = openProjectLightbox;
    window.openProjectLightbox = function (projectId) {
      originalOpen.apply(this, arguments);
      if (window.history && history.replaceState) {
        history.replaceState(null, "", "#project=" + encodeURIComponent(projectId));
      }
    };
  }

  function clearProjectHash() {
    if (/^#project=/.test(location.hash) && window.history && history.replaceState) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  // Runs after unified-panel.js has wrapped closeProjectLightbox (that file loads later).
  $(window).load(function () {
    var wrappedClose = window.closeProjectLightbox;
    window.closeProjectLightbox = function () {
      clearProjectHash();
      return wrappedClose.apply(this, arguments);
    };
  });

  function openFromHash() {
    var hash = decodeURIComponent(location.hash || "");
    var projectMatch = hash.match(/^#project=(.+)$/);
    if (projectMatch && typeof getProjectById === "function" && getProjectById(projectMatch[1])) {
      waitFor(function () { return $(".project-lightbox").length > 0; }, function () {
        openProjectLightbox(projectMatch[1]);
      });
    } else if (hash === "#work" && typeof UnifiedPanel !== "undefined") {
      UnifiedPanel.open("work");
    }
  }

  function waitFor(check, done, triesLeft) {
    if (triesLeft === undefined) triesLeft = 50;
    if (check()) return done();
    if (triesLeft > 0) setTimeout(function () { waitFor(check, done, triesLeft - 1); }, 100);
  }

  // Wait for the loading screen to clear so the panel isn't hidden behind it.
  $(window).load(function () {
    setTimeout(openFromHash, 2900);
  });
  $(window).bind("hashchange", openFromHash);
});
