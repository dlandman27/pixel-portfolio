// coins.js
// Configuration for collectible coins scattered around the map
// Coins are collected when the player steps on them
// ALL COINS MUST BE WITHIN WALKABLE BOUNDARIES:
// - Left: 168 to 1800 (can't go left of 168, right of 1800)
// - Top: 204 to 1444 (can't go above 204, below 1444 at dock)
// - Avoid collision zones (fences, tents, obstacles)

var COIN_CONFIG = {
  // Total number of coins (for achievement tracking)
  totalCoins: 20,
  
  // Coin positions on the map (left, top in pixels)
  // These are relative to the map container
  // ALL COINS MUST BE IN WALKABLE GRASS AREAS (NOT WATER):
  // - Top water area: top < 344 (water/ocean at top)
  // - Walkable top area starts around top 344+ (below water)
  // - Left boundary: 168-484
  // - Right boundary: 1412-1800
  // - Bottom boundary: top < 1444 (dock)
  coins: [
    // Top walkable area (below water, soccer field) - safe: top 400-600, left 500-1000
    { id: 'coin-1', left: 560, top: 450 },
    { id: 'coin-2', left: 700, top: 500 },
    { id: 'coin-3', left: 800, top: 480 },
    { id: 'coin-4', left: 550, top: 520 },
    
    // Left side walkable area - safe: left 200-450, top 400-1200
    { id: 'coin-5', left: 300, top: 600 },
    { id: 'coin-6', left: 250, top: 800 },
    { id: 'coin-7', left: 350, top: 1000 },
    
    // Right side walkable area - safe: left 1450-1800, top 400-1200
    { id: 'coin-8', left: 1500, top: 500 },
    { id: 'coin-9', left: 1600, top: 700 },
    { id: 'coin-10', left: 1700, top: 900 },
    
    // Bottom area (before dock) - safe: top 1100-1270, left 500-1400
    { id: 'coin-11', left: 600, top: 1200 },
    { id: 'coin-12', left: 800, top: 1250 },
    { id: 'coin-13', left: 1000, top: 1220 },
    
    // Center area (around bonfire) - safe: left 700-1300, top 600-1100
    { id: 'coin-14', left: 850, top: 750 },
    { id: 'coin-15', left: 1050, top: 800 },
    { id: 'coin-16', left: 950, top: 950 },
    
    // Cave area (below water) - safe: left 1000-1100, top 400-600
    { id: 'coin-17', left: 1020, top: 500 },
    { id: 'coin-18', left: 1080, top: 550 },
    
    // Dock area (walkable part) - safe: left 1450-1800, top 1000-1270
    { id: 'coin-19', left: 1500, top: 1100 },
    { id: 'coin-20', left: 1600, top: 1200 }
  ]
};

