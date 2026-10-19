(function (global) {
  global.createParkProgress = function (ids, storage) {
    var found = [];
    var key = 'pp-park-discoveries-v1';
    try {
      var saved = JSON.parse(storage.getItem(key));
      if (Array.isArray(saved)) found = saved.filter(function (id, i) {
        return ids.indexOf(id) !== -1 && saved.indexOf(id) === i;
      });
    } catch (e) { /* Storage can be unavailable in private browsing. */ }
    return {
      has: function (id) { return found.indexOf(id) !== -1; },
      count: function () { return found.length; },
      complete: function () { return found.length === ids.length; },
      discover: function (id) {
        if (ids.indexOf(id) === -1 || found.indexOf(id) !== -1) return false;
        found.push(id);
        try { storage.setItem(key, JSON.stringify(found)); } catch (e) {}
        return true;
      }
    };
  };
})(window);
