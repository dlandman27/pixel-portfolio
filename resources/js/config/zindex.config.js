// zindex.config.js
// Configuration for dynamic z-index management based on player position
// Extracted from collision-engine.js for use with the new GameWorld system
//
// HOW IT WORKS:
// ============
// The z-index manager updates object z-indexes every frame based on the player's position.
// This allows the player to walk behind objects when above them, and in front when below them.
//
// RULE STRUCTURE:
// ===============
// Each rule has the following structure:
// {
//   selector: ".class-name" or "#id-name",  // CSS selector for the object(s)
//   whenAbove: {                            // When player is above this position
//     top: { max: Y },                      // Position condition
//     zIndex: 51                            // Z-index to apply
//   },
//   whenBelow: {                            // When player is below this position
//     top: { min: Y },                      // Position condition
//     zIndex: 48                            // Z-index to apply
//   },
//   default: {                              // Optional: fallback z-index
//     zIndex: 10
//   }
// }
//
// POSITION CONDITIONS:
// ===================
// - top: { max: Y }   - Player's Y position is less than or equal to Y
// - top: { min: Y }   - Player's Y position is greater than or equal to Y
// - top: { exact: Y } - Player's Y position is exactly Y
// - left: { max: X }  - Player's X position is less than or equal to X
// - left: { min: X }  - Player's X position is greater than or equal to X
// - left: { exact: X } - Player's X position is exactly X
//
// You can combine top and left conditions for more precise control.
//
// HOW TO ADD NEW Z-INDEX RULES:
// ==============================
// 1. Find the object in map.html and note its CSS class or ID
// 2. Determine the Y position where the player should transition (walk in game and press spacebar to log position)
// 3. Add a new rule to the appropriate scene array below
// 4. Set the selector to match the object
// 5. Set whenAbove to the z-index when player is above the object (usually higher z-index so player appears in front)
// 6. Set whenBelow to the z-index when player is below the object (usually lower z-index so object appears in front)
//
// EXAMPLE:
// ========
// To make player walk behind a tree at Y=500:
// {
//   selector: ".my-tree",
//   whenAbove: { top: { max: 500 }, zIndex: 100 },  // Player in front when above
//   whenBelow: { top: { min: 500 }, zIndex: 10 }    // Tree in front when below
// }

