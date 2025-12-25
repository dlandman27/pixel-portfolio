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
  matchbox: false,
  resume: false,
  fishingRod: false,
  fishbook: false,
  coins: [], // Array of collected coin IDs
  coinCount: 0 // Total coins collected
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
  
  // Restore collected coins
  var coinsCookie = getCookie("coins");
  if (coinsCookie != "") {
    try {
      inventory.coins = JSON.parse(coinsCookie);
      inventory.coinCount = inventory.coins.length;
    } catch (e) {
      inventory.coins = [];
      inventory.coinCount = 0;
    }
  }
  
  // Initialize coins on the map
  if (typeof COIN_CONFIG !== "undefined") {
    initCoins();
  }
}

// ----------------------
// Coin System
// ----------------------
function initCoins() {
  if (typeof COIN_CONFIG === "undefined" || !COIN_CONFIG.coins) {
    return;
  }
  // Coins temporarily disabled.
  return;
  
  var $map = $("#map");
  if ($map.length === 0) {
    return;
  }
  
  // Create coin elements
  COIN_CONFIG.coins.forEach(function(coin) {
    // Skip if coin already collected
    if (inventory.coins.indexOf(coin.id) !== -1) {
      return;
    }
    
    var $coin = $('<div class="coin-item" data-coin-id="' + coin.id + '">' +
      '<i class="nes-icon coin is-small"></i>' +
      '</div>');
    
    $coin.css({
      zIndex: 1000,
      width: '16px',
      height: '16px',
      cursor: 'pointer',
      position: 'absolute',
      top: coin.top + 'px',
      pointerEvents: 'auto',
      left: coin.left + 'px',
    });
    
    $map.append($coin);
  });
}

function checkCoinCollection() {
  if (typeof COIN_CONFIG === "undefined" || !COIN_CONFIG.coins) {
    return;
  }
  
  // Get Dylan's position relative to the map container
  var $dylan = $("#dylan");
  var $map = $("#map");
  
  if ($dylan.length === 0 || $map.length === 0) {
    return;
  }
  
  // Get Dylan's position (relative to map container)
  var dylanLeft = parseInt($dylan.css("left")) || 0;
  var dylanTop = parseInt($dylan.css("top")) || 0;
  
  // Dylan is 32px wide, so center is at left + 16
  var dylanCenterX = dylanLeft + 16;
  var dylanCenterY = dylanTop + 16;
  
  // Check each coin
  $(".coin-item").each(function() {
    var $coin = $(this);
    var coinId = $coin.attr("data-coin-id");
    
    // Skip if already collected
    if (inventory.coins.indexOf(coinId) !== -1) {
      return;
    }
    
    // Get coin position (absolute within map)
    var coinLeft = parseInt($coin.css("left")) || 0;
    var coinTop = parseInt($coin.css("top")) || 0;
    
    // Coin center (8px for 16px coin)
    var coinCenterX = coinLeft + 8;
    var coinCenterY = coinTop + 8;
    
    // Calculate distance between centers
    var distance = Math.sqrt(
      Math.pow(dylanCenterX - coinCenterX, 2) + 
      Math.pow(dylanCenterY - coinCenterY, 2)
    );
    
    // Collection radius: 40px (more forgiving)
    if (distance < 40) {
      collectCoin(coinId, $coin);
    }
  });
}

function collectCoin(coinId, $coin) {
  // Add to inventory
  if (inventory.coins.indexOf(coinId) === -1) {
    inventory.coins.push(coinId);
    inventory.coinCount = inventory.coins.length;
    
    // Save to cookie
    setCookie("coins", JSON.stringify(inventory.coins));
    
    // Show collection animation
    $coin.fadeOut(300, function() {
      $coin.remove();
    });
    
    // Show notification
    showCoinCollectedNotification();
    
    // Check if all coins collected
    if (typeof COIN_CONFIG !== "undefined" && 
        inventory.coinCount >= COIN_CONFIG.totalCoins) {
      showAllCoinsCollected();
    }
  }
}

