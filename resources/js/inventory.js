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
      $(".achievement").css("background-color", "#3EB489");
      $(".achievement").css("display", "block").fadeIn();
      $(".achievement-name").text("What will we catch?");
      $(".achievement-description").text("Collect the Fish Collection Book");
      setTimeout(function () {
        $(".achievement").fadeOut();
      }, 3000);
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
      $(".achievement").css("display", "block").fadeIn();
      $(".achievement-name").text("It's a Match!");
      $(".achievement-description").text("Pick up the matchbox");
      setTimeout(function () {
        $(".achievement").fadeOut().css("display", "block");
      }, 3000);
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
      $(".achievement").css("background-color", "#3EB489");
      $(".inventory-slot.fishingRod").css(
        "background-image",
        URL.getMisc() + "/fishing-rod-found.png)"
      );
      $(".achievement").css("display", "block").fadeIn();
      $(".achievement-name").text("Lets Fish!");
      $(".achievement-description").text("Pick up the fishing rod");
      setTimeout(function () {
        $(".achievement").fadeOut();
      }, 3000);
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
          $(".achievement").css("background-color", "#3EB489");
          $("#stump").css("background-image", url + "/stump-without-axe.png)");
          $("#dylan").css("background-size", "40px").css("width", "40px");
          $(".achievement").css("display", "block").fadeIn();
          $(".achievement-name").text("Axe to Grind");
          $(".achievement-description").text("Grab the Axe");
          setTimeout(function () {
            $(".achievement").fadeOut();
          }, 3000);
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
  $(".achievement").css("background-color", "#3EB489");
  $(".achievement").css("display", "block").fadeIn();
  $(".achievement-name").text("Woodn'nt that be nice");
  $(".achievement-description").text("Collect Firewood");
  setTimeout(function () {
    $(".achievement").fadeOut();
  }, 3000);
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
    $(".achievement").css("background-color", "#3EB489");
    $(".achievement").css("display", "block").fadeIn();
    $(".achievement-name").text("Mind the Map");
    $(".achievement-description").text("Collect the Map");
    setTimeout(function () {
      $(".achievement").fadeOut();
    }, 3000);

    setCookie("minimap", "true");
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
      $(".achievement").css("background-color", "#3EB489");
      $(".achievement").css("display", "block").fadeIn();
      $(".achievement-name").text("Who am I?");
      $(".achievement-description").text("Collect my Resume");
      setTimeout(function () {
        $(".achievement").fadeOut();
      }, 3000);
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
    $(".achievement").css("background-color", "#3EB489");
    if (window.innerWidth > 600)
      $("#backpack-icon").css("visibility", "visible");
    $(".achievement").css("display", "block").fadeIn();
    $(".achievement-name").text("Extra Baggage");
    $(".achievement-description").text("Pick up Backpack");
    setTimeout(function () {
      $(".achievement").fadeOut().css("display", "block");
    }, 3000);
  }
}

// ----------------------
// Completion check
// ----------------------
function checkIfComplete() {
  if (!Object.values(inventory).includes(false)) {
    $(".achievement").css("background-color", "goldenrod");
    $(".achievement").css("display", "block").fadeIn();
    $(".achievement-name").text("Strapped Up");
    $(".achievement-description").text("Collect All Items");
    setTimeout(function () {
      $(".achievement").fadeOut();
    }, 5000);
  }
}
