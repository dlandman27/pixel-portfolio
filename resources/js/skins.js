// skins.js
// Dylan's wardrobe: outfit skins + hats, unlocks, and persistence.
//   - Outfits are recolored sprite folders made by tools/make-skins.py.
//   - Hats are small PNGs from tools/make-hats.py, layered on Dylan's head.
//   - Some items unlock by exploring; progress is kept in localStorage.

var Skins = (function () {
  var STORAGE_KEY = "pp-wardrobe";
  var DEFAULT_BASE = "resources/images/characters/dylan";

  var OUTFITS = [
    { id: "classic", name: "Classic", swatch: "#073a6c" },
    { id: "crimson", name: "Crimson", swatch: "#b3263a" },
    { id: "forest", name: "Forest", swatch: "#1f7a3a" },
    { id: "royal", name: "Royal", swatch: "#6d28d9" },
    { id: "midnight", name: "Midnight", swatch: "#3f4350" },
    { id: "sunset", name: "Sunset", swatch: "#e0701a", unlock: "fish3" },
    { id: "gold", name: "Gold", swatch: "#e0b31a", unlock: "allItems" },
  ];

  var HATS = [
    { id: "none", name: "No Hat" },
    { id: "beanie", name: "Beanie" },
    { id: "cap", name: "Cap" },
    { id: "party", name: "Party Hat", unlock: "projects5" },
    { id: "tophat", name: "Top Hat", unlock: "bonfire" },
    { id: "wizard", name: "Wizard Hat", unlock: "timeline5" },
    { id: "crown", name: "Crown", unlock: "allFish" },
  ];

  var UNLOCKS = {
    fish3: { hint: "Catch 3 fish at the dock", check: function (s) { return fishCaught() >= 3; } },
    allFish: { hint: "Catch every fish", check: function (s) { return fishCaught() >= 10; } },
    allItems: { hint: "Collect all 6 items", check: function (s) { return itemsCollected() >= 6; } },
    projects5: { hint: "Open 5 different projects", check: function (s) { return s.projects.length >= 5; } },
    bonfire: { hint: "Sit by the bonfire", check: function (s) { return !!s.satByFire; } },
    timeline5: { hint: "Read 5 signs in the cave", check: function (s) { return s.timeline.length >= 5; } },
  };

  var state = load();
  var listeners = [];

  function load() {
    var fallback = { outfit: "classic", hat: "none", projects: [], timeline: [], satByFire: false, seen: [] };
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") {
        for (var k in fallback) if (!(k in saved)) saved[k] = fallback[k];
        return saved;
      }
    } catch (e) {}
    return fallback;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function fishCaught() {
    if (typeof FISHREP === "undefined" || !FISHREP.getCollection) return 0;
    var c = FISHREP.getCollection();
    var n = 0;
    for (var k in c) if (c[k] === true) n++;
    return n;
  }

  function itemsCollected() {
    if (typeof inventory === "undefined" || !inventory) return 0;
    return ["axe", "wood", "matchbox", "minimap", "resume", "fishingRod"].filter(function (k) {
      return !!inventory[k];
    }).length;
  }

  function isUnlocked(item) {
    return !item.unlock || UNLOCKS[item.unlock].check(state);
  }

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  // ---------- Applying the look ----------

  function base() {
    var outfit = find(OUTFITS, state.outfit);
    if (outfit.id === "classic" || !isUnlocked(outfit)) return DEFAULT_BASE;
    return "resources/images/characters/skins/" + outfit.id;
  }

  function applyHat() {
    var dylan = document.getElementById("dylan");
    if (!dylan) return;
    var img = dylan.querySelector(".dylan-hat");
    var hat = find(HATS, state.hat);
    if (hat.id === "none" || !isUnlocked(hat)) {
      if (img) img.remove();
      return;
    }
    if (!img) {
      img = document.createElement("img");
      img.className = "dylan-hat";
      img.alt = "";
      dylan.appendChild(img);
    }
    img.src = "resources/images/characters/hats/" + hat.id + ".png";
  }

  function applyOutfit() {
    if (typeof SpriteManager !== "undefined" && SpriteManager.refresh) SpriteManager.refresh();
  }

  function setOutfit(id) {
    var outfit = find(OUTFITS, id);
    if (!isUnlocked(outfit)) return false;
    state.outfit = outfit.id;
    save();
    applyOutfit();
    notify();
    return true;
  }

  function setHat(id) {
    var hat = find(HATS, id);
    if (!isUnlocked(hat)) return false;
    state.hat = hat.id;
    save();
    applyHat();
    notify();
    return true;
  }

  function notify() {
    listeners.forEach(function (fn) { fn(); });
  }

  // ---------- Progress tracking ----------

  function remember(listName, id) {
    if (id === undefined || id === null) return;
    id = String(id);
    if (state[listName].indexOf(id) === -1) {
      state[listName].push(id);
      save();
      checkNewUnlocks();
    }
  }

  // Shows a toast the first time an item becomes available.
  function checkNewUnlocks() {
    OUTFITS.concat(HATS).forEach(function (item) {
      if (!item.unlock || state.seen.indexOf(item.id) !== -1) return;
      if (isUnlocked(item)) {
        state.seen.push(item.id);
        save();
        toast(item);
      }
    });
  }

  function toast(item) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "unlock-toast";
    el.innerHTML =
      '<span class="unlock-toast-label">Unlocked</span>' +
      '<span class="unlock-toast-name"></span>' +
      '<span class="unlock-toast-hint">Open the Wardrobe to wear it</span>';
    el.querySelector(".unlock-toast-name").textContent = item.name;
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      el.remove();
      if (typeof UnifiedPanel !== "undefined") UnifiedPanel.open("wardrobe");
    });
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add("is-leaving"); }, 4500);
    setTimeout(function () { el.remove(); }, 5000);
  }

  function hideHatDuringActions() {
    var dylan = document.getElementById("dylan");
    if (!dylan) return;
    // #dylan arrives with the async-loaded map, so (re)attach the hat if needed.
    if (state.hat !== "none" && !dylan.querySelector(".dylan-hat")) applyHat();
    // Chopping/fishing frames use different poses; the hat would float.
    var busy = !!(window.eventOccurence || window.inFishing || window.isReelingIn);
    dylan.classList.toggle("hat-hidden", busy);
    if (window.onLog && !state.satByFire) {
      state.satByFire = true;
      save();
      checkNewUnlocks();
    }
  }

  // Wrap the global openers once everything else has wrapped them.
  $(window).load(function () {
    if (typeof openProjectLightbox === "function") {
      var openProject = window.openProjectLightbox;
      window.openProjectLightbox = function (id) {
        var result = openProject.apply(this, arguments);
        remember("projects", id);
        return result;
      };
    }
    if (typeof openTimelineModal === "function") {
      var openTimeline = window.openTimelineModal;
      window.openTimelineModal = function (entry) {
        var result = openTimeline.apply(this, arguments);
        remember("timeline", entry && (entry.title || entry.year));
        return result;
      };
    }
    setInterval(function () {
      hideHatDuringActions();
      checkNewUnlocks(); // catches fish/items progress from the games
    }, 500);
  });

  $(function () {
    applyHat();
  });

  return {
    OUTFITS: OUTFITS,
    HATS: HATS,
    base: base,
    current: function () { return { outfit: state.outfit, hat: state.hat }; },
    isUnlocked: isUnlocked,
    hintFor: function (item) { return item.unlock ? UNLOCKS[item.unlock].hint : ""; },
    setOutfit: setOutfit,
    setHat: setHat,
    onChange: function (fn) { listeners.push(fn); },
  };
})();
