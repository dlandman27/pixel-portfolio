// Coordinates are relative to #map, not the inset #wrapper.
var PARK_STOPS = [
  { id: 'library', name: 'One more chapter', place: 'Little park library', x: 714, y: 1120, w: 128, h: 112,
    asset: 'park/woodland-library.png', action: 'Open a book', effect: 'spark',
    hint: 'Look for a green roof on the southwest promenade.',
    text: 'You open the field guide. Its first rule: follow the paths, then get curious. Someone has left a pressed flower between the pages.',
    again: 'A note in the margin: the tiny mushrooms behind the tent have a secret. Try visiting them.',
    pages: ['A note in the margin: the tiny mushrooms behind the tent have a secret. Try visiting them.', 'The next chapter is blank. A good excuse to make your own little adventure.', 'The bookmark reads: take a break. The benches outside are excellent for that.'] },
  { id: 'tackle', name: 'A good day for fishing', place: 'Tackle hut', x: 1152, y: 1120, w: 128, h: 112,
    asset: 'park/tackle-hut.png', action: 'Check the fishing tips', effect: 'breeze',
    hint: 'The blue-roofed hut is just east of the southern dock.',
    text: 'The dock is through the southern arch. Find the fishing rod there, then follow the fishing prompts to cast your line.',
    again: 'No luck yet? Every good fishing story begins with a little patience. Your catches are kept in the fish collection.' },
  { id: 'fountain', name: 'A little good luck', place: 'Fountain garden', x: 786, y: 414, w: 48, h: 58,
    asset: 'misc/water-fountain.png', action: 'Make a wish', effect: 'ripple',
    hint: 'Follow the sound of water, west of the entrance.',
    text: 'A coin, a ripple, a little optimism. Your wish is between you and the fountain.', again: 'Another wish? The fountain is a very good listener.' },
  { id: 'cat', name: 'The local supervisor', place: 'Woodland walk', x: 670, y: 786, w: 32, h: 32,
    asset: 'park/park-cat.png', action: 'Pet the cat', effect: 'heart',
    hint: 'Someone is napping beside the western path.',
    text: 'Marmalade accepts your offering of head scratches. You may continue exploring.', again: 'Prrrr. Your work has passed the local quality inspection.' },
  { id: 'picnic', name: 'Out of office', place: 'Picnic terrace', x: 1658, y: 434, w: 128, h: 112,
    asset: 'park/picnic-shelter-v2.png', action: 'Take a picnic break', effect: 'breeze',
    hint: 'Climb the stairs beside the project garden. Lunch is on the terrace.',
    text: 'A shady table, a packed lunch, and absolutely no meetings. Even a pixel person needs a screen break.', again: 'There is always room for one more at this picnic.' },
  { id: 'mushrooms', name: 'A secret in the shade', place: 'Mushroom grove', x: 372, y: 488, w: 32, h: 32,
    asset: 'nature/mushroom-purple.png', action: 'Wake the mushrooms', effect: 'spark',
    hint: 'Take the back door of the tent into the little woodland garden.',
    text: 'A tiny constellation lights up under the trees. Some things are worth taking the long way for.', again: 'The mushrooms put on another very small, very private light show.' },
  { id: 'lookout', name: 'Take the scenic route', place: 'Seaside promenade', x: 1150, y: 1250, w: 64, h: 24,
    asset: 'nature/wood-bench.png', action: 'Enjoy the sea breeze', effect: 'breeze',
    hint: 'Find a quiet seat near the southern arch and fishing dock.',
    text: 'No deadlines here. Just the sea, a good bench, and nowhere you need to be.', again: 'The tide is in. You can stay a little longer.' }
];

var PARK_LANDMARKS = [
  { work: true, asset: 'park/art-pavilion-v2.png', x: 1568, y: 902, w: 128, h: 112, action: 'Explore my work' },
  { projectId: 'colorle', asset: 'park/colorle-stand.svg', x: 1468, y: 1096, w: 50, h: 62, action: 'Discover Colorle' },
  { projectId: 'wiigit', asset: 'park/wiigit-stand.svg', x: 1608, y: 1170, w: 50, h: 62, action: 'Discover Wiigit' },
  { projectId: 'random-sites', asset: 'park/web-stand.svg', x: 1742, y: 1096, w: 50, h: 62, action: 'Discover Random Sites' }
];

