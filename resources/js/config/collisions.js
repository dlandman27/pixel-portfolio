// Collision configuration for the pixel portfolio world
// This replaces the hardcoded collision logic with a data-driven approach

var COLLISION_CONFIG = {
  // Global conditions that block all movement
  globalBlocks: [
    {
      condition: function() { return typeof onLog !== "undefined" && onLog; },
      description: "Block movement when on log"
    }
  ],

  // Main map collisions (legacy line-based system still used by script.js)
  mainMap: {
    // Distance per iteration based on element type
    distancePerIteration: {
      "body-top": -12,
      "body-left": -12,
      "dylan-top": 4,
      "dylan-left": 4,
      "dylan-bottom": 4,
      "dylan-right": 4
    },

    // Window/viewport boundaries
    viewport: [
      {
        element: "body-top",
        condition: { top: { max: 204 } },
        description: "Top viewport boundary"
      }
    ],

    // Vertical collisions (up/down movement)
    vertical: [
      // Tent 1
      {
        position: { top: { exact: 680 }, left: { min: 200, max: 288 } },
        blockKey: "keyCode1", // blocks up
        description: "Tent 1 front collision"
      },
      {
        position: { top: { exact: 680 }, left: { min: 296, max: 384 } },
        blockKey: "keyCode1",
        description: "Tent 1 front collision (right side)"
      },
      {
        zIndex: {
          selector: ".tent.t1",
          whenAbove: { top: { max: 680 }, zIndex: 51 },
          whenBelow: { top: { min: 680 }, zIndex: 48 }
        }
      },

      // Fences
      {
        position: { top: { max: 348 }, left: { or: [{ max: 948 }, { min: 1016 }] } },
        blockKey: "keyCode1",
        description: "Top fence"
      },
      {
        position: { top: { exact: 1272 }, left: { or: [{ max: 952 }, { min: 1020 }] } },
        blockKey: "keyCode2",
        description: "Bottom fence"
      },
      {
        position: { top: { exact: 796 }, left: { max: 484 } },
        blockKey: "keyCode2",
        description: "Fence opposite tent 1"
      },
      {
        position: { top: { exact: 648 }, left: { max: 452 } },
        blockKey: "keyCode1",
        description: "Fence on tent 1"
      },
      {
        position: { top: { exact: 616 }, left: { max: 412 } },
        blockKey: "keyCode2",
        description: "Backyard fence tent 1"
      },
      {
        zIndex: {
          selector: ".fence.tent1",
          whenAbove: { top: { max: 628 }, zIndex: 50 },
          whenBelow: { top: { min: 628 }, zIndex: 10 }
        }
      },

      // Dock
      {
        position: { top: { min: 1444 } },
        blockKey: "keyCode2",
        description: "Dock bottom boundary"
      },

      // Doors
      {
        position: { top: { max: 160 }, left: { or: [{ max: 968 }, { min: 992 }] } },
        blockKey: "keyCode1",
        description: "Cave door"
      },
      {
        position: { top: { exact: 108 } },
        blockKey: "keyCode1",
        action: function() {
          if (typeof openTutorial === "function") openTutorial();
        },
        description: "Tutorial trigger"
      },

      // Incline/Stairs
      {
        position: { top: { exact: 740 }, left: { min: 1412, max: 1576 } },
        blockKey: "keyCode1",
        description: "Bottom of incline"
      },
      {
        position: { top: { exact: 756 }, left: { min: 1640, max: 1716 } },
        blockKey: "keyCode1",
        description: "Right side staircase bottom"
      },
      {
        position: { top: { exact: 756 }, left: { min: 1572, max: 1608 } },
        blockKey: "keyCode1",
        description: "Left side staircase bottom"
      },
      {
        position: { top: { exact: 396 }, left: { min: 1472, max: 1688 } },
        blockKey: "keyCode1",
        description: "Top of cliff"
      },
      {
        position: { top: { exact: 680 }, left: { or: [{ min: 1472, max: 1608 }, { min: 1636, max: 1688 }] } },
        blockKey: "keyCode2",
        description: "Bottom of top cliff"
      },
      {
        position: { top: { min: 680, max: 756 }, left: { min: 1608, max: 1636 } },
        distanceModifier: { "dylan-top": 8, "body-top": -24 },
        description: "Staircase speed modifier"
      },
      {
        zIndex: {
          selector: ".curved-tree",
          whenAbove: { top: { max: 716 }, zIndex: 48 },
          whenBelow: { top: { min: 716 }, zIndex: 51 }
        }
      },

      // Soccer area
      {
        zIndex: {
          selector: ".soccer-goal",
          whenAbove: { top: { max: 456 }, zIndex: 48 },
          whenBelow: { top: { min: 456 }, zIndex: 51 }
        }
      },
      {
        zIndex: {
          selector: ".soccer-goal.back",
          whenAbove: { top: { max: 456 }, zIndex: 48 },
          whenBelow: { top: { min: 456 }, zIndex: 51 }
        }
      },
      {
        zIndex: {
          selector: ".soccer-ball",
          whenAbove: { top: { max: 560 }, zIndex: 48 },
          whenBelow: { top: { min: 560 }, zIndex: 51 }
        }
      },

      // Pond/Island
      {
        position: { top: { exact: 828 }, left: { min: 1412, max: 1716 } },
        blockKey: "keyCode2",
        description: "Pond outer top"
      },
      {
        position: { top: { exact: 1212 }, left: { min: 1412, max: 1804 } },
        blockKey: "keyCode1",
        description: "Pond outer bottom"
      },
      {
        position: { top: { exact: 972 }, left: { min: 1396, max: 1412 } },
        blockKey: "keyCode2",
        description: "Bridge outside bottom"
      },
      {
        position: { top: { exact: 1040 }, left: { min: 1396, max: 1412 } },
        blockKey: "keyCode1",
        description: "Bridge outside top"
      },
      {
        position: { top: { exact: 952 }, left: { min: 1548, max: 1684 } },
        blockKey: "keyCode1",
        description: "Island top"
      },
      {
        position: { top: { exact: 1100 }, left: { min: 1548, max: 1684 } },
        blockKey: "keyCode2",
        description: "Island bottom"
      },
      {
        zIndex: {
          selector: ".fountain",
          whenAbove: { top: { max: 1028 }, zIndex: 100 },
          whenBelow: { top: { min: 1028 }, zIndex: 10 }
        }
      },
      {
        zIndex: {
          selector: ".paper",
          whenAbove: { top: { max: 1028 }, zIndex: 101 },
          whenBelow: { top: { min: 1028 }, zIndex: 11 }
        }
      },
      {
        position: { top: { exact: 1044 }, left: { min: 1572, max: 1652 } },
        blockKey: "keyCode1",
        description: "Fountain top"
      },
      {
        position: { top: { exact: 992 }, left: { min: 1572, max: 1652 } },
        blockKey: "keyCode2",
        description: "Fountain bottom"
      },

      // Fire Pit area
      {
        zIndex: {
          selector: ".tall-tree.bottom",
          whenAbove: { top: { max: 1064 }, zIndex: 100 },
          whenBelow: { top: { min: 1064 }, zIndex: 5 }
        }
      },
      {
        zIndex: {
          selector: ".tall-tree.right",
          whenAbove: { top: { max: 1064 }, zIndex: 100 },
          whenBelow: { top: { min: 1064 }, zIndex: 5 }
        }
      },
      {
        zIndex: {
          selector: ".characters",
          whenAbove: { top: { max: 1064 }, zIndex: 101 },
          whenBelow: { top: { min: 1064 }, zIndex: 6 }
        }
      },
      {
        zIndex: {
          selector: ".special-thanks-sign",
          whenAbove: { top: { max: 1064 }, zIndex: 101 },
          whenBelow: { top: { min: 1064 }, zIndex: 6 }
        }
      },
      {
        position: { top: { min: 548, max: 624 }, left: { min: 972, max: 1004 } },
        distanceModifier: { "dylan-top": 8, "body-top": -24 },
        description: "Fire pit staircase speed modifier"
      },
      {
        position: { top: { exact: 552 }, left: { or: [{ min: 680, max: 972 }, { min: 1004, max: 1292 }] } },
        blockKey: "keyCode2",
        description: "Bottom cliff"
      },
      {
        position: { top: { exact: 984 }, left: { min: 788, max: 1180 } },
        blockKey: "keyCode2",
        description: "Bottom cliff 2"
      },
      {
        position: { top: { exact: 628 }, left: { or: [{ min: 1004, max: 1180 }, { min: 784, max: 968 }] } },
        blockKey: "keyCode1",
        description: "Top cliff"
      },
      {
        position: { top: { exact: 1068 }, left: { min: 680, max: 1292 } },
        blockKey: "keyCode1",
        description: "Bottom trees"
      },
      {
        position: { top: { exact: 876 }, left: { min: 684, max: 724 } },
        blockKey: "keyCode1",
        description: "Trees between stairs"
      },
      {
        position: { top: { exact: 1016 }, left: { min: 684, max: 724 } },
        blockKey: "keyCode2",
        description: "Trees between stairs bottom"
      },
      {
        zIndex: {
          selector: "#bonfire",
          whenAbove: { top: { max: 804 }, zIndex: 100 },
          whenBelow: { top: { min: 804 }, zIndex: 10 }
        }
      },
      {
        position: { top: { exact: 780 }, left: { min: 936, max: 1032 } },
        blockKey: "keyCode2",
        description: "Bonfire top"
      },
      {
        position: { top: { exact: 824 }, left: { min: 936, max: 1032 } },
        blockKey: "keyCode1",
        description: "Bonfire bottom"
      },
      {
        position: { top: { exact: 900 }, left: { min: 788, max: 820 } },
        blockKey: "keyCode2",
        description: "Fire pit left staircase bottom"
      },
      {
        position: { top: { exact: 972 }, left: { min: 788, max: 820 } },
        blockKey: "keyCode1",
        description: "Fire pit left staircase top"
      },

      // Nature elements
      {
        zIndex: {
          selector: ".shrub.pathway.topShrubs",
          whenAbove: { top: { max: 448 }, zIndex: 100 },
          whenBelow: { top: { min: 448 }, zIndex: 11 }
        }
      },
      {
        position: { top: { exact: 320 }, left: { or: [{ min: 896, max: 968 }, { min: 1008, max: 1068 }] } },
        blockKey: "keyCode2",
        description: "Bushes by bridge top"
      },
      {
        position: { top: { exact: 448 }, left: { or: [{ min: 896, max: 968 }, { min: 1008, max: 1068 }] } },
        blockKey: "keyCode1",
        description: "Bushes by bridge bottom"
      },
      {
        zIndex: {
          selector: ".bench",
          whenAbove: { top: { max: 740 }, zIndex: 100 },
          whenBelow: { top: { min: 844, max: 900 }, zIndex: 100 },
          default: { zIndex: 10 }
        }
      },
      {
        position: { top: { or: [{ exact: 740 }, { exact: 900 }] }, left: { min: 900, max: 1064 } },
        blockKey: "keyCode1",
        description: "Log bench top"
      },
      {
        position: { top: { or: [{ exact: 704 }, { exact: 868 }] }, left: { min: 900, max: 1064 } },
        blockKey: "keyCode2",
        description: "Log bench bottom"
      },
      {
        zIndex: {
          selector: ".tree-stump",
          whenAbove: { top: { max: 796 }, zIndex: 100 },
          whenBelow: { top: { min: 796 }, zIndex: 10 }
        }
      },
      {
        position: { top: { exact: 796 }, left: { or: [{ min: 1064, max: 1160 }, { min: 808, max: 904 }] } },
        blockKey: "keyCode2",
        description: "Wood stumps top"
      },
      {
        position: { top: { exact: 836 }, left: { or: [{ min: 1064, max: 1160 }, { min: 808, max: 904 }] } },
        blockKey: "keyCode1",
        description: "Wood stumps bottom"
      },
      {
        zIndex: {
          selector: "#stump",
          whenAbove: { top: { max: 376 }, zIndex: 100 },
          whenBelow: { top: { min: 376 }, zIndex: 10 }
        }
      },
      {
        position: { top: { exact: 376 }, left: { min: 324, max: 412 } },
        blockKey: "keyCode2",
        description: "Stump with axe top"
      },
      {
        position: { top: { exact: 412 }, left: { min: 324, max: 412 } },
        blockKey: "keyCode1",
        description: "Stump with axe bottom"
      },
      {
        zIndex: {
          selector: "#falling-tree",
          whenAbove: { top: { max: 448 }, zIndex: 100 },
          whenBelow: { top: { min: 448 }, zIndex: 10 }
        }
      },
      // Tree collision (standing vs fallen)
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount < 7; },
        position: { top: { exact: 464 }, left: { min: 212, max: 272 } },
        blockKey: "keyCode1",
        description: "Tree standing top"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount < 7; },
        position: { top: { exact: 448 }, left: { min: 212, max: 272 } },
        blockKey: "keyCode2",
        description: "Tree standing bottom"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount >= 7; },
        position: { top: { exact: 464 }, left: { min: 184, max: 376 } },
        blockKey: "keyCode1",
        description: "Tree fallen top"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount >= 7; },
        position: { top: { exact: 448 }, left: { min: 184, max: 376 } },
        blockKey: "keyCode2",
        description: "Tree fallen bottom"
      },
      {
        zIndex: {
          selector: "#wood-log",
        whenAbove: { top: { max: 472 }, zIndex: 100 },
          whenBelow: { top: { min: 472 }, zIndex: 10 }
        }
      },
      {
        zIndex: {
          selector: ".s4",
          whenAbove: { top: { min: 668 }, zIndex: 40 },
          whenBelow: { top: { max: 668 }, zIndex: 51 }
        }
      },
      {
        zIndex: {
          selector: ".s2, .s3",
          whenAbove: { top: { min: 436 }, zIndex: 40 },
          whenBelow: { top: { max: 436 }, zIndex: 51 }
        }
      },
      {
        zIndex: {
          selector: ".s8",
          whenAbove: { top: { min: 956 }, zIndex: 40 },
          whenBelow: { top: { max: 956 }, zIndex: 51 }
        }
      }
    ],

    // Horizontal collisions (left/right movement)
    horizontal: [
      // Fences
      {
        position: { left: { max: 168 }, top: { min: 344 } },
        blockKey: "keyCode1",
        description: "Left fence"
      },
      {
        position: { left: { min: 1800 } },
        blockKey: "keyCode2",
        description: "Right fence"
      },
      {
        position: { left: { exact: 452 }, top: { max: 640 } },
        blockKey: "keyCode1",
        description: "Backyard fence"
      },
      {
        position: { left: { exact: 412 }, top: { max: 630 } },
        blockKey: "keyCode2",
        description: "Backyard fence 2"
      },
      {
        position: { left: { exact: 484 }, top: { min: 800 } },
        blockKey: "keyCode1",
        description: "Bottom left fence by trees"
      },

      // Dock
      {
        position: { top: { min: 1272 }, left: { max: 952 } },
        blockKey: "keyCode1",
        description: "Dock left"
      },
      {
        position: { top: { min: 1272 }, left: { min: 1020 } },
        blockKey: "keyCode2",
        description: "Dock right"
      },

      // Tent 1
      {
        position: { top: { min: 584, max: 676 }, left: { or: [{ exact: 384 }, { exact: 288 }] } },
        blockKey: "keyCode1",
        description: "Tent 1 left wall"
      },
      {
        position: { top: { min: 584, max: 676 }, left: { or: [{ exact: 200 }, { exact: 296 }] } },
        blockKey: "keyCode2",
        description: "Tent 1 right wall"
      },

      // Resume Island / Pond
      {
        position: { left: { exact: 1412 }, top: { or: [{ min: 828, max: 972 }, { min: 1040, max: 1212 }] } },
        blockKey: "keyCode2",
        description: "Resume island left outside"
      },
      {
        position: { top: { or: [{ min: 1020, max: 1040 }, { min: 972, max: 1000 }] }, left: { exact: 1392 } },
        blockKey: "keyCode2",
        description: "Bridge outside left"
      },
      {
        position: { top: { or: [{ min: 1020, max: 1040 }, { min: 972, max: 1000 }] }, left: { exact: 1548 } },
        blockKey: "keyCode1",
        description: "Bridge outside right"
      },
      {
        position: { left: { exact: 1548 }, top: { or: [{ min: 1020, max: 1212 }, { min: 944, max: 996 }] } },
        blockKey: "keyCode1",
        description: "Pond left side inside"
      },
      {
        position: { left: { exact: 1684 }, top: { min: 944, max: 1548 } },
        blockKey: "keyCode2",
        description: "Pond right side inside"
      },
      {
        position: { top: { min: 992, max: 1044 }, left: { exact: 1652 } },
        blockKey: "keyCode1",
        description: "Fountain left"
      },
      {
        position: { top: { min: 992, max: 1044 }, left: { exact: 1572 } },
        blockKey: "keyCode2",
        description: "Fountain right"
      },

      // Fire Pit
      {
        position: { left: { exact: 936 }, top: { min: 780, max: 824 } },
        blockKey: "keyCode2",
        description: "Bonfire left"
      },
      {
        position: { left: { exact: 1032 }, top: { min: 780, max: 824 } },
        blockKey: "keyCode1",
        description: "Bonfire right"
      },
      {
        zIndex: {
          selector: ".tall-tree.walls.left",
          whenAbove: { top: { max: 856 }, zIndex: 100 },
          whenBelow: { top: { min: 856 }, zIndex: 10 }
        }
      },
      {
        zIndex: {
          selector: ".intro-portfolio.s5",
          whenAbove: { top: { max: 856 }, zIndex: 101 },
          whenBelow: { top: { min: 856 }, zIndex: 11 }
        }
      },
      {
        position: { top: { min: 552, max: 1068 }, left: { exact: 1292 } },
        blockKey: "keyCode1",
        description: "Left trees right side"
      },
      {
        position: { top: { or: [{ min: 556, max: 876 }, { min: 1012, max: 1068 }] }, left: { exact: 680 } },
        blockKey: "keyCode2",
        description: "Right trees left side"
      },
      {
        position: { top: { min: 552, max: 624 }, left: { exact: 972 } },
        blockKey: "keyCode1",
        description: "Staircase left"
      },
      {
        position: { top: { min: 552, max: 624 }, left: { exact: 1004 } },
        blockKey: "keyCode2",
        description: "Staircase right"
      },
      {
        position: { top: { min: 628, max: 984 }, left: { exact: 1176 } },
        blockKey: "keyCode2",
        description: "Right cliff"
      },
      {
        position: { top: { or: [{ min: 628, max: 904 }, { min: 936, max: 1012 }] }, left: { exact: 788 } },
        blockKey: "keyCode1",
        description: "Left cliff"
      },
      {
        position: { top: { or: [{ min: 684, max: 904 }, { min: 936, max: 1016 }] }, left: { exact: 724 } },
        blockKey: "keyCode2",
        description: "Left cliff outside"
      },
      {
        position: { top: { or: [{ min: 904, max: 924 }, { min: 952, max: 968 }] }, left: { exact: 820 } },
        blockKey: "keyCode1",
        description: "Staircase left 2"
      },

      // Inclined Surface
      {
        position: { left: { exact: 1412 }, top: { min: 344, max: 736 } },
        blockKey: "keyCode2",
        description: "Incline left cliff"
      },
      {
        position: { left: { exact: 1572 }, top: { min: 740, max: 752 } },
        blockKey: "keyCode2",
        description: "Outside left staircase"
      },
      {
        position: { left: { exact: 1688 }, top: { min: 360, max: 680 } },
        blockKey: "keyCode2",
        description: "Right side top"
      },
      {
        position: { left: { exact: 1472 }, top: { min: 360, max: 680 } },
        blockKey: "keyCode1",
        description: "Left side top"
      },
      {
        position: { left: { exact: 1608 }, top: { min: 680, max: 756 } },
        blockKey: "keyCode1",
        description: "Inside staircase left"
      },
      {
        position: { left: { exact: 1636 }, top: { min: 680, max: 756 } },
        blockKey: "keyCode2",
        description: "Inside staircase right"
      },

      // Pond
      {
        position: { left: { exact: 1716 }, top: { min: 752, max: 832 } },
        blockKey: "keyCode2",
        description: "Pond right side"
      },

      // Nature
      {
        position: { top: { min: 320, max: 448 }, left: { exact: 960 } },
        blockKey: "keyCode1",
        description: "Top bushes"
      },
      {
        position: { top: { min: 320, max: 448 }, left: { exact: 1008 } },
        blockKey: "keyCode2",
        description: "Top bushes 2"
      },
      {
        position: { top: { min: 320, max: 448 }, left: { exact: 1068 } },
        blockKey: "keyCode1",
        description: "Top bushes 3"
      },
      {
        position: { top: { min: 320, max: 448 }, left: { exact: 896 } },
        blockKey: "keyCode2",
        description: "Top bushes 4"
      },
      {
        zIndex: {
          selector: "#arch",
          whenAbove: { top: { max: 344 }, zIndex: 100 },
          whenBelow: { top: { min: 344 }, zIndex: 11 }
        }
      },
      {
        position: { top: { max: 344 }, left: { max: 952 } },
        blockKey: "keyCode1",
        description: "Top bridge left"
      },
      {
        position: { top: { max: 344 }, left: { min: 1012 } },
        blockKey: "keyCode2",
        description: "Top bridge right"
      },
      {
        position: { top: { max: 160 }, left: { max: 968 } },
        blockKey: "keyCode1",
        description: "Cave door left"
      },
      {
        position: { top: { max: 160 }, left: { min: 992 } },
        blockKey: "keyCode2",
        description: "Cave door right"
      },
      {
        position: { top: { or: [{ min: 704, max: 740 }, { min: 864, max: 900 }] }, left: { exact: 900 } },
        blockKey: "keyCode2",
        description: "Log in fireplace left"
      },
      {
        position: { top: { or: [{ min: 704, max: 740 }, { min: 864, max: 900 }] }, left: { exact: 1064 } },
        blockKey: "keyCode1",
        description: "Log in fireplace right"
      },
      {
        position: { top: { min: 796, max: 836 }, left: { or: [{ exact: 808 }, { exact: 1064 }] } },
        blockKey: "keyCode2",
        description: "Tree stumps left"
      },
      {
        position: { top: { min: 796, max: 836 }, left: { or: [{ exact: 904 }, { exact: 1160 }] } },
        blockKey: "keyCode1",
        description: "Tree stumps right"
      },
      {
        position: { top: { min: 376, max: 412 }, left: { exact: 324 } },
        blockKey: "keyCode2",
        description: "Stump with axe left"
      },
      {
        position: { top: { min: 376, max: 412 }, left: { exact: 412 } },
        blockKey: "keyCode1",
        description: "Stump with axe right"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount < 7; },
        position: { top: { min: 448, max: 464 }, left: { exact: 212 } },
        blockKey: "keyCode2",
        description: "Tree standing left"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount < 7; },
        position: { top: { min: 448, max: 464 }, left: { exact: 272 } },
        blockKey: "keyCode1",
        description: "Tree standing right"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount >= 7; },
        position: { top: { min: 448, max: 464 }, left: { exact: 184 } },
        blockKey: "keyCode2",
        description: "Tree fallen left"
      },
      {
        condition: function() { return typeof hitCount !== "undefined" && hitCount >= 7; },
        position: { top: { min: 448, max: 464 }, left: { exact: 376 } },
        blockKey: "keyCode1",
        description: "Tree fallen right"
      },
      {
        position: { top: { min: 356, max: 384 }, left: { exact: 652 } },
        blockKey: "keyCode2",
        description: "Moss log left"
      },
      {
        position: { top: { min: 356, max: 384 }, left: { exact: 780 } },
        blockKey: "keyCode1",
        description: "Moss log right"
      }
    ]
  },

  // Tent 1 interior collisions (legacy)
  tent1: {
    globalBlocks: [
      {
        condition: function() { return typeof sitting !== "undefined" && sitting; },
        description: "Block movement when sitting"
      }
    ],
    distancePerIteration: {
      "body-top": -12,
      "body-left": -12,
      "dylan-top": 4,
      "dylan-left": 4
    },
    vertical: [
      {
        position: { top: { exact: 176 } },
        blockKey: "keyCode2",
        description: "Tent 1 bottom border"
      },
      {
        position: { top: { exact: 132 }, left: { or: [{ max: 152 }, { min: 232 }] } },
        blockKey: "keyCode2",
        description: "Tent 1 bottom border 2"
      },
      {
        position: { top: { exact: -44 } },
        blockKey: "keyCode1",
        description: "Tent 1 top border"
      },
      {
        position: { top: { exact: 52 }, left: { min: 168, max: 264 } },
        blockKey: "keyCode1",
        description: "Tent 1 border wall"
      },
      {
        position: { top: { exact: -32 }, left: { max: 100 } },
        blockKey: "keyCode1",
        description: "Kitchenware"
      },
      {
        zIndex: {
          selector: ".kitchen-table",
          whenAbove: { top: { max: -12 }, zIndex: 10000 },
          whenBelow: { top: { min: -12 }, zIndex: 9996 }
        }
      },
      {
        zIndex: {
          selector: ".matchbox",
          whenAbove: { top: { max: -12 }, zIndex: 10001 },
          whenBelow: { top: { min: -12 }, zIndex: 9997 }
        }
      },
      {
        position: { top: { exact: 32 }, left: { min: 8, max: 120 } },
        blockKey: "keyCode1",
        description: "Kitchen table top"
      },
      {
        position: { top: { exact: -12 }, left: { min: 8, max: 120 } },
        blockKey: "keyCode2",
        description: "Kitchen table bottom"
      },
      {
        zIndex: {
          selector: ".couch",
          whenAbove: { top: { max: -4 }, zIndex: 10000 },
          whenBelow: { top: { min: -4 }, zIndex: 9996 }
        }
      },
      {
        position: { top: { exact: 20 }, left: { min: 268, max: 384 } },
        blockKey: "keyCode1",
        description: "Couch top"
      },
      {
        position: { top: { exact: -4 }, left: { min: 268, max: 384 } },
        blockKey: "keyCode2",
        description: "Couch bottom"
      }
    ],
    horizontal: [
      {
        position: { left: { exact: 384 } },
        blockKey: "keyCode2",
        description: "Tent 1 right border"
      },
      {
        position: { left: { exact: 0 } },
        blockKey: "keyCode1",
        description: "Tent 1 left border"
      },
      {
        position: { top: { max: 52 }, left: { exact: 168 } },
        blockKey: "keyCode2",
        description: "Border wall left"
      },
      {
        position: { top: { max: 52 }, left: { exact: 264 } },
        blockKey: "keyCode1",
        description: "Border wall right"
      },
      {
        position: { top: { min: 132 }, left: { exact: 160 } },
        blockKey: "keyCode1",
        description: "Entrance wall left"
      },
      {
        position: { top: { min: 132 }, left: { exact: 224 } },
        blockKey: "keyCode2",
        description: "Entrance wall right"
      },
      {
        position: { top: { max: -32 }, left: { exact: 96 } },
        blockKey: "keyCode1",
        description: "Kitchenware left"
      },
      {
        position: { top: { min: -12, max: 32 }, left: { exact: 120 } },
        blockKey: "keyCode1",
        description: "Kitchen table left"
      },
      {
        position: { top: { min: -12, max: 32 }, left: { exact: 8 } },
        blockKey: "keyCode2",
        description: "Kitchen table right"
      },
      {
        position: { top: { min: -4, max: 20 }, left: { exact: 264 } },
        blockKey: "keyCode2",
        description: "Couch left"
      },
      {
        position: { top: { min: -4, max: 20 }, left: { exact: 384 } },
        blockKey: "keyCode1",
        description: "Couch right"
      }
    ]
  }
};