var ZINDEX_RULES = {
  // Main map z-index rules
  mainMap: [
    // Tent 1
    {
      selector: ".tent.t1",
      whenAbove: { top: { max: 706 }, zIndex: 100 },  // Player goes behind/into tent at entrance
      whenBelow: { top: { min: 648 }, zIndex: 48 },   // Tent in front when player is below
    },
    {
      selector: ".tentdoor.tent1",
      whenAbove: { top: { max: 706 }, zIndex: 99 },  // Door above player when entering
      whenBelow: { top: { min: 648 }, zIndex: 47 }
    },
    {
      selector: ".fence.tent1",
      whenAbove: { top: { max: 706 }, zIndex: 50 },
      whenBelow: { top: { min: 706 }, zIndex: 10 }
    },
    
    // Incline/Stairs area
    {
      selector: ".curved-tree",
      whenAbove: { top: { max: 716 }, zIndex: 48 },
      whenBelow: { top: { min: 716 }, zIndex: 51 }
    },
    
    // Soccer area
    {
      selector: ".soccer-goal",
      whenAbove: { top: { max: 456 }, zIndex: 48 },
      whenBelow: { top: { min: 456 }, zIndex: 51 }
    },
    {
      selector: ".soccer-goal.back",
      whenAbove: { top: { max: 456 }, zIndex: 48 },
      whenBelow: { top: { min: 456 }, zIndex: 51 }
    },
    {
      selector: ".soccer-ball",
      whenAbove: { top: { max: 560 }, zIndex: 48 },
      whenBelow: { top: { min: 560 }, zIndex: 51 }
    },
    
    // Pond/Island/Fountain
    {
      selector: ".fountain",
      whenAbove: { top: { max: 1028 }, zIndex: 100 },
      whenBelow: { top: { min: 1028 }, zIndex: 10 }
    },
    {
      selector: ".paper",
      whenAbove: { top: { max: 1028 }, zIndex: 101 },
      whenBelow: { top: { min: 1028 }, zIndex: 11 }
    },
    
    // Fire Pit area - Trees
    {
      selector: ".tall-tree.bottom",
      whenAbove: { top: { max: 1064 }, zIndex: 100 },
      whenBelow: { top: { min: 1064 }, zIndex: 5 }
    },
    {
      selector: ".tall-tree.right",
      whenAbove: { top: { max: 1064 }, zIndex: 100 },
      whenBelow: { top: { min: 1064 }, zIndex: 5 }
    },
    {
      selector: ".characters",
      whenAbove: { top: { max: 1064 }, zIndex: 101 },
      whenBelow: { top: { min: 1064 }, zIndex: 6 }
    },
    {
      selector: ".special-thanks-sign",
      whenAbove: { top: { max: 1064 }, zIndex: 101 },
      whenBelow: { top: { min: 1064 }, zIndex: 6 }
    },
    {
      selector: "#bonfire",
      whenAbove: { top: { max: 820 }, zIndex: 100 },
      whenBelow: { top: { min: 820 }, zIndex: 10 }
    },
    {
      selector: ".tall-tree.walls.left",
      whenAbove: { top: { max: 856 }, zIndex: 100 },
      whenBelow: { top: { min: 856 }, zIndex: 10 }
    },
    {
      selector: ".intro-portfolio.s5",
      whenAbove: { top: { max: 856 }, zIndex: 101 },
      whenBelow: { top: { min: 856 }, zIndex: 11 }
    },
    
    // Nature elements
    {
      selector: ".shrub.pathway.topShrubs",
      whenAbove: { top: { max: 448 }, zIndex: 100 },
      whenBelow: { top: { min: 448 }, zIndex: 11 }
    },
    {
      selector: ".bench",
      whenAbove: { top: { max: 764 }, zIndex: 100 },
      whenBelow: { top: { min: 868, max: 924 }, zIndex: 100 },
      default: { zIndex: 10 }
    },
    {
      selector: ".tree-stump",
      whenAbove: { top: { max: 852 }, zIndex: 100 },
      whenBelow: { top: { min: 852 }, zIndex: 10 }
    },
    {
      selector: "#stump",
      whenAbove: { top: { max: 446 }, zIndex: 100 },
      whenBelow: { top: { min: 446 }, zIndex: 10 }
    },
    {
      selector: "#falling-tree",
      whenAbove: { top: { max: 488 }, zIndex: 100 },
      whenBelow: { top: { min: 488 }, zIndex: 10 }
    },
    {
      selector: "#wood-log",
      whenAbove: { top: { max: 9999 }, zIndex: 150 },
      whenBelow: { top: { min: 0 }, zIndex: 150 }
    },
    {
      selector: ".s4",
      whenAbove: { top: { min: 668 }, zIndex: 40 },
      whenBelow: { top: { max: 668 }, zIndex: 51 }
    },
    {
      selector: ".s2, .s3",
      whenAbove: { top: { min: 436 }, zIndex: 40 },
      whenBelow: { top: { max: 436 }, zIndex: 51 }
    },
    {
      selector: ".s8",
      whenAbove: { top: { min: 956 }, zIndex: 40 },
      whenBelow: { top: { max: 956 }, zIndex: 51 }
    },
    {
      selector: "#arch",
      whenAbove: { top: { max: 344 }, zIndex: 100 },
      whenBelow: { top: { min: 344 }, zIndex: 11 }
    },
    
    // Fishing Frenzy sign at dock
    {
      selector: ".fishing-frenzy-sign",
      whenAbove: { top: { max: 1474 }, zIndex: 51 },
      whenBelow: { top: { min: 1474 }, zIndex: 48 }
    }
  ],
  
  // Tent 1 interior z-index rules (based on old static CSS z-indexes)
  // All selectors scoped to #tent1 to avoid conflicts with main map
  tent1: [
    // Player should always be in front in tent (z-index 9999)
    {
      selector: "#dylan",
      default: { zIndex: 9999 }
    },
    // Main tent interior background
    {
      selector: "#tent1 .tentInterior",
      default: { zIndex: 48 }
    },
    // Divider and divider walls
    {
      selector: "#tent1 .divider",
      default: { zIndex: 801 }
    },
    {
      selector: "#tent1 .tentInterior.tent1.divider-wall.bottomLining",
      default: { zIndex: 801 }
    },
    {
      selector: "#tent1 .tentInterior.tent1.divider-wall.topLining",
      default: { zIndex: 801 }
    },
    {
      selector: "#tent1 .tentInterior.tent1.divider-wall.topLining.t2",
      default: { zIndex: 801 }
    },
    // Kitchen area elements (behind player - player z-index is 9999)
    {
      selector: "#tent1 .shelf",
      default: { zIndex: 50 }
    },
    {
      selector: "#tent1 .kitchen",
      default: { zIndex: 50 }
    },
    {
      selector: "#tent1 .kitchen-table",
      default: { zIndex: 50 }
    },
    {
      selector: "#tent1 .backdoor",
      default: { zIndex: 50 }
    },
    {
      selector: "#tent1 .kitchen-floor",
      default: { zIndex: 10 }
    },
    // Center area (behind player)
    {
      selector: "#tent1 .painting",
      default: { zIndex: 50 }
    },
    {
      selector: "#tent1 .doormat",
      default: { zIndex: 50 }
    },
    // Den area
    {
      selector: "#tent1 .couch",
      default: { zIndex: 50 }
    },
    {
      selector: "#tent1 .tv.back",
      default: { zIndex: 50 }
    },
    // Tent linings (behind player)
    {
      selector: "#tent1 .tentInterior.tent1.bottomLining",
      default: { zIndex: 50 }
    },
    // Matchbox (interactive item)
    {
      selector: "#tent1 .matchbox",
      default: { zIndex: 9997 }
    }
  ],
  
  // Cave z-index rules
  cave: [
    // Timeline interactive signs are handled dynamically in game-world.js updateZIndexes()
    // based on each sign's individual Y position
  ]
};