var PARK_SCENERY = [];
(function () {
  function prop(asset, x, y, w, h, ground) {
    PARK_SCENERY.push({ asset: asset, x: x, y: y, w: w, h: h, ground: !!ground });
  }
  function tree(x, y) { prop('nature/tall-tree.png', x, y, 62, 68); }
  function flowers(x, y) { prop('nature/pink-tulips.png', x, y, 24, 24); }
  function bush(x, y) { prop('nature/bush.png', x, y, 28, 24); }
  // Welcome garden: a fountain framed by seating and flowers.
  [[630,382],[858,390]].forEach(function (p) { tree(p[0],p[1]); });
  prop('nature/wood-bench.png', 684, 428, 64, 24);
  [[738,388],[844,430],[702,388],[886,458]].forEach(function(p){ flowers(p[0],p[1]); });
  // A secluded orchard behind the tent, with a walkable center.
  [[184,390],[266,392],[370,386],[188,506]].forEach(function(p){ tree(p[0],p[1]); });
  prop('nature/moss-log.png', 320, 450, 48, 28);
  prop('nature/mushroom-yellow.png', 226, 474, 24, 24);
  prop('nature/mushroom-purple.png', 400, 524, 22, 22);
  [[260,540],[350,552]].forEach(function(p){ flowers(p[0],p[1]); });
  // Woodland pockets along the western path.
  [[462,394],[462,562],[654,652],[654,850],[650,1008]].forEach(function(p){ tree(p[0],p[1]); });
  prop('nature/moss-log.png', 660, 744, 48, 26);
  prop('nature/mushroom-yellow.png', 682, 898, 24, 24);
  prop('nature/mushroom-purple.png', 480, 786, 24, 24);
  [[478,460],[478,628],[676,710],[672,1100]].forEach(function(p){ bush(p[0],p[1]); });
  // A sheltered picnic court beside the existing soccer pitch.
  prop('nature/wood-bench.png', 1642, 622, 64, 24);
  [[1608,416],[1794,556],[1794,600],[1794,644],[1620,662],[1660,662],[1764,680]].forEach(function(p){ bush(p[0],p[1]); });
  [[1740,670],[1608,576]].forEach(function(p){ flowers(p[0],p[1]); });
  // Workshop courtyard: one building, three curated exhibits, and room to walk.
  [[1430,866],[1760,866],[1424,1204],[1760,1204]].forEach(function(p){ tree(p[0],p[1]); });
  prop('nature/wood-bench.png', 1518, 1244, 64, 24);
  prop('nature/wood-bench.png', 1684, 1244, 64, 24);
  [[1450,1010],[1792,1010],[1450,1050],[1792,1050],[1490,1264],[1760,1264]].forEach(function(p){ flowers(p[0],p[1]); });
  [[1510,916],[1738,916],[1430,1158],[1800,1158]].forEach(function(p){ bush(p[0],p[1]); });
  // The promenade has two small destinations, each with a seat and planted edges.
  [[696,1208],[846,1208],[1132,1208],[1282,1208]].forEach(function(p){ flowers(p[0],p[1]); });
  [[696,1110],[850,1110],[1132,1110],[1282,1110]].forEach(function(p){ bush(p[0],p[1]); });
  // Promenade seating and flowers along the south fence.
  prop('nature/wood-bench.png', 780, 1252, 64, 24);
  [[686,1254],[858,1244],[1094,1252],[1242,1254]].forEach(function(p){ flowers(p[0],p[1]); });
  [[704,1280],[744,1280],[1214,1280],[1260,1280]].forEach(function(p){ bush(p[0],p[1]); });
  // Eastern approach and the otherwise bare strip beside the gallery.
  [[1394,700],[1354,1284]].forEach(function(p){ flowers(p[0],p[1]); });
  // Only the bases of trees and benches are solid, so canopies can overlap Dylan.
  PARK_SCENERY.concat(PARK_STOPS).forEach(function (p) {
    var tree = p.asset === 'nature/tall-tree.png';
    var bench = p.asset === 'nature/wood-bench.png';
    if (!tree && !bench) return;
    WORLD_COLLIDERS.mainMap.solids.push({
      x: p.x + (tree ? 22 : 4), y: p.y + p.h - 8,
      width: tree ? 14 : p.w - 8, height: 6, tag: 'parkProp'
    });
  });
  WORLD_COLLIDERS.mainMap.solids.push(
    { x: 736, y: 1188, width: 84, height: 34, tag: 'parkLibrary' },
    { x: 1174, y: 1188, width: 84, height: 34, tag: 'tackleHut' },
    { x: 1590, y: 970, width: 84, height: 34, tag: 'artPavilion' },
    { x: 1680, y: 498, width: 84, height: 34, tag: 'picnicShelter' }
  );
})();
