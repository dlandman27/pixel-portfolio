// inventory.js
// Inventory state, cookies, and item pick‑up logic

// ----------------------
// Cookie helpers
// ----------------------
function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue + ";" + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Optional, still used for the title screen flag
function checkCookie() {
  setCookie("title-screen", true);
}

// ----------------------
// Inventory data
// ----------------------
let inventory = {
  axe: false,
  wood: false,
  minimap: false,
  backpack: false,
  matchbox: false,
  resume: false,
  fishingRod: false,
  fishbook: false,
};

// ----------------------
// Fish collection classes
// ----------------------
class Fish {
  constructor(name, image, weight, width, bio, imageNotFound) {
    this.name = name;
    this.image = image;
    this.weight = weight;
    this.width = width;
    this.bio = bio;
    this.imageNotFound = imageNotFound;
  }
  getName = () => this.name;
  getImage = () => this.image;
  getWeight = () => this.weight;
  getWidth = () => this.width;
  getBio = () => this.bio;
  getImageNotFound = () => this.imageNotFound;
}

class FishBook {
  constructor() {
    this.fishbook = {};
    this.collection = {
      shark: false,
      clownfish: false,
      guinneafish: false,
      blobfish: false,
      whale: false,
      turtle: false,
      blowfish: false,
      surgeonfish: false,
      bettafish: false,
      sunfish: false,
    };
  }
  getShark = () =>
    new Fish(
      "Shark",
      URL.getFishing() + "/shark.png)",
      26,
      100,
      "This is'nt no good white shark",
      URL.getFishing() + "/shark-not-found.png)"
    );
  getBettaFish = () =>
    new Fish(
      "Bettafish",
      URL.getFishing() + "/betta-fish.png)",
      18,
      24,
      "He's still a testing fish",
      URL.getFishing() + "/bettafish-not-found.png)"
    );
  getBlobFish = () =>
    new Fish(
      "Blobfish",
      URL.getFishing() + "/blob-fish.png)",
      20,
      32,
      "The cutest fish in the sea",
      URL.getFishing() + "/blob-fish-not-found.png)"
    );
  getBlowFish = () =>
    new Fish(
      "Blowfish",
      URL.getFishing() + "/blow-fish.png)",
      18,
      40,
      "Someone is looking bloated...",
      URL.getFishing() + "/blowfish-not-found.png)"
    );
  getWhale = () =>
    new Fish(
      "Whale",
      URL.getFishing() + "/blue-whale.png)",
      26,
      128,
      "I must have a strong fishing line...",
      URL.getFishing() + "/blue-whale-not-found.png)"
    );
  getClownFish = () =>
    new Fish(
      "Clownfish",
      URL.getFishing() + "/clown-fish.png)",
      12,
      24,
      "This is a funny one",
      URL.getFishing() + "/clownfish-not-found.png)"
    );
  getGuinneaFish = () =>
    new Fish(
      "Guinneafish",
      URL.getFishing() + "/guinnea-fish.png)",
      18,
      32,
      "Straight from the lab",
      URL.getFishing() + "/guinneafish-not-found.png)"
    );
  getSunFish = () =>
    new Fish(
      "Sunfish",
      URL.getFishing() + "/sunfish.png)",
      14,
      24,
      "Thankfully it's daytime",
      URL.getFishing() + "/sun-fish-not-found.png)"
    );
  getSurgeonFish = () =>
    new Fish(
      "Surgeonfish",
      URL.getFishing() + "/surgeonfish.png)",
      16,
      24,
      "That one took guts",
      URL.getFishing() + "/surgeonfish-not-found.png)"
    );
  getTurtle = () =>
    new Fish(
      "Turtle",
      URL.getFishing() + "/turtle.png)",
      22,
      48,
      "Quick! Take a Shellfie!",
      URL.getFishing() + "/turtle-not-found.png)"
    );
  getCollection = () => this.collection;
  getFish = (fish) =>
    fish == "shark"
      ? this.getShark()
      : fish == "whale"
      ? this.getWhale()
      : fish == "guinneafish"
      ? this.getGuinneaFish()
      : fish == "clownfish"
      ? this.getClownFish()
      : fish == "blowfish"
      ? this.getBlowFish()
      : fish == "blobfish"
      ? this.getBlobFish()
      : fish == "turtle"
      ? this.getTurtle()
      : fish == "surgeonfish"
      ? this.getSurgeonFish()
      : fish == "sunfish"
      ? this.getSunFish()
      : fish == "bettafish"
      ? this.getBettaFish()
      : -1;
}