function showCoinCollectedNotification() {
  // Create a simple notification
  var $notification = $('<div class="coin-notification">Coin Collected! (' + 
    inventory.coinCount + '/' + 
    (typeof COIN_CONFIG !== "undefined" ? COIN_CONFIG.totalCoins : '?') + 
    ')</div>');
  
  $notification.css({
    position: 'fixed',
    top: '100px',
    right: '20px',
    background: '#18403c',
    border: '2px solid #fff',
    padding: '0.5rem 1rem',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '0.6rem',
    color: '#fff',
    zIndex: 10000000,
    opacity: 0,
    transition: 'opacity 0.3s'
  });
  
  $('body').append($notification);
  
  setTimeout(function() {
    $notification.css('opacity', 1);
  }, 10);
  
  setTimeout(function() {
    $notification.fadeOut(300, function() {
      $notification.remove();
    });
  }, 2000);
}

function showAllCoinsCollected() {
  var $notification = $('<div class="coin-notification achievement">🎉 All Coins Collected! 🎉</div>');
  
  $notification.css({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#18403c',
    border: '4px solid #fff',
    padding: '1rem 2rem',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '0.8rem',
    color: '#fff',
    zIndex: 10000000,
    textAlign: 'center',
    boxShadow: '0 8px 0 #000'
  });
  
  $('body').append($notification);
  
  setTimeout(function() {
    $notification.fadeOut(500, function() {
      $notification.remove();
    });
  }, 3000);
}

// ----------------------
// Inventory UI (backpack)
// ----------------------
var openBag = false;

