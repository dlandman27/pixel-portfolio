# Z-Index Management System

## Overview

This system dynamically updates the z-index of objects based on the player's position, allowing the player character to walk behind or in front of objects realistically.

## How It Works

The system consists of three main components:

### 1. **Z-Index Manager** (`resources/js/z-index-manager.js`)
   - Core logic that checks player position and updates object z-indexes
   - Called every frame from the GameWorld update loop
   - Optimized to only update z-indexes when they actually change

### 2. **Z-Index Configuration** (`resources/js/config/zindex.config.js`)
   - Data-driven configuration defining rules for each object
   - Organized by scene (mainMap, tent1, cave, etc.)
   - Easy to add new rules without touching code

### 3. **Integration** (`resources/js/game/game-world.js`)
   - `updateZIndexes()` method calls the manager every frame
   - Automatically resets when changing scenes
   - Works seamlessly with the physics-based movement system

## Key Features

- **Performance Optimized**: Only updates DOM when z-index actually changes
- **Data-Driven**: All rules defined in config, not hardcoded
- **Scene-Aware**: Different rules for different scenes (main map, tent, cave)
- **Easy to Debug**: Press spacebar in game to log current player position
- **Backward Compatible**: Works with both old and new movement systems

## File Structure

```
resources/
├── js/
│   ├── z-index-manager.js          # Core z-index management logic
│   ├── config/
│   │   └── zindex.config.js        # Z-index rules configuration
│   └── game/
│       └── game-world.js           # Integration point (updateZIndexes method)
└── components/
    └── map.html                    # Objects with z-index rules
```

## How to Add New Z-Index Rules

### Step 1: Identify the Object
Find the object in `resources/components/map.html` and note its CSS selector (class or ID).

Example:
```html
<div class="tent t1"></div>
<div id="falling-tree"></div>
```

### Step 2: Find the Transition Point
1. Walk your character near the object in the game
2. Press **spacebar** to log your current position to the console
3. Note the Y coordinate where the transition should happen

### Step 3: Add the Rule
Open `resources/js/config/zindex.config.js` and add a new rule to the appropriate scene:

```javascript
{
  selector: ".my-object",              // CSS selector
  whenAbove: {                         // When player is above this Y
    top: { max: 500 },                 // Condition
    zIndex: 100                        // Player appears in front
  },
  whenBelow: {                         // When player is below this Y
    top: { min: 500 },                 // Condition
    zIndex: 10                         // Object appears in front
  }
}
```

### Step 4: Test
Reload the page and test walking around the object. The z-index should update automatically!

## Rule Options

### Position Conditions

You can use the following conditions:

**Y Position (vertical):**
- `top: { max: Y }` - Player Y position ≤ Y
- `top: { min: Y }` - Player Y position ≥ Y
- `top: { exact: Y }` - Player Y position = Y

**X Position (horizontal):**
- `left: { max: X }` - Player X position ≤ X
- `left: { min: X }` - Player X position ≥ X
- `left: { exact: X }` - Player X position = X

**Combined:**
```javascript
{
  selector: ".object",
  whenAbove: {
    top: { max: 500 },
    left: { min: 100, max: 200 },  // Only in this X range
    zIndex: 100
  }
}
```

### Multiple Conditions

You can have three types of conditions:
1. **whenAbove** - Checked first (highest priority)
2. **whenBelow** - Checked second
3. **default** - Fallback if neither above/below match

Example:
```javascript
{
  selector: ".bench",
  whenAbove: { top: { max: 740 }, zIndex: 100 },
  whenBelow: { top: { min: 844, max: 900 }, zIndex: 100 },
  default: { zIndex: 10 }
}
```

## Common Patterns

### 1. Simple Front/Back Object
Player walks behind when above, in front when below:
```javascript
{
  selector: ".tree",
  whenAbove: { top: { max: 500 }, zIndex: 100 },
  whenBelow: { top: { min: 500 }, zIndex: 10 }
}
```

### 2. Object with Multiple Transition Points
Different z-index in multiple positions:
```javascript
{
  selector: ".bench",
  whenAbove: { top: { max: 740 }, zIndex: 100 },
  whenBelow: { top: { min: 844 }, zIndex: 100 },
  default: { zIndex: 10 }
}
```

### 3. Position-Specific Z-Index
Only changes z-index in a specific area:
```javascript
{
  selector: ".sign",
  whenAbove: {
    top: { max: 500 },
    left: { min: 100, max: 200 },
    zIndex: 100
  }
}
```

