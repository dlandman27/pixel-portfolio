# Woodland preview style

The preview uses an orthographic 2.5D projection at **48 degrees**. It is built
from individual transparent props over procedural terrain, not a flattened map
painting. Keep future additions in this same coordinate and visual system.

## Coordinates and depth

- Author positions and collisions in `woodland-world.js` using logical world
  units. Navigation remains in those units; do not compress collision boxes.
- `woodland-depth.js` is the camera authority. `groundY(y)` projects the ground;
  `bounds(object)` gives a prop's rendered rectangle. Reuse these for markers,
  shadows, new characters, and camera targets.
- Water, paths, decks, flowers, ferns, and low ground cover compress with the
  ground. Never turn repeating ground textures into upright strips.
- Trees, cliffs, buildings, reeds, rocks, benches, and characters retain their
  sprite height. Their feet stay anchored to the projected ground coordinate.
- `foot` determines object ordering and grounding. Ground layers remain below
  the traveler; separate foreground bridge rails remain above the deck.
- Tall foreground objects fade only while overlapping Dylan. Keep the fade
  optional for low ground cover, which should never hide him.

## Art

Use crisp square pixel clusters on the renderer's two-unit logical pixel grid.
The shared palette is moss/olive foliage, slate stone, teal water and shadows,
warm timber, cream canvas, and restrained amber lights. New transparent props
must match the existing three-quarter view and light from the upper left.
Cast shadows go southeast; ground contact shadows stay soft and dark teal.
No baked rectangular grass patches or glow halos around isolated props.

The current tent was generated with the built-in image tool using this brief:
"Isolated woodland A-frame canvas tent, olive moss-green canvas, warm tan
rolled entrance flaps, dark teal interior, timber ridge poles, and an amber
lantern; three-quarter top-down RPG pixel art, crisp square clusters, transparent
background, no ground patch or lettering." Its asset is
`resources/images/world-v2/woodland-tent.png`.

## Verification

Run `node --test tests/*.test.cjs` after editing world data or projection.
Route tests sample every authored trail against actual terrain and solids.
Depth tests check upright grounding, compressed decks, flat ground cover, and
foreground visibility. Also inspect Entrance, Whole map, and walking views in
a browser: terrain, destination markers and traveler must stay aligned.
Test both desktop and narrow viewports, and reduced motion when adding effects.
The original `index.html` world is separate from this preview.

## Character and HUD

The woodland character currently uses the original authored walking frames in
`resources/images/characters/skins/forest/`. Whole frames are decoded up front
and baked into equal 64x96 atlas cells. Eye position registers each frame
horizontally, while one fixed display height and foot baseline prevent drift.
No limbs or heads are cut apart or rotated. The generated alternative sheets
remain in `resources/images/characters/woodland/` as discarded source art and
are not loaded by the renderer.

Controls: WASD/arrows to walk, Shift to run, Space to jump. The onscreen Run
button toggles running for touch users. Running currently speeds up the same
authored walk cycle; a separate run cycle and wave frames still need art review.
The Wave control is disabled while its replacement frames are being redrawn.
Jump changes visual height while ground collisions remain enforced.

The HUD uses compact parchment/nameplate and timber controls around the screen
edges instead of a full-width header. Work remains directly accessible; it must
never require walking to a building. Interaction effects are separate world-space
canvases and respect reduced motion.
