# Quick Start: Adding Z-Index Rules

## 🚀 Super Quick Guide

### 1. Find Your Object's Position
1. Play the game and walk to where you want the transition
2. Press **SPACEBAR** - this logs your position to the console
3. Note the Y coordinate (second number)

Example console output:
```
WORLD_COLLIDER_POINT: 984 680
```
The Y position is **680**.

### 2. Add the Rule

Open `resources/js/config/zindex.config.js` and add:

```javascript
{
  selector: ".my-object-class",        // Your object's CSS class/ID
  whenAbove: { 
    top: { max: 680 },                 // Use the Y coordinate from step 1
    zIndex: 100                        // Player in front (higher number)
  },
  whenBelow: { 
    top: { min: 680 },                 // Same Y coordinate
    zIndex: 10                         // Object in front (lower number)
  }
}
```

### 3. Test!
Reload the page and walk around your object. Done! ✨

---

## 📝 Common Z-Index Values

- **Player in front**: Use z-index 100 or higher
- **Object in front**: Use z-index 10-50
- **Always on top**: Use z-index 1000+
- **Always behind**: Use z-index 1-5

## 🎯 Templates

### Basic Object (Tree, Sign, etc.)
```javascript
{
  selector: ".tree",
  whenAbove: { top: { max: Y }, zIndex: 100 },
  whenBelow: { top: { min: Y }, zIndex: 10 }
}
```

### Complex Object (Multiple Positions)
```javascript
{
  selector: ".bench",
  whenAbove: { top: { max: Y1 }, zIndex: 100 },
  whenBelow: { top: { min: Y2 }, zIndex: 100 },
  default: { zIndex: 10 }
}
```

### Area-Specific (Only in certain X range)
```javascript
{
  selector: ".sign",
  whenAbove: {
    top: { max: Y },
    left: { min: X1, max: X2 },
    zIndex: 100
  }
}
```

---

## 🐛 Quick Troubleshooting

**Not working?**
1. Check console for errors
2. Make sure selector matches HTML exactly (`.class` or `#id`)
3. Press spacebar to verify Y coordinate
4. Reload page to apply changes

**Still not working?**
- Check `index.html` includes the scripts
- Verify object exists in `map.html`
- Check browser console for `ZINDEX_RULES` and `ZIndexManager`

---

## 📚 Full Documentation

See `ZINDEX_SYSTEM.md` for complete documentation, advanced examples, and detailed explanations.

