const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function progress(saved) {
  const storage = { value: saved, getItem() { return this.value; }, setItem(key, value) { this.value = value; } };
  const context = { window: {}, localStorage: storage };
  const source = fs.existsSync('resources/js/park-progress.js') ? fs.readFileSync('resources/js/park-progress.js', 'utf8') : '';
  vm.runInNewContext(source, context);
  assert.equal(typeof context.window.createParkProgress, 'function', 'park progress is available');
  return { store: context.window.createParkProgress(['cat', 'picnic'], storage), storage };
}

test('discoveries persist, count once, and only complete after every stop', () => {
  const { store, storage } = progress(null);
  assert.equal(store.discover('cat'), true);
  assert.equal(store.discover('cat'), false);
  assert.equal(store.count(), 1);
  assert.equal(store.complete(), false);
  const restored = progress(storage.value).store;
  assert.equal(restored.has('cat'), true);
  assert.equal(restored.discover('picnic'), true);
  assert.equal(restored.complete(), true);
});

test('invalid or old saved entries cannot inflate progress or break loading', () => {
  for (const value of ['broken', 'null', '{}', '42', '["cat","cat","removed",4]']) {
    const { store } = progress(value);
    assert.equal(store.count(), value.startsWith('[') ? 1 : 0);
    assert.equal(store.discover('unknown'), false);
    assert.equal(store.complete(), false);
  }
});

test('blocked browser storage still allows discoveries during the visit', () => {
  const { store } = progress(null);
  // Persistence errors must not prevent the visible interaction from completing.
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('resources/js/park-progress.js', 'utf8'), context);
  const unavailable = context.window.createParkProgress(['cat'], {
    getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }
  });
  assert.equal(unavailable.discover('cat'), true);
  assert.equal(unavailable.complete(), true);
  assert.equal(store.count(), 0);
});
