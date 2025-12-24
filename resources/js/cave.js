// cave.js
// Builds the cave scene DOM from TIMELINE_ENTRIES config.
(function () {
  $(function () {
    if (typeof TIMELINE_ENTRIES === "undefined") return;
    var $cave = $("#cave");
    if (!$cave.length) {
      $cave = $('<div id="cave"></div>');
      $("body").append($cave);
    }

    var $hall = $('<div class="cave-hall"></div>');
    var $overlayLeft = $('<div class="cave-dark left"></div>');
    var $overlayRight = $('<div class="cave-dark right"></div>');
    var $exit = $('<div class="cave-exit" aria-label="Exit cave"></div>');

    $cave.empty();
    $cave.append($overlayLeft);
    $cave.append($overlayRight);
    $cave.append($hall);
    $cave.append($exit);

    // Render timeline signs
    TIMELINE_ENTRIES.forEach(function (entry, idx) {
      var side = entry.side === "right" ? "right" : "left";
      var $sign = $('<div class="cave-sign ' + side + '"></div>');
      var $label = $('<div class="cave-sign-label"></div>');
      var year = entry.year || "";
      var title = entry.title || "";
      var desc = entry.description || "";
      $label.append("<div class='year'>" + year + "</div>");
      $label.append("<div class='title'>" + title + "</div>");
      $label.append("<div class='desc'>" + desc + "</div>");
      $sign.css("top", (entry.y || 0) + "px");
      $sign.append($('<div class="post"></div>'));
      $sign.append($('<div class="plank"></div>'));
      $sign.append($label);
      $cave.append($sign);
    });
  });
})();

