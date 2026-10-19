// Small discoveries and scenery share the existing world/camera, without a second game loop.
var Park = (function () {
  var storage;
  try { storage = window.localStorage; } catch (e) {}
  var progress = createParkProgress(PARK_STOPS.map(function (s) { return s.id; }), storage);
  var pageTurns = {};
  var objects = [], nearest = null, prompt, note, noteTimer, rail;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function imagePath(asset) { return 'resources/images/' + asset; }
  function busy() {
    return window.eventOccurence || window.inFishing || window.inSoccer || window.onLog ||
      (window.UnifiedPanel && UnifiedPanel.isOpen()) || (window.StartMenu && StartMenu.isOpen()) ||
      (window.playerController && playerController.disableInput);
  }
  function addObject(map, spec, interactive) {
    var el = document.createElement(interactive ? 'button' : 'div');
    el.className = 'park-prop' + (interactive ? ' park-interactive' : '');
    el.style.left = spec.x + 'px'; el.style.top = spec.y + 'px';
    el.style.width = spec.w + 'px'; el.style.height = spec.h + 'px';
    el.style.backgroundImage = 'url("' + imagePath(spec.asset) + '")';
    if (interactive) {
      el.type = 'button';
      if (spec.id) el.dataset.parkStop = spec.id;
      else el.classList.add('park-landmark');
      el.setAttribute('aria-label', spec.action);
      var label = document.createElement('span'); label.className = 'park-object-label';
      label.textContent = spec.action; el.appendChild(label);
      el.addEventListener('click', function (e) { e.stopPropagation(); interact(spec); });
    } else el.setAttribute('aria-hidden', 'true');
    map.appendChild(el);
    objects.push({ el: el, spec: spec });
  }

  function effect(stop) {
    var el = document.querySelector('[data-park-stop="' + stop.id + '"]');
    if (!el) return;
    el.classList.add('is-discovered');
    if (reducedMotion.matches) return;
    el.classList.remove('is-reacting');
    void el.offsetWidth;
    el.classList.add('is-reacting');
    setTimeout(function () { el.classList.remove('is-reacting'); }, 1800);
    var layer = document.createElement('div');
    layer.className = 'park-effect park-effect-' + stop.effect;
    layer.style.left = stop.x + stop.w / 2 + 'px'; layer.style.top = stop.y + 'px';
    layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 7; i++) {
      var bit = document.createElement('i');
      bit.style.setProperty('--i', i); layer.appendChild(bit);
    }
    document.getElementById('map').appendChild(layer);
    setTimeout(function () { layer.remove(); }, 2200);
  }

  function interact(stop) {
    if (busy()) return;
    if (stop.work) { UnifiedPanel.openWork(); return; }
    if (stop.projectId) { openProjectLightbox(stop.projectId); return; }
    var first = progress.discover(stop.id);
    effect(stop);
    rail.querySelector('.park-count').textContent = progress.count() + '/' + PARK_STOPS.length;
    note.querySelector('img').src = imagePath(stop.asset);
    note.querySelector('strong').textContent = stop.name;
    var message = first ? stop.text : stop.again;
    if (!first && stop.pages) {
      var page = pageTurns[stop.id] || 0;
      message = stop.pages[page % stop.pages.length];
      pageTurns[stop.id] = page + 1;
    }
    note.querySelector('p').textContent = message;
    note.querySelector('.park-note-progress').textContent = progress.complete()
      ? 'Every little discovery found. Park regular, officially.'
      : (first ? 'New discovery · ' : '') + progress.count() + ' of ' + PARK_STOPS.length + ' in your journal';
    note.hidden = false;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { note.hidden = true; }, 8500);
    if (typeof closeTutorial === 'function') closeTutorial();
  }

  function hydrate(root) {
    var list = root.querySelector('[data-role="park-entries"]');
    if (!list) return;
    list.textContent = '';
    root.querySelector('[data-role="park-progress"]').textContent = progress.count() + ' / ' + PARK_STOPS.length;
    root.querySelector('[data-role="park-completion"]').hidden = !progress.complete();
    PARK_STOPS.forEach(function (stop) {
      var found = progress.has(stop.id);
      var entry = document.createElement('article');
      entry.className = 'park-entry' + (found ? ' is-found' : '');
      var img = document.createElement('img'); img.src = imagePath(stop.asset); img.alt = '';
      var content = document.createElement('div');
      var title = document.createElement('h3'); title.textContent = found ? stop.name : stop.place;
      var description = document.createElement('p'); description.textContent = found ? stop.text : stop.hint;
      var status = document.createElement('span'); status.className = 'park-entry-status';
      status.textContent = found ? 'Discovered' : 'Yet to find';
      content.appendChild(title); content.appendChild(description); content.appendChild(status);
      entry.appendChild(img); entry.appendChild(content); list.appendChild(entry);
    });
  }

  function update() {
    var pc = window.playerController, gw = pc && pc.gameWorld;
    var main = gw && gw.sceneName === 'mainMap';
    nearest = null;
    var distance = 100;
    if (main && gw.player) {
      var p = gw.player.getPosition();
      objects.forEach(function (o) {
        o.el.style.zIndex = o.spec.ground ? 7 : (p.y + 20 < o.spec.y + o.spec.h - 6 ? 50 : 48);
        if (!o.spec.action) return;
        var d = Math.hypot(p.x - o.spec.x - o.spec.w / 2, p.y + 20 - o.spec.y - o.spec.h);
        if (d < distance) { distance = d; nearest = o.spec; }
      });
    }
    var available = main && !busy();
    prompt.hidden = !available || !nearest;
    if (nearest) prompt.querySelector('span').textContent = nearest.action;
    objects.forEach(function (o) {
      if (o.spec.action) o.el.classList.toggle('is-near', available && nearest === o.spec);
    });
    if (!available) note.hidden = true;
  }

  function start() {
    var map = document.getElementById('map');
    if (!map || map.dataset.parkReady) return;
    map.dataset.parkReady = 'true';
    // Ground patches use existing terrain textures; all coordinates stay in world units.
    [[766,444,88,42],[1660,506,124,48],[244,460,152,108],[1568,978,128,48]].forEach(function (r) {
      var patch = document.createElement('div'); patch.className = 'park-clearing';
      patch.style.cssText = 'left:' + r[0] + 'px;top:' + r[1] + 'px;width:' + r[2] + 'px;height:' + r[3] + 'px';
      map.appendChild(patch);
    });
    [[1610,800,56,110],[1702,546,32,174],[1620,694,114,26],[1620,720,32,14],[1456,1046,348,40],[1608,1020,48,248],[1480,1080,28,94],[1752,1080,28,94]].forEach(function (r) {
      var path = document.createElement('div'); path.className = 'park-walkway';
      path.style.cssText = 'left:' + r[0] + 'px;top:' + r[1] + 'px;width:' + r[2] + 'px;height:' + r[3] + 'px';
      map.appendChild(path);
    });
    [{x:1568,y:1028,text:'The workshop'},{x:1668,y:708,text:'Picnic terrace'}].forEach(function (s) {
      var sign = document.createElement('div'); sign.className = 'park-place-sign';
      sign.style.left = s.x + 'px'; sign.style.top = s.y + 'px'; sign.textContent = s.text;
      map.appendChild(sign);
    });
    PARK_SCENERY.forEach(function (spec) { addObject(map, spec, false); });
    PARK_LANDMARKS.forEach(function (spec) { addObject(map, spec, true); });
    PARK_STOPS.forEach(function (spec) {
      addObject(map, spec, true);
      if (progress.has(spec.id)) objects[objects.length - 1].el.classList.add('is-discovered');
    });
    rail = document.createElement('button'); rail.type = 'button'; rail.className = 'rail-btn park-journal-button';
    rail.setAttribute('aria-label', 'Discovery journal'); rail.dataset.label = 'Journal';
    rail.innerHTML = '<span class="park-book-icon" aria-hidden="true"></span><span class="park-count">' + progress.count() + '/' + PARK_STOPS.length + '</span>';
    rail.addEventListener('click', function(e) { e.stopPropagation(); UnifiedPanel.open('journal'); });
    document.getElementById('game-menu').appendChild(rail);
    prompt = document.createElement('button'); prompt.type = 'button'; prompt.className = 'park-prompt'; prompt.hidden = true;
    prompt.innerHTML = '<kbd>E</kbd><span></span>';
    prompt.addEventListener('click', function () { if (nearest) interact(nearest); });
    document.body.appendChild(prompt);
    note = document.createElement('aside'); note.className = 'park-note'; note.hidden = true;
    note.setAttribute('role', 'status'); note.setAttribute('aria-live', 'polite');
    note.innerHTML = '<img alt=""><div><strong></strong><p></p><span class="park-note-progress"></span></div><button type="button" aria-label="Dismiss discovery">×</button>';
    note.querySelector('button').addEventListener('click', function () { note.hidden = true; });
    document.body.appendChild(note);
    setInterval(update, 120);
    update();
  }

  window.addEventListener('keydown', function (e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key.toLowerCase() === 'e' && nearest && !busy()) { e.preventDefault(); interact(nearest); }
    if (e.key === 'Escape' && note) note.hidden = true;
  });
  // helpers.js calls this after the asynchronous map fragment is present.
  return { start: start, hydrate: hydrate };
})();
