// world.config.js
// Data-only configuration for world colliders and (later) world objects.
// This is intentionally engine-agnostic so it can be reused across projects.

var WORLD_COLLIDERS = {
  mainMap: {
    playerSpawn: { x: 980, y: 740 },
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
      { x: 950, y: 60, width: 14, height: 100, tag: "cave-left" },
      { x: 1026, y: 60, width: 14, height: 100, tag: "cave-right" },


      // Left Border Wall
      { x: 136, y: 360, width: 32, height: 504, tag: "leftBorderWall" },
      { x: 440, y: 360, width: 16, height: 290, tag: "rightBorderWall" },
      { x: 168, y: 860, width: 322, height: 490, tag: "bottomBorderWall" },
      { x: 490, y: 1324, width: 440, height: 176, tag: "bottomBorderWall1" },
    ],
    triggers: []
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