var FISHREP = new FishBook();

// ----------------------
// Restore inventory from cookies
// ----------------------
function setVariables() {
  if (getCookie("backpack") != "") {
    inventory.backpack = true;
    $("#backpack").css("opacity", "0");
    if (window.innerWidth > 600)
      $("#backpack-icon").css("visibility", "visible");
  }

  if (getCookie("axe") != "") {
    inventory.axe = true;
    $("#stump").css(
      "background-image",
      URL.getNature() + "/stump-without-axe.png)"
    );
    $(".inventory-slot.axe").css(
      "background-image",
      URL.getMisc() + "/axe-icon-found.png)"
    );
  }

  if (getCookie("matchbox") != "") {
    inventory.matchbox = true;
    $(".matchbox").css("display", "none");
    $(".inventory-slot.matches").css(
      "background-image",
      URL.getMisc() + "/matchbox-icon-found.png)"
    );
  }

  if (getCookie("resume") != "") {
    inventory.resume = true;
    $(".paper").css("display", "none");
    $(".inventory-slot.resume").css(
      "background-image",
      URL.getMisc() + "/resume-icon-found.png)"
    );
  }

  if (getCookie("minimap") != "") {
    inventory.minimap = true;
    $(".scroll").css("display", "none");
    $(".minimap-icon").css("display", "block");
    
    // Initialize minimap widget if map was already collected
    if (typeof initMinimapWidget === "function") {
      setTimeout(function() {
        initMinimapWidget();
      }, 100);
    }
  }

  if (getCookie("fishing-rod") != "") {
    inventory.fishingRod = true;
    $(".fishing-rod").css("display", "none");
    $(".inventory-slot.fishingRod").css(
      "background-image",
      URL.getMisc() + "/fishing-rod-found.png)"
    );
  }

  if (getCookie("tree-fallen") != "") {
    hitCount = 8;
    $("#falling-tree").css(
      "background-image",
      URL.getFallingTree() + "/falling-tree-" + 7 + ".png)"
    );
    $("#wood-log").css("visibility", "visible");
    $("#wood-log").css({ top: 320 + "px", left: 252 + "px" });
    if (getCookie("wood")) {
      inventory.wood = true;
      $("#wood-log").css("display", "none");
      $(".inventory-slot.wood").css(
        "background-image",
        URL.getMisc() + "/wood-icon-found.png)"
      );
    }
  }

  if (getCookie("fishbook") != "") {
    inventory.fishbook = true;
    $(".book-item").css("display", "none");
    $(".inventory-slot.book").css(
      "background-image",
      URL.getMisc() + "/fishbook-icon-found.png)"
    );
  }

  var names = [
    "shark",
    "whale",
    "turtle",
    "sunfish",
    "blowfish",
    "blobfish",
    "clownfish",
    "bettafish",
    "guinneafish",
    "surgeonfish",
  ];

  names.map((x) => (getCookie(x) != "" ? enableFish(x) : 0));

  function enableFish(x) {
    $(".fish." + x).css("background-image", FISHREP.getFish(x).getImage());
    FISHREP.collection[x] = true;
  }
}

// ----------------------
// Inventory UI (backpack)
// ----------------------
var openBag = false;

function openInventory() {
  var backpackURL = URL.getMisc();
  if (!openBag) {
    $("#backpack-icon").css("opacity", "1");
    $(".inventory-slot").css("visibility", "visible");
    $("#backpack-icon").css("background-image", backpackURL + "/x-icon.png)");
    openBag = true;
    $(".inventory-slot.axe").animate({ marginTop: "-144px" });
    $(".inventory-slot.wood").animate({ marginTop: "-288px" });
    $(".inventory-slot.matches").animate({ marginLeft: "-288px" });
    $(".inventory-slot.resume").animate({
      marginLeft: "-144px",
      marginTop: "-144px",
    });
    $(".inventory-slot.fishingRod").animate({
      marginLeft: "-144px",
      marginTop: "-288px",
    });
    $(".inventory-slot.book").animate({ marginLeft: "-144px" });
  } else {
    $("#backpack-icon").css(
      "background-image",
      backpackURL + "/backpack-icon.png)"
    );
    openBag = false;
    $(".inventory-slot").animate({
      marginTop: "0px",
      marginLeft: "0px",
    });
  }
  inventory.backpack = true;
}

