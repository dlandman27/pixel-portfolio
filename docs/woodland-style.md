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

The woodland character uses predecoded atlases in `resources/images/characters/woodland/`.
The source sheets contain eight columns and direction/action rows. Generated
faces varied between frames, so the renderer deliberately uses a single neutral
source figure per direction and animates its limbs continuously. Head and eye
pixels are invariant while facing the same way. Feet align at logical y44;
movement and camera positions retain subpixel precision before scene zoom.

Controls: WASD/arrows to walk, Shift to run, Space to jump, F to wave. The
onscreen Run button toggles running for touch users. Jump changes visual height
while collision checks remain on the ground; it does not bypass walls or water.
Moving cancels a wave. Dialogs prevent movement and new character actions.

Character images were generated with the built-in image tool, referencing Dylan's
original hair, beard and proportions. Generation briefs:

- Walk: olive field jacket, cream shirt, charcoal trousers and brown hiking boots;
  transparent eight-column/four-row sheet; eight ordered contact/down/passing/up
  poses per direction; consistent head size, pixel scale and foot baseline.
- Run: same character and outfit; eight-column/four-row sheet; stronger arm swing,
  bent knees, airborne passing poses and slight forward lean.
- Actions: same character; eight-column/two-row front-facing sheet; jump sequence
  (neutral, crouch, takeoff, rise, apex, fall, land, neutral) followed by wave
  sequence (neutral, lift hand, raise elbow, wave left/right, lower, neutral).

The HUD uses compact parchment/nameplate and timber controls around the screen
edges instead of a full-width header. Work remains directly accessible; it must
never require walking to a building. Interaction effects are separate world-space
canvases and respect reduced motion.
