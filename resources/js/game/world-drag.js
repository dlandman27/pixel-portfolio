// world-drag.js
// Mouse/touch dragging in the world:
//   - Drag Dylan to pick him up and drop him somewhere else (main map, cave, tent).
//   - Drag anywhere else in the world to pan the camera; "Back to Dylan" recenters.
// A drag only starts after the pointer moves a few pixels, so plain clicks on
// signs, projects, etc. keep working.

(function (global) {
  var DRAG_THRESHOLD_PX = 6;
  var RECENTER_EASE = 0.14;
  // Pan momentum: velocity kept per frame after release (closer to 1 = longer glide).
  var PAN_FRICTION = 0.93;
  // Picked-up Dylan trails the pointer on a spring and swings with its speed.
  var GRAB_FOLLOW = 0.3;
  var GRAB_SWING_PER_PX = 2.2;
  var GRAB_MAX_SWING_DEG = 28;
  // Holding Dylan near a screen edge scrolls the map that way.
  var EDGE_SCROLL_ZONE_PX = 90;
  var EDGE_SCROLL_MAX_SPEED = 14; // px per frame at the very edge

  // Areas Dylan may be dropped into, per scene (world units, feet position).
  // Solids from WORLD_COLLIDERS are checked on top of these.
  var DROP_ZONES = {
    mainMap: [
      { x: 172, y: 392, width: 1660, height: 934 }, // the park inside the fences
      { x: 962, y: 200, width: 74, height: 184 }, // bridge up to the cave
      { x: 936, y: 1326, width: 124, height: 186 }, // the dock
    ],
    cave: [{ x: 944, y: 20, width: 112, height: 1150 }],
    tent1: [{ x: 10, y: -26, width: 396, height: 214 }],
  };

  var PLAYER_SPRITE_WIDTH = 32;
  var PLAYER_SPRITE_HEIGHT = 64;
  var PLAYER_COLLIDER_WIDTH = 24;
  var PLAYER_COLLIDER_HEIGHT = 40;

  var pointer = null; // { id, startX, startY, mode: 'pending'|'grab'|'pan', ... }
  var suppressNextClick = false;
  var recentering = false;
  var $recenterBtn = null;
  var $shadow = null;
  var edgeHints = null; // { top, right, bottom, left } elements shown while edge-scrolling
  var panVelocity = null; // { x, y } px per frame while gliding after release
  var grabState = null; // { x, y, vx, angle, targetX, targetY } sprite box in world units

  function world() {
    return global.playerController && global.playerController.gameWorld;
  }

  function sceneEl() {
    var gw = world();
    if (!gw || typeof gw._getSceneElement !== "function") return null;
    return gw._getSceneElement()[0] || null;
  }

  function clientToWorld(clientX, clientY) {
    var el = sceneEl();
    if (!el) return null;
    // In the 2.5D view the ground is tilted, so invert the perspective exactly.
    if (global.View3D && el.id === "map") return global.View3D.clientToWorld(clientX, clientY);
    var rect = el.getBoundingClientRect();
    var scale = el.offsetWidth ? rect.width / el.offsetWidth : 3;
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  }

  function isBusy() {
    if (global.eventOccurence) return true;
    if (global.inFishing || global.isReelingIn || global.onLog) return true;
    if (typeof UnifiedPanel !== "undefined" && UnifiedPanel.isOpen()) return true;
    return false;
  }

  function isInWorld(target) {
    if (!target || !target.closest) return false;
    if (target.closest("button, a, input, .nes-container, dialog, .project-lightbox, .timeline-modal")) {
      return false;
    }
    return !!target.closest("#map, #cave, #tent1");
  }

  // ---------- Drop validation ----------

  function inZone(foot, zones) {
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      if (foot.x >= z.x && foot.x <= z.x + z.width && foot.y >= z.y && foot.y <= z.y + z.height) {
        return true;
      }
    }
    return false;
  }

  function overlapsSolid(center) {
    var gw = world();
    if (!gw || !gw.collisionWorld || typeof Matter === "undefined") return false;
    var solids = [];
    var byId = gw.collisionWorld.bodiesById || {};
    Object.keys(byId).forEach(function (id) {
      var b = byId[id];
      if (b && b.body && b.body.isStatic && !b.body.isSensor) solids.push(b.body);
    });
    var bounds = {
      min: { x: center.x - PLAYER_COLLIDER_WIDTH / 2, y: center.y - PLAYER_COLLIDER_HEIGHT / 2 },
      max: { x: center.x + PLAYER_COLLIDER_WIDTH / 2, y: center.y + PLAYER_COLLIDER_HEIGHT / 2 },
    };
    return Matter.Query.region(solids, bounds).length > 0;
  }

  function dropTargetFor(clientX, clientY) {
    var gw = world();
    var p = clientToWorld(clientX, clientY - pointer.grabOffsetY);
    if (!gw || !p) return null;
    // Pointer holds Dylan by the shoulders; feet are below.
    var foot = { x: p.x, y: p.y + PLAYER_SPRITE_HEIGHT * 0.75 };
    var center = { x: foot.x, y: foot.y - PLAYER_COLLIDER_HEIGHT / 2 };
    var zones = DROP_ZONES[gw.sceneName] || [];
    var valid = inZone(foot, zones) && !overlapsSolid(center);
    return { foot: foot, center: center, valid: valid };
  }

  // ---------- Grab ----------

  function spriteBoxFor(center) {
    var footY = center.y + PLAYER_COLLIDER_HEIGHT / 2;
    return { left: center.x - PLAYER_SPRITE_WIDTH / 2, top: footY - PLAYER_SPRITE_HEIGHT };
  }

  function startGrab() {
    var gw = world();
    pointer.mode = "grab";
    pointer.origin = gw.player.getPosition();
    pointer.lastX = pointer.startX;
    pointer.lastY = pointer.startY;
    recentering = false;
    if (global.playerController) {
      global.playerController.disableInput = true;
      global.playerController.keysDown = {};
      global.playerController.inputState = { x: 0, y: 0 };
    }
    if (typeof SpriteManager !== "undefined") SpriteManager.setSpriteFrame("front", 2);
    $("#dylan").addClass("is-grabbed");
    $("body").addClass("is-grabbing");

    $shadow = $('<div class="grab-drop-shadow"></div>');
    $(sceneEl()).append($shadow);

    var box = spriteBoxFor(pointer.origin);
    grabState = { x: box.left, y: box.top, vx: 0, angle: 0, targetX: box.left, targetY: box.top };
  }

  // Runs every frame while grabbed: ease toward the pointer and tilt with speed.
  function stepGrab() {
    var gw = world();
    if (!grabState || !gw) return;
    var nx = grabState.x + (grabState.targetX - grabState.x) * GRAB_FOLLOW;
    var ny = grabState.y + (grabState.targetY - grabState.y) * GRAB_FOLLOW;
    grabState.vx = nx - grabState.x;
    grabState.x = nx;
    grabState.y = ny;
    var vy = ny - (grabState.lastY === undefined ? ny : grabState.lastY);
    grabState.lastY = ny;
    kickLegs(grabState.vx, vy);
    var swing = Math.max(-GRAB_MAX_SWING_DEG, Math.min(GRAB_MAX_SWING_DEG, -grabState.vx * GRAB_SWING_PER_PX));
    grabState.angle += (swing - grabState.angle) * 0.25;
    gw._grabOverride = { left: grabState.x, top: grabState.y };
    var el = document.getElementById("dylan");
    if (el) el.style.rotate = grabState.angle.toFixed(2) + "deg";
  }

  // While carried fast, Dylan "runs" in the air toward where he's being taken.
  function kickLegs(vx, vy) {
    if (typeof SpriteManager === "undefined") return;
    var speed = Math.abs(vx) + Math.abs(vy);
    var dir = "front";
    var frame = 2;
    if (speed > 0.8) {
      if (Math.abs(vx) > Math.abs(vy)) dir = vx > 0 ? "right" : "left";
      else dir = vy > 0 ? "front" : "back";
      grabState.legClock = (grabState.legClock || 0) + speed;
      frame = 1 + (Math.floor(grabState.legClock / 6) % 7);
    }
    var key = dir + frame;
    if (key !== grabState.legKey) {
      grabState.legKey = key;
      SpriteManager.setSpriteFrame(dir, frame);
    }
  }

  function moveGrab(e) {
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    updateGrabTarget(e);
  }

  function edgeSpeed(pos, size) {
    if (pos < EDGE_SCROLL_ZONE_PX) return EDGE_SCROLL_MAX_SPEED * (1 - pos / EDGE_SCROLL_ZONE_PX);
    if (pos > size - EDGE_SCROLL_ZONE_PX) return -EDGE_SCROLL_MAX_SPEED * (1 - (size - pos) / EDGE_SCROLL_ZONE_PX);
    return 0;
  }

  function edgeScrollWhileGrabbing() {
    var dx = edgeSpeed(pointer.lastX, window.innerWidth);
    var dy = edgeSpeed(pointer.lastY, window.innerHeight);
    showEdgeHints(dx, dy);
    if (!dx && !dy) return;
    applyPanDelta(dx, dy);
    // The world moved under a still pointer, so re-aim Dylan and his shadow.
    updateGrabTarget({ clientX: pointer.lastX, clientY: pointer.lastY });
  }

  // Pixel chevrons at the edges being scrolled toward; stronger and faster near the edge.
  function showEdgeHints(dx, dy) {
    if (!edgeHints) return;
    setHint(edgeHints.left, dx > 0 ? dx : 0);
    setHint(edgeHints.right, dx < 0 ? -dx : 0);
    setHint(edgeHints.top, dy > 0 ? dy : 0);
    setHint(edgeHints.bottom, dy < 0 ? -dy : 0);
    // Slide each hint along its edge to sit next to the pointer.
    var y = Math.max(80, Math.min(window.innerHeight - 80, pointer ? pointer.lastY : 0));
    var x = Math.max(80, Math.min(window.innerWidth - 80, pointer ? pointer.lastX : 0));
    edgeHints.left.style.top = edgeHints.right.style.top = y + "px";
    edgeHints.top.style.left = edgeHints.bottom.style.left = x + "px";
  }

  function setHint(el, speed) {
    var strength = speed / EDGE_SCROLL_MAX_SPEED;
    el.style.opacity = strength > 0 ? (0.35 + strength * 0.65).toFixed(2) : "0";
    el.style.setProperty("--edge-speed", (0.9 - strength * 0.6).toFixed(2) + "s");
  }

  function updateGrabTarget(e) {
    var held = clientToWorld(e.clientX, e.clientY - pointer.grabOffsetY);
    if (!held) return;
    // Dylan dangles from the pointer, lifted above where he'd land.
    if (grabState) {
      grabState.targetX = held.x - PLAYER_SPRITE_WIDTH / 2;
      grabState.targetY = held.y - PLAYER_SPRITE_HEIGHT * 0.25 - 10;
    }
    var target = dropTargetFor(e.clientX, e.clientY);
    if (target && $shadow) {
      $shadow.css({ left: target.foot.x - 12 + "px", top: target.foot.y - 5 + "px" });
      $shadow.toggleClass("is-invalid", !target.valid);
    }
  }

  function endGrab(e) {
    var gw = world();
    showEdgeHints(0, 0);
    grabState = null;
    document.getElementById("dylan").style.rotate = "";
    var target = dropTargetFor(e.clientX, e.clientY);
    var $dylan = $("#dylan");
    if ($shadow) {
      $shadow.remove();
      $shadow = null;
    }
    $("body").removeClass("is-grabbing");

    if (target && target.valid) {
      // Keep the view where it is, then glide the camera to his new spot.
      var before = currentMargins();
      gw.player.setPosition(target.center);
      if (typeof gw.player.setVelocity === "function") gw.player.setVelocity({ x: 0, y: 0 });
      gw._grabOverride = null;
      gw.syncToDom();
      var after = currentMargins();
      var off = gw.getCameraOffset();
      gw.setCameraOffset(off.x + (before.left - after.left), off.y + (before.top - after.top));
      recentering = true;
      $dylan.removeClass("is-grabbed").addClass("grab-landed");
      puffAt(target.foot);
      setTimeout(function () { $dylan.removeClass("grab-landed"); }, 450);
      finishGrab();
    } else {
      // Not allowed there: float him back to where he was picked up.
      var home = spriteBoxFor(pointer.origin);
      $dylan.removeClass("is-grabbed").addClass("grab-returning");
      gw._grabOverride = home;
      setTimeout(function () {
        gw._grabOverride = null;
        $dylan.removeClass("grab-returning");
        finishGrab();
      }, 320);
    }
  }

  function finishGrab() {
    if (global.playerController) global.playerController.disableInput = false;
    if (typeof SpriteManager !== "undefined") SpriteManager.setSpriteFrame("front", 2);
  }

  function puffAt(foot) {
    var $puff = $('<div class="grab-dust-puff"></div>');
    $puff.css({ left: foot.x - 16 + "px", top: foot.y - 10 + "px" });
    $(sceneEl()).append($puff);
    setTimeout(function () { $puff.remove(); }, 600);
  }

  // ---------- Pan ----------

  function currentMargins() {
    var el = sceneEl();
    if (!el) return { left: 0, top: 0 };
    return { left: parseFloat(el.style.marginLeft) || 0, top: parseFloat(el.style.marginTop) || 0 };
  }

  function startPan() {
    pointer.mode = "pan";
    pointer.lastX = pointer.startX;
    pointer.lastY = pointer.startY;
    pointer.samples = [];
    recentering = false;
    panVelocity = null;
    $("body").addClass("is-panning");
  }

  // Moves the camera by (dx, dy) screen px. Returns false if it hit a world edge.
  function applyPanDelta(dx, dy) {
    var gw = world();
    var before = currentMargins();
    var off = gw.getCameraOffset();
    gw.setCameraOffset(off.x + dx, off.y + dy);
    gw.syncToDom();
    // The camera clamps at the world edges; trim the offset so it never
    // builds up "slack" that would have to be dragged back first.
    var actual = currentMargins();
    var overshootX = before.left + dx - actual.left;
    var overshootY = before.top + dy - actual.top;
    if (Math.abs(overshootX) > 0.5 || Math.abs(overshootY) > 0.5) {
      off = gw.getCameraOffset();
      gw.setCameraOffset(off.x - overshootX, off.y - overshootY);
    }
    return { blockedX: Math.abs(overshootX) > 0.5, blockedY: Math.abs(overshootY) > 0.5 };
  }

  function movePan(e) {
    applyPanDelta(e.clientX - pointer.lastX, e.clientY - pointer.lastY);
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    var now = performance.now();
    pointer.samples.push({ x: e.clientX, y: e.clientY, t: now });
    while (pointer.samples.length && now - pointer.samples[0].t > 100) pointer.samples.shift();
  }

  // Release velocity from the last ~100ms of movement, in px per 60fps frame.
  function endPan() {
    var s = pointer.samples;
    $("body").removeClass("is-panning");
    if (!s || s.length < 2) return;
    var first = s[0];
    var last = s[s.length - 1];
    var dt = Math.max(16, performance.now() - first.t);
    if (performance.now() - last.t > 60) return; // held still before letting go
    panVelocity = { x: ((last.x - first.x) / dt) * 16.67, y: ((last.y - first.y) / dt) * 16.67 };
  }

  function stepPanMomentum() {
    if (!panVelocity) return;
    var hit = applyPanDelta(panVelocity.x, panVelocity.y);
    panVelocity.x = hit.blockedX ? 0 : panVelocity.x * PAN_FRICTION;
    panVelocity.y = hit.blockedY ? 0 : panVelocity.y * PAN_FRICTION;
    if (Math.abs(panVelocity.x) < 0.3 && Math.abs(panVelocity.y) < 0.3) panVelocity = null;
  }

  // ---------- Recenter ----------

  function hasOffset() {
    var gw = world();
    if (!gw || typeof gw.getCameraOffset !== "function") return false;
    var o = gw.getCameraOffset();
    return Math.abs(o.x) > 2 || Math.abs(o.y) > 2;
  }

  function tick() {
    var gw = world();
    if (gw && typeof gw.getCameraOffset === "function") {
      if (pointer && pointer.mode === "grab") {
        edgeScrollWhileGrabbing();
        stepGrab();
      }
      stepPanMomentum();
      var walking =
        global.playerController &&
        (global.playerController.inputState.x !== 0 || global.playerController.inputState.y !== 0);
      // Walking also brings the camera home.
      if (walking) panVelocity = null;
      if ((recentering || walking) && !(pointer && pointer.mode === "pan")) {
        var o = gw.getCameraOffset();
        var nx = o.x * (1 - RECENTER_EASE);
        var ny = o.y * (1 - RECENTER_EASE);
        if (Math.abs(nx) < 0.5 && Math.abs(ny) < 0.5) {
          nx = 0;
          ny = 0;
          recentering = false;
        }
        gw.setCameraOffset(nx, ny);
      }
      if ($recenterBtn) $recenterBtn.toggleClass("is-visible", hasOffset() && !recentering);
    }
    requestAnimationFrame(tick);
  }

  // ---------- Pointer wiring ----------

  function onPointerDown(e) {
    if (pointer || e.button > 0 || !e.isPrimary) return;
    panVelocity = null; // touching the world stops any glide
    if (!world() || !world().player || isBusy() || !isInWorld(e.target)) return;

    var onDylan = !!(e.target.closest && e.target.closest("#dylan"));
    var grabOffsetY = 0;
    if (onDylan) {
      // Remember where on the sprite he was grabbed so he doesn't jump.
      var r = document.getElementById("dylan").getBoundingClientRect();
      grabOffsetY = e.clientY - (r.top + r.height * 0.25);
    }
    pointer = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      mode: "pending",
      wantsGrab: onDylan && DROP_ZONES[world().sceneName],
      grabOffsetY: grabOffsetY,
    };
  }

  function onPointerMove(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    if (pointer.mode === "pending") {
      var moved = Math.abs(e.clientX - pointer.startX) + Math.abs(e.clientY - pointer.startY);
      if (moved < DRAG_THRESHOLD_PX) return;
      if (pointer.wantsGrab) startGrab();
      else startPan();
    }
    e.preventDefault();
    if (pointer.mode === "grab") moveGrab(e);
    else if (pointer.mode === "pan") movePan(e);
  }

  function onPointerUp(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    if (pointer.mode === "grab") endGrab(e);
    if (pointer.mode === "pan") endPan();
    if (pointer.mode !== "pending") suppressNextClick = true;
    pointer = null;
  }

  // A drag shouldn't also count as a click on whatever was under the pointer.
  function onClickCapture(e) {
    if (!suppressNextClick) return;
    suppressNextClick = false;
    e.stopPropagation();
    e.preventDefault();
  }

  $(function () {
    $recenterBtn = $(
      '<button type="button" class="rail-btn recenter-btn" aria-label="Back to Dylan" data-label="Back to Dylan">' +
        '<i class="fas fa-crosshairs" aria-hidden="true"></i></button>'
    );
    $recenterBtn.click(function (e) {
      e.stopPropagation();
      panVelocity = null;
      recentering = true;
    });
    // Lives in the right-side button rail when there is one.
    ($("#game-menu").length ? $("#game-menu") : $("body")).append($recenterBtn);

    edgeHints = {};
    ["top", "right", "bottom", "left"].forEach(function (side) {
      var el = document.createElement("div");
      el.className = "edge-scroll-hint edge-" + side;
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
      edgeHints[side] = el;
    });

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("click", onClickCapture, true);
    requestAnimationFrame(tick);
  });
})(window);