// ----------------------
// Pick‑up functions
// ----------------------
function takeBook() {
  if (
    parseInt($("#dylan").css("left")) >= 764 &&
    parseInt($("#dylan").css("left")) <= 1208 &&
    parseInt($("#dylan").css("top")) >= 1068 &&
    parseInt($("#dylan").css("top")) <= 1240
  ) {
    if (inventory.backpack && !inventory.fishbook) {
      $(".book-item").css("visibility", "hidden");
      inventory.fishbook = true;

      setCookie("fishbook", "true");

      $(".inventory-slot.book").css(
        "background-image",
        URL.getMisc() + "/fishbook-icon-found.png)"
      );
      showItemPickupAnimation("fishbook");
      checkIfComplete();
    } else if (!inventory.fishbook) {
      $(".nes-balloon.from-left p").text(
        "Hmm... If only I had a place to store this"
      );
      $(".nes-balloon.from-left").css({
        display: "block",
        top: "-90px",
      });
      setTimeout(function () {
        $(".nes-balloon.from-left").fadeOut();
      }, 1300);
    }
  }
}

function takeMatchbox() {
  if (parseInt($("#dylan").css("left")) <= 168) {
    if (inventory.backpack && !inventory.matchbox) {
      inventory.matchbox = true;
      setCookie("matchbox", true);
      $(".achievement").css("background-color", "#3EB489");
      $(".matchbox").css("display", "none");
      $(".inventory-slot.matches").css(
        "background-image",
        URL.getMisc() + "/matchbox-icon-found.png)"
      );
      showItemPickupAnimation("matchbox");
      checkIfComplete();
    } else if (!inventory.matchbox) {
      $(".nes-balloon.from-left p").text(
        "Hmm... If only I had a place to store this"
      );
      $(".nes-balloon.from-left").css({
        display: "block",
        top: "-90px",
      });
      setTimeout(function () {
        $(".nes-balloon.from-left").fadeOut();
      }, 1000);
    }
  }
}

function takeFishingRod() {
  if (parseInt($("#dylan").css("top")) >= 1208) {
    if (inventory.backpack && !inventory.fishingRod) {
      inventory.fishingRod = true;
      setCookie("fishing-rod", true);
      $(".fishing-rod").css("display", "none");
      $(".inventory-slot.fishingRod").css(
        "background-image",
        URL.getMisc() + "/fishing-rod-found.png)"
      );
      showItemPickupAnimation("fishingRod");
      checkIfComplete();
    } else if (!inventory.fishingRod) {
      $(".nes-balloon.from-left p").text(
        "Hmm... If only I had a place to store this"
      );
      $(".nes-balloon.from-left").css({
        display: "block",
        top: "-90px",
      });
      setTimeout(function () {
        $(".nes-balloon.from-left").fadeOut();
      }, 1000);
    }
  }
}

function takeAxe() {
  if (
    parseInt($("#dylan").css("left")) >= 272 &&
    parseInt($("#dylan").css("left")) <= 412 &&
    parseInt($("#dylan").css("top")) <= 492
  ) {
    if (inventory.backpack && !inventory.axe) {
      $("#dylan").css({
        left: 412 + "px",
        top: 396 + "px",
      });
      $("#map").css({
        marginLeft: 1728 + "px",
        marginTop: -576 + "px",
      });
      eventOccurence = true;
      var url = URL.getNature();
      var dylanURL = URL.getDylan() + "/axe/pickup";
      var i = 1;
      var wait = 0;
      var grabAxe = setInterval(function () {
        if (i > 3) {
          $("#stump").css("background-image", url + "/stump-without-axe.png)");
          $("#dylan").css("background-size", "40px").css("width", "40px");
          showItemPickupAnimation("axe");
        }
        if (i > 6) {
          eventOccurence = false;
          $("#dylan").css("background-size", "32px").css("width", "32px");
          clearInterval(grabAxe);
          $("#dylan").css(
            "background-image",
            URL.getDylan() + "/dylan-left-" + 1 + ".png)"
          );
        } else if (wait < 5 && i == 3) {
          wait++;
          $("#dylan").css(
            "background-image",
            dylanURL + "/dylan-axe-" + i + ".png)"
          );
        } else {
          $("#dylan").css(
            "background-image",
            dylanURL + "/dylan-axe-" + i + ".png)"
          );
          i++;
        }
      }, 80);

      inventory.axe = true;
      setCookie("axe", true);
      $(".inventory-slot.axe").css(
        "background-image",
        URL.getMisc() + "/axe-icon-found.png)"
      );

      checkIfComplete();
    } else if (!inventory.axe) {
      $(".nes-balloon.from-left p").text(
        "Hmm... If only I had a place to store this"
      );
      $(".nes-balloon.from-left").css({
        display: "block",
        top: "-90px",
      });
      setTimeout(function () {
        $(".nes-balloon.from-left").fadeOut();
      }, 1300);
    }
  }
}