function openInventory() {
  // Open unified panel with backpack tab if available
  if (typeof UnifiedPanel !== "undefined") {
    UnifiedPanel.open('backpack');
    return;
  }
  
  // Fallback to old inventory modal if unified panel not available
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
    if (!inventory.fishbook) {
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
    if (!inventory.matchbox) {
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
    if (!inventory.fishingRod) {
      inventory.fishingRod = true;
      setCookie("fishing-rod", true);
      $(".fishing-rod").css("display", "none");
      $(".inventory-slot.fishingRod").css(
        "background-image",
        URL.getMisc() + "/fishing-rod-found.png)"
      );
      showItemPickupAnimation("fishingRod");
      checkIfComplete();
      
      // Update fishing modal button state if modal is open
      if (typeof updateFishingRodButtonState === "function") {
        updateFishingRodButtonState();
      }
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
    if (!inventory.axe) {
      // Disable movement during axe pickup
      setMovementDisabled(true);
      // Set map position first
      $("#map").css({
        marginLeft: 1728 + "px",
        marginTop: -576 + "px",
      });
      // Set player position to world coordinates (423, 434) for axe pickup
      // This is different from tree chopping position (427, 437)
      if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
        gameWorld.player.setPosition({ x: 423, y: 434 });
        if (typeof gameWorld.player.setVelocity === "function") {
          gameWorld.player.setVelocity({ x: 0, y: 0 });
        }
        gameWorld.syncToDom();
        // Force another sync after a brief delay to ensure position sticks
        setTimeout(function() {
          if (gameWorld && gameWorld.player && gameWorld.syncToDom) {
            gameWorld.player.setPosition({ x: 423, y: 434 });
            if (typeof gameWorld.player.setVelocity === "function") {
              gameWorld.player.setVelocity({ x: 0, y: 0 });
            }
            gameWorld.syncToDom();
          }
        }, 10);
      } else {
        // Fallback to direct CSS if player controller not available
        $("#dylan").css({
          left: 412 + "px",
          top: 396 + "px",
        });
      }
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
          setMovementDisabled(false);
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
    if (!inventory.resume) {
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


// ----------------------
// Item pickup animation (Totem of Undying style)
// ----------------------
function playConfettiLottie() {
  var container = document.getElementById("lottie-confetti");
  if (!container || typeof lottie === "undefined") return;
  container.style.display = "block";
  container.innerHTML = "";
  var anim = lottie.loadAnimation({
    container: container,
    renderer: "svg",
    loop: false,
    autoplay: true,
    path: "resources/images/lottie/confetti.json",
  });
  anim.addEventListener("complete", function () {
    container.style.display = "none";
    anim.destroy();
  });
}

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
    }
  };

  var item = itemMap[itemType];
  if (!item) {
    console.log('Item not found in map:', itemType);
    return;
  }
  
  console.log('Item found:', item);

  // Always send to top-right HUD corner (avoids misalignment when slots are off-screen)
  var targetOffset = {
    left: window.innerWidth - 110,
    top: 36
  };

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
    opacity: 0,
    display: 'block',
    visibility: 'visible',
    transform: 'translate(40px, 16px) scale(0.7)'
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
  
  // Play full-screen Lottie confetti if available
  if (typeof playConfettiLottie === "function") {
    playConfettiLottie();
  }
  
  // Create a pixel confetti burst from bottom-left and bottom-right of the viewport
  (function createItemPickupConfetti() {
    var colors = ['#fbbf24', '#fb7185', '#38bdf8', '#a855f7', '#4ade80'];
    var total = 36;
    var origins = [
      { x: 0, y: window.innerHeight - 12, dir: 1 },  // bottom-left, shoot right/up
      { x: window.innerWidth, y: window.innerHeight - 12, dir: -1 } // bottom-right, shoot left/up
    ];
    var perOrigin = Math.ceil(total / origins.length);

    origins.forEach(function (origin) {
      for (var i = 0; i < perOrigin; i++) {
        var spreadX = 260;
        var dx = (Math.random() * spreadX) * origin.dir; // shoot toward center
        var dy = - (100 + Math.random() * 180); // burst upward
        var color = colors[Math.floor(Math.random() * colors.length)];
        var $confetti = $('<div class="item-pickup-confetti"></div>');
        $confetti.css({
          '--dx': dx + 'px',
          '--dy': dy + 'px',
          'background-color': color,
          left: origin.x + 'px',
          top: origin.y + 'px'
        });
        $('body').append($confetti);
        
        // Clean up each confetti piece after its animation
        (function(confettiEl) {
          setTimeout(function() {
            confettiEl.remove();
          }, 1000);
        })($confetti);
      }
    });
  })();

  // Force a reflow to ensure element is rendered before animation
  void $icon[0].offsetHeight;
  void $label[0].offsetHeight;

  // Small delay to ensure DOM is ready, then start lift animation (no shake)
  setTimeout(function() {
    // Fade in the overlay and label
    $overlay.css('opacity', 1);
    $label.css({
      opacity: 1,
      transition: 'opacity 0.3s ease-in'
    });
    
    // Phase 1: Fade-in from the right, lift, and scale up (no spin)
    $icon.css({
      transition: 'transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.45s ease-out',
      transform: 'translate(0px, -35px) scale(1.12)',
      opacity: 1
    });
    
    // After lift completes (450ms), fly to backpack
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
      
      // Reset transform for smooth transition
      $icon.css({
        transition: 'transform 0.12s ease-out',
        transform: 'translate(0, 0) scale(1) rotate(0deg)'
      });
      
      // Remove overlay and label after fade out
      setTimeout(function() {
        $overlay.remove();
        $label.remove();
      }, 300);
      
      // Small delay to ensure transform reset
      setTimeout(function() {
        // Phase 2: Fly to backpack (gentle 0.65s)
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
          transform: 'translate(0, 0) scale(1)',
          transition: 'all 0.65s cubic-bezier(0.25, 0.9, 0.3, 1)'
        });

        // Phase 3: Fade out and remove (after flight)
        setTimeout(function() {
          // Fly toward target with a gentle scale down
          $icon.css({
            transform: 'translate(0, 0) scale(0.4)',
            opacity: 0.05,
            transition: 'transform 0.65s cubic-bezier(0.25, 0.9, 0.3, 1), opacity 0.4s ease-out'
          });
          
          setTimeout(function() {
            $icon.remove();
          }, 700);
        }, 650);
      }, 50);
    }, 450);
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
    matchbox: false,
    resume: false,
    fishingRod: false,
    fishbook: false,
    coins: [],
    coinCount: 0
  };
  
  // Clear coins cookie
  setCookie("coins", "");
  
  // Remove all coin elements
  $(".coin-item").remove();
  
  // Reinitialize coins
  if (typeof COIN_CONFIG !== "undefined") {
    initCoins();
  }

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

  // Reload page to fully reset state
  setTimeout(function() {
    location.reload();
  }, 1000);
}
