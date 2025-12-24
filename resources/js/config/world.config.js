// world.config.js
// Data-only configuration for world colliders and (later) world objects.
// This is intentionally engine-agnostic so it can be reused across projects.

var WORLD_COLLIDERS = {
  mainMap: {
    // Start lower on the map so the intro drop lands mid-world instead of at the cave.
    playerSpawn: { x: 997, y: 220 },
    // Main map solids/triggers; authored against a 4px grid
    solids: [
      // Bridge top left blocked area (everything left of bridge)
      // From approx points (962,181) and (957,376) rounded to 4px grid:
      // (960,180) and (956,376)
      { x: 0, y: 180, width: 950, height: 180, tag: "bridgeTopLeftBlock" },

      // Bridge top right blocked area (everything right of bridge)
      // From approx point (1036,181) rounded to 4px grid: (1036,180)
      // Right edge approximated to 1800 (world right fence)
      { x: 1046, y: 180, width: 764, height: 180, tag: "bridgeTopRightBlock" },
      { x: 926, y: 368, width: 36, height: 84, tag: "bridgeTopRightBlock" },
      { x: 1036, y: 368, width: 36, height: 84, tag: "bridgeTopRightBlock" },

      // Cave
      { x: 964, y: 28, width: 64, height: 100, tag: "cave-top" },
      { x: 950, y: 60, width: 14, height: 118, tag: "cave-left" },
      { x: 1026, y: 60, width: 14, height: 118, tag: "cave-right" },


      // Left Border Wall
      { x: 136, y: 360, width: 32, height: 504, tag: "leftFence" },
      { x: 166, y: 676, width: 124, height: 12, tag: "leftFenceBottomTent" },
      { x: 326, y: 676, width: 130, height: 12, tag: "leftFenceBottomTentRight" },
      { x: 440, y: 360, width: 16, height: 290, tag: "rightBorderWall" },
      { x: 168, y: 860, width: 322, height: 490, tag: "bottomBorderWall" },
      { x: 490, y: 1330, width: 454, height: 176, tag: "bottomFence" },
      { x: 1048, y: 1330, width: 800, height: 176, tag: "bottomFenceRight" },
      { x: 928, y: 1504, width: 140, height: 8, tag: "bottomBorderWall1" },
      
      // Bonfire
      { x: 708, y: 620, width: 82, height: 270, tag: "bottomBorderWall1" },
      { x: 708, y: 620, width: 266, height: 24, tag: "bottomBorderWall1" },
      { x: 1030, y: 620, width: 258, height: 24, tag: "bottomBorderWall1" },
      { x: 1210, y: 620, width: 84, height: 466, tag: "bottomBorderWall1" },
      { x: 708, y: 1044, width: 584, height: 42, tag: "bottomBorderWall1" },
    ],
    triggers: [
      {
        x: 962,
        y: 126,
        width: 64,
        height: 4,
        tag: "caveEntrance",
        nextScene: "cave",
        nextSpawn: { x: 1000, y: 1156 }
      },
      {
        x: 290,
        y: 670,
        width: 38,
        height: 4,
        tag: "tentEntrance",
        nextScene: "mainMap",
        nextSpawn: { x: 997, y: 176 }
      }
    ]
  },
  cave: {
    // Vertical timeline cave (~1200 units tall, narrow 120px hall)
    playerSpawn: { x: 1000, y: 1100 },
    solids: [
      // Left wall
      { x: 0, y: 0, width: 940, height: 1172, tag: "caveLeftWall" },
      // Right wall
      { x: 1060, y: 0, width: 940, height: 1172, tag: "caveRightWall" },
      // Top cap
      { x: 940, y: -40, width: 120, height: 40, tag: "caveTop" },
      // Bottom rocks - left side (before exit opening)
      { x: 0, y: 1172, width: 976, height: 16, tag: "caveExitRocksLeft" },
      // Bottom rocks - right side (after exit opening)
      { x: 1024, y: 1172, width: 976, height: 16, tag: "caveExitRocksRight" }
    ],
    triggers: [
      // Exit back to main map at bottom of cave
      {
        x: 940,
        y: 1206,
        width: 120,
        height: 70,
        tag: "caveExit",
        nextScene: "mainMap",
        nextSpawn: { x: 997, y: 176 }
      }
    ]
  },
  tent1: {
    playerSpawn: { x: 192, y: 152 },
    solids: [
      // Rough tent interior bounds – refine as needed
      { x: 0, y: -44, width: 384, height: 12, tag: "tentTop" },
      { x: 0, y: 176, width: 384, height: 12, tag: "tentBottom" },
      { x: 0, y: -44, width: 12, height: 232, tag: "tentLeft" },
      { x: 372, y: -44, width: 12, height: 232, tag: "tentRight" }
    ],
    triggers: []
  }
};