function takeWood() {
  $("#wood-log").css("visibility", "hidden");
  inventory.wood = true;
  setCookie("wood", "true");
  $(".inventory-slot.wood").css(
    "background-image",
    URL.getMisc() + "/wood-icon-found.png)"
  );
  showItemPickupAnimation("wood");
  checkIfComplete();
}

function takeMap() {
  if (
    parseInt($("#dylan").css("left")) >= 756 &&
    parseInt($("#dylan").css("left")) <= 1200 &&
    parseInt($("#dylan").css("top")) >= 312 &&
    parseInt($("#dylan").css("top")) <= 552
  ) {
    $(".minimap-icon").css("display", "block");
    $(".scroll").css("display", "none");
    inventory.minimap = true;
    showItemPickupAnimation("minimap");
    setCookie("minimap", "true");
    
    // Initialize minimap widget (but don't show it yet)
    if (typeof initMinimapWidget === "function") {
      setTimeout(function() {
        initMinimapWidget();
      }, 100);
    }
    
    checkIfComplete();
  }
}

function takeResume() {
  if (
    parseInt($("#dylan").css("left")) >= 1544 &&
    parseInt($("#dylan").css("top")) >= 952 &&
    parseInt($("#dylan").css("top")) <= 1100
  ) {
    if (inventory.backpack && !inventory.resume) {
      $(".paper").css("visibility", "hidden");
      inventory.resume = true;
      setCookie("resume", "true");

      $(".inventory-slot.resume").css(
        "background-image",
        URL.getMisc() + "/resume-icon-found.png)"
      );
      showItemPickupAnimation("resume");
      checkIfComplete();
    } else if (!inventory.resume) {
      $(".nes-balloon.from-left p").text(
        "Hmm... If only I had a place to store this"
      );
      $(".nes-balloon.from-left").css({
        display: "block",
        top: "-90px",
      });
      setTimeout(function () {
        $(".nes-balloon.from-left").fadeOut();
      }, 1300);
    }
  }
}

function enableBackpack() {
  if (
    parseInt($("#dylan").css("top")) > 680 &&
    parseInt($("#dylan").css("left")) >= 1348
  ) {
    inventory.backpack = true;
    setCookie("backpack", true);
    $("#backpack").css("opacity", "0");
    if (window.innerWidth > 600)
      $("#backpack-icon").css("visibility", "visible");
    showItemPickupAnimation("backpack");
  }
}