## Debugging

### Enable Visual Debug Overlays
The easiest way to debug z-index rules:

1. Open the game menu (hamburger icon)
2. Go to **Settings** tab
3. Click **"Show Debug Overlays"**

This will display:
- **Golden horizontal lines** - Z-index transition points
- **Golden markers** - Object centers
- **Info boxes** - Selector names and z-index values
- **Y coordinate labels** - Exact transition positions
- **Collision boxes** - Wall and boundary overlays (blue/red)

The z-index overlays animate with a gentle pulse to make them easy to spot!

### Enable Position Logging
Press **spacebar** while playing to log:
- Current player position (X, Y)
- Camera state
- Scene name

Example output:
```
WORLD_COLLIDER_POINT: 984 680
[CameraLog] player= 984.0 680.0 offset= 0.0 0.0 margin= 1234.0 -1234.0 scene= mainMap
```

### Visual Debug Legend

When debug overlays are enabled, you'll see:

- **🟡 Horizontal Line** - The Y coordinate where z-index changes
- **🟡 Circle** - Center of the object
- **📦 Black Box** - Shows selector and z-index values for above/below
- **Y=### Label** - The exact Y coordinate of the transition

### Check Z-Index Updates
Add a console.log in `z-index-manager.js` to see when z-indexes change:
```javascript
if (_previousZIndexes[key] !== newZIndex) {
  console.log("Updating", rule.selector, "to z-index", newZIndex);
  $(rule.selector).css("z-index", newZIndex);
  _previousZIndexes[key] = newZIndex;
}
```

## Performance Considerations

- **Optimized Updates**: Only updates DOM when z-index changes
- **Cached Lookups**: jQuery selectors cached per rule
- **Scene-Based**: Only processes rules for current scene
- **Frame-Independent**: Runs at display refresh rate via requestAnimationFrame

## Migration from Old System

The old collision-engine z-index system has been extracted into this new system:

**Old Way (in collision-engine.js):**
```javascript
{
  zIndex: {
    selector: ".tent.t1",
    whenAbove: { top: { max: 680 }, zIndex: 51 },
    whenBelow: { top: { min: 680 }, zIndex: 48 }
  }
}
```

**New Way (in zindex.config.js):**
```javascript
{
  selector: ".tent.t1",
  whenAbove: { top: { max: 680 }, zIndex: 51 },
  whenBelow: { top: { min: 680 }, zIndex: 48 }
}
```

The structure is identical - just moved to a dedicated config file!

## Troubleshooting

### Z-Index Not Updating
1. Check browser console for errors
2. Verify `ZINDEX_RULES` is defined (check console: `typeof ZINDEX_RULES`)
3. Verify `ZIndexManager` is defined (check console: `typeof ZIndexManager`)
4. Ensure scripts are loaded in correct order in `index.html`
5. Check that object selector matches HTML exactly

### Wrong Z-Index Applied
1. Print player position (press spacebar)
2. Check if position matches your rule conditions
3. Verify condition logic (max vs min)
4. Check for conflicting rules on same selector

### Z-Index Changes Too Late/Early
1. Press spacebar to find exact transition Y coordinate
2. Adjust the Y value in your rule
3. Test again

## Examples in Current Game

### Tent
```javascript
{
  selector: ".tent.t1",
  whenAbove: { top: { max: 680 }, zIndex: 51 },  // Player appears in front
  whenBelow: { top: { min: 680 }, zIndex: 48 }   // Tent appears in front
}
```

### Fountain
```javascript
{
  selector: ".fountain",
  whenAbove: { top: { max: 1028 }, zIndex: 100 },
  whenBelow: { top: { min: 1028 }, zIndex: 10 }
}
```

### Bench (Complex)
```javascript
{
  selector: ".bench",
  whenAbove: { top: { max: 740 }, zIndex: 100 },      // In front from top
  whenBelow: { top: { min: 844, max: 900 }, zIndex: 100 },  // In front from bottom
  default: { zIndex: 10 }                             // Behind in between
}
```

## Summary

The z-index system is now:
- ✅ **Data-driven** - Easy to configure
- ✅ **Performance optimized** - Minimal DOM updates
- ✅ **Scene-aware** - Different rules per scene
- ✅ **Well-documented** - Clear examples and patterns
- ✅ **Debuggable** - Built-in position logging
- ✅ **Maintainable** - Separated concerns

You can now easily add new objects and z-index rules without touching the core code!