// ----------------------
// Item pickup animation (Totem of Undying style)
// ----------------------
function showItemPickupAnimation(itemType) {
  console.log('showItemPickupAnimation called with:', itemType);
  
  // Map item types to their icon URLs (using map item images, not inventory icons)
  // inventory slot selectors, and display names
  var itemMap = {
    "axe": {
      icon: URL.getNature() + "/stump-with-axe.png)",
      slot: ".inventory-slot.axe",
      name: "Axe"
    },
    "wood": {
      icon: URL.getNature() + "/wood-log.png)",
      slot: ".inventory-slot.wood",
      name: "Wood"
    },
    "matchbox": {
      icon: URL.getMisc() + "/matchbox.png)",
      slot: ".inventory-slot.matches",
      name: "Matchbox"
    },
    "resume": {
      icon: URL.getMisc() + "/paper.png)",
      slot: ".inventory-slot.resume",
      name: "Resume"
    },
    "minimap": {
      icon: URL.getMisc() + "/map-icon.png)",
      slot: ".inventory-slot.minimap",
      name: "Map"
    },
    "fishingRod": {
      icon: URL.getFishing() + "/fishing-rod.png)",
      slot: ".inventory-slot.fishingRod",
      name: "Fishing Rod"
    },
    "fishbook": {
      icon: URL.getMisc() + "/fishbook.png)",
      slot: ".inventory-slot.book",
      name: "Fishbook"
    },
    "backpack": {
      icon: URL.getMisc() + "/backpack.png)",
      slot: "#backpack-icon",
      name: "Backpack"
    }
  };

  var item = itemMap[itemType];
  if (!item) {
    console.log('Item not found in map:', itemType);
    return;
  }
  
  console.log('Item found:', item);

  // Get target position (inventory slot or backpack icon)
  var $target = $(item.slot);
  if ($target.length === 0) {
    // Fallback to backpack icon if slot not found
    $target = $("#backpack-icon");
  }

  // Get target position - try multiple methods
  var targetOffset = $target.offset();
  
  // If element is hidden or offset() returns null, calculate position manually
  if (!targetOffset || $target.css('visibility') === 'hidden' || $target.css('display') === 'none') {
    // For fixed elements, use position() or calculate from viewport
    var position = $target.position();
    if (position && (position.left !== 0 || position.top !== 0)) {
      targetOffset = {
        left: position.left,
        top: position.top
      };
    } else {
      // Default to top-right corner (where backpack usually is)
      targetOffset = {
        left: window.innerWidth - 150,
        top: 20
      };
    }
  }

  // Create the animated icon element using img tag for better compatibility
  var imageUrl = item.icon;
  // Extract the actual path from CSS url() format
  // URL format is: "url(resources/images/misc/icon.png)"
  // We need: "resources/images/misc/icon.png"
  var cleanUrl = imageUrl.replace(/^url\(/, '').replace(/\)$/, '');
  
  var $icon = $('<img class="item-pickup-animation" src="' + cleanUrl + '" />');
  
  $icon.css({
    position: 'fixed',
    width: '256px',
    height: '256px',
    objectFit: 'contain',
    left: '50%',
    top: '50%',
    marginLeft: '-128px',
    marginTop: '-128px',
    zIndex: 10000000,
    pointerEvents: 'none',
    opacity: 1,
    display: 'block',
    visibility: 'visible'
  });

  // Create dark overlay for the screen
  var $overlay = $('<div class="item-pickup-overlay"></div>');
  $overlay.css({
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999999,
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s ease-in'
  });

  // Create text label for the item
  var $label = $('<div class="item-pickup-label">' + item.name + ' found</div>');
  $label.css({
    position: 'fixed',
    left: '50%',
    top: 'calc(50% + 150px)', // Position below the icon
    transform: 'translateX(-50%)',
    zIndex: 10000001,
    pointerEvents: 'none',
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '16px',
    color: '#fff',
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
    opacity: 0,
    display: 'block',
    whiteSpace: 'nowrap'
  });

  $('body').append($overlay);
  $('body').append($icon);
  $('body').append($label);
  console.log('Icon element appended, image URL:', imageUrl);

  // Force a reflow to ensure element is rendered before animation
  void $icon[0].offsetHeight;
  void $label[0].offsetHeight;

  // Small delay to ensure DOM is ready, then start shake animation
  setTimeout(function() {
    // Fade in the overlay and label
    $overlay.css('opacity', 1);
    $label.css({
      opacity: 1,
      transition: 'opacity 0.3s ease-in'
    });
    
    // Phase 1: Shake animation (0.8 seconds)
    $icon.addClass('item-pickup-shake');
    
    // After shake completes (800ms), fly to backpack
    setTimeout(function() {
      // Fade out the overlay and label before flying
      $overlay.css({
        opacity: 0,
        transition: 'opacity 0.3s ease-out'
      });
      $label.css({
        opacity: 0,
        transition: 'opacity 0.2s ease-out'
      });
      
      // Remove shake class and reset transform for smooth transition
      $icon.removeClass('item-pickup-shake');
      $icon.css('transform', 'translate(0, 0) scale(1) rotate(0deg)');
      
      // Remove overlay and label after fade out
      setTimeout(function() {
        $overlay.remove();
        $label.remove();
      }, 300);
      
      // Small delay to ensure transform reset
      setTimeout(function() {
        // Phase 2: Fly to backpack (0.6 seconds)
        var endLeft = targetOffset.left;
        var endTop = targetOffset.top;
        
        // Adjust for icon size difference (target is 128px, we're animating 256px)
        endLeft = endLeft - 64;
        endTop = endTop - 64;
        
        $icon.css({
          left: endLeft + 'px',
          top: endTop + 'px',
          marginLeft: '0',
          marginTop: '0',
          width: '128px',
          height: '128px',
          transform: 'translate(0, 0) scale(1) rotate(0deg)',
          transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        // Phase 3: Fade out and remove (after 600ms flight)
        setTimeout(function() {
          $icon.css({
            opacity: 0,
            transform: 'scale(0.5)',
            transition: 'all 0.3s ease-out'
          });
          
          setTimeout(function() {
            $icon.remove();
          }, 300);
        }, 600);
      }, 50);
    }, 800);
  }, 10);
}

// ----------------------
// Completion check
// ----------------------
function checkIfComplete() {
  if (!Object.values(inventory).includes(false)) {
    // Use achievement for completion since it's special
    $(".achievement").css("background-color", "goldenrod");
    $(".achievement").css("display", "block").fadeIn();
    $(".achievement-name").text("Strapped Up");
    $(".achievement-description").text("Collect All Items");
    setTimeout(function () {
      $(".achievement").fadeOut();
    }, 5000);
  }
}

// ----------------------
// Reset all items function
// ----------------------
function deleteCookie(cname) {
  document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function resetAllItems() {
  // List of all inventory-related cookies to delete
  var cookiesToDelete = [
    "backpack",
    "axe",
    "matchbox",
    "resume",
    "minimap",
    "fishing-rod",
    "tree-fallen",
    "wood",
    "fishbook",
    // Fish collection cookies
    "shark",
    "whale",
    "turtle",
    "sunfish",
    "blowfish",
    "blobfish",
    "clownfish",
    "bettafish",
    "guinneafish",
    "surgeonfish"
  ];

  // Delete all cookies
  cookiesToDelete.forEach(function(cookieName) {
    deleteCookie(cookieName);
  });

  // Reset inventory object
  inventory = {
    axe: false,
    wood: false,
    minimap: false,
    backpack: false,
    matchbox: false,
    resume: false,
    fishingRod: false,
    fishbook: false,
  };

  // Reset fish collection
  FISHREP.collection = {
    shark: false,
    clownfish: false,
    guinneafish: false,
    blobfish: false,
    whale: false,
    turtle: false,
    blowfish: false,
    surgeonfish: false,
    bettafish: false,
    sunfish: false,
  };

  // Reset UI elements
  $("#backpack").css("opacity", "1");
  $("#backpack-icon").css("visibility", "hidden");
  $(".inventory-slot").css("visibility", "hidden");
  $(".inventory-slot").css({
    "background-image": "url(" + URL.getMisc() + "/inventory-slot-empty.png)"
  });

  // Reset world state
  $("#stump").css(
    "background-image",
    URL.getNature() + "/stump-with-axe.png)"
  );
  $(".matchbox").css("display", "block");
  $(".paper").css("display", "block").css("visibility", "visible");
  $(".scroll").css("display", "block");
  $(".minimap-icon").css("display", "none");
  $(".fishing-rod").css("display", "block");
  $(".book-item").css("display", "block").css("visibility", "visible");
  
  // Reset tree state
  if (typeof hitCount !== "undefined") {
    hitCount = 1;
  }
  $("#falling-tree").css("width", "0");
  $("#falling-tree").css("background-image", "");
  $("#wood-log").css("visibility", "hidden").css("display", "block");

  // Reset bonfire state if it exists
  if (typeof woodOnFire !== "undefined") {
    woodOnFire = false;
  }
  $("#bonfire").css('background-image', URL.getBonfire() + '/bonfire-no-wood.png)');

  // Reset fish collection UI
  var fishNames = [
    "shark", "whale", "turtle", "sunfish", "blowfish",
    "blobfish", "clownfish", "bettafish", "guinneafish", "surgeonfish"
  ];
  fishNames.forEach(function(fishName) {
    $(".fish." + fishName).css(
      "background-image",
      FISHREP.getFish(fishName).getImageNotFound()
    );
  });

  // Close inventory if open
  if (openBag) {
    openInventory();
  }

  // Show confirmation
  $(".achievement").css("background-color", "#3EB489");
  $(".achievement").css("display", "block").fadeIn();
  $(".achievement-name").text("Items Reset");
  $(".achievement-description").text("All items have been reset");
  setTimeout(function () {
    $(".achievement").fadeOut();
  }, 3000);

  // Reload page to fully reset state
  setTimeout(function() {
    location.reload();
  }, 1000);
}
