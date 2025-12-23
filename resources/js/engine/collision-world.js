// collision-world.js
// Reusable, object-oriented collision and physics wrapper using Matter.js
// Designed to be portable across projects.

(function (global) {
  if (typeof Matter === "undefined") {
    console.error("Matter.js is required for CollisionWorld but is not loaded.");
    return;
  }

  var Engine = Matter.Engine;
  var World = Matter.World;
  var Bodies = Matter.Bodies;
  var Events = Matter.Events;

  // Simple event emitter used by CollisionWorld
  class CWEventEmitter {
    constructor() {
      this._listeners = {};
    }

    on(eventName, handler) {
      if (!this._listeners[eventName]) {
        this._listeners[eventName] = [];
      }
      this._listeners[eventName].push(handler);
    }

    off(eventName, handler) {
      var list = this._listeners[eventName];
      if (!list) return;
      this._listeners[eventName] = list.filter(function (h) {
        return h !== handler;
      });
    }

    emit(eventName, payload) {
      var list = this._listeners[eventName];
      if (!list || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        try {
          list[i](payload);
        } catch (e) {
          console.error("CollisionWorld event handler error for", eventName, e);
        }
      }
    }
  }

  // Base wrapper for a Matter body
  class CWBody {
    constructor(body, options) {
      this.body = body;
      this.id = options && options.id ? options.id : body.id;
      this.tag = options && options.tag ? options.tag : null;
      this.isTrigger = !!(options && options.isTrigger);
      // Attach a back-reference for collision lookup
      body._cwWrapper = this;
      body._cwTag = this.tag;
      body._cwIsTrigger = this.isTrigger;
    }

    getPosition() {
      return { x: this.body.position.x, y: this.body.position.y };
    }

    setPosition(pos) {
      Matter.Body.setPosition(this.body, pos);
    }

    setVelocity(vel) {
      Matter.Body.setVelocity(this.body, vel);
    }
  }

  class CWSolid extends CWBody {
    // For now this is just a semantic subclass of CWBody
  }

  class CWTrigger extends CWBody {
    // Triggers are represented as sensor bodies (no physical response)
  }

  class CWPlayer extends CWBody {
    constructor(body, options) {
      super(body, options);
      this.maxSpeed = (options && options.maxSpeed) || 4;
    }

    /**
     * Apply directional input (normalized or not) to set velocity.
     * input: { x: -1..1, y: -1..1 }
     */
    applyInput(input) {
      var dx = input && typeof input.x === "number" ? input.x : 0;
      var dy = input && typeof input.y === "number" ? input.y : 0;

      // Normalize to avoid faster diagonal movement
      var mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        dx /= mag;
        dy /= mag;
      }

      var vx = dx * this.maxSpeed;
      var vy = dy * this.maxSpeed;

      Matter.Body.setVelocity(this.body, { x: vx, y: vy });
    }
  }

  class CollisionWorld {
    constructor(options) {
      options = options || {};
      this.engine = Engine.create({ enableSleeping: false });
      this.world = this.engine.world;
      this.world.gravity.x = 0;
      this.world.gravity.y = 0;

      this.events = new CWEventEmitter();
      this.player = null;
      this.bodiesById = {};

      // Internal state used to synthesize enter/exit events
      this._currentOverlaps = new Set();

      this._setupCollisionEvents();
    }

    _setupCollisionEvents() {
      var self = this;
      Events.on(this.engine, "collisionStart", function (event) {
        self._handleCollisionEvent("start", event.pairs);
      });
      Events.on(this.engine, "collisionActive", function (event) {
        self._handleCollisionEvent("active", event.pairs);
      });
      Events.on(this.engine, "collisionEnd", function (event) {
        self._handleCollisionEvent("end", event.pairs);
      });
    }

    _makeKey(tag) {
      return "player::" + tag;
    }

    _handleCollisionEvent(phase, pairs) {
      if (!this.player) return;
      var playerBody = this.player.body;

      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var a = pair.bodyA;
        var b = pair.bodyB;

        var playerSide = null;
        var other = null;

        if (a === playerBody) {
          playerSide = a;
          other = b;
        } else if (b === playerBody) {
          playerSide = b;
          other = a;
        } else {
          continue;
        }

        var otherWrapper = other._cwWrapper;
        if (!otherWrapper) continue;

        var tag = otherWrapper.tag;
        if (!tag) continue;

        var key = this._makeKey(tag);

        if (phase === "start") {
          if (otherWrapper.isTrigger) {
            if (!this._currentOverlaps.has(key)) {
              this._currentOverlaps.add(key);
              this.events.emit("enter:" + tag, { player: this.player, collider: otherWrapper });
            }
          }
        } else if (phase === "active") {
          if (otherWrapper.isTrigger) {
            this._currentOverlaps.add(key);
            this.events.emit("stay:" + tag, { player: this.player, collider: otherWrapper });
          }
        } else if (phase === "end") {
          if (otherWrapper.isTrigger) {
            if (this._currentOverlaps.has(key)) {
              this._currentOverlaps.delete(key);
              this.events.emit("exit:" + tag, { player: this.player, collider: otherWrapper });
            }
          }
        }
      }
    }

    addPlayer(options) {
      options = options || {};
      var x = options.x || 0;
      var y = options.y || 0;
      var width = options.width || 24;
      var height = options.height || 40;
      var tag = options.tag || "player";

      var body = Bodies.rectangle(x, y, width, height, {
        frictionAir: 0.2,
        friction: 0.0,
        frictionStatic: 0.0,
        inertia: Infinity // prevent rotation
      });

      body.isPlayer = true;

      World.add(this.world, body);

      var player = new CWPlayer(body, {
        id: "player",
        tag: tag,
        isTrigger: false,
        maxSpeed: options.maxSpeed || 4
      });

      this.player = player;
      this.bodiesById[player.id] = player;
      return player;
    }

    addSolidRect(options) {
      options = options || {};
      var x = options.x || 0;
      var y = options.y || 0;
      var width = options.width || 10;
      var height = options.height || 10;

      var body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
        isStatic: true
      });

      World.add(this.world, body);

      var wrapper = new CWSolid(body, {
        id: options.id || "solid-" + body.id,
        tag: options.tag || null,
        isTrigger: false
      });

      this.bodiesById[wrapper.id] = wrapper;
      return wrapper;
    }

    addTriggerRect(options) {
      options = options || {};
      var x = options.x || 0;
      var y = options.y || 0;
      var width = options.width || 10;
      var height = options.height || 10;

      var body = Bodies.rectangle(x + width / 2, y + height / 2, width, height, {
        isStatic: true,
        isSensor: true
      });

      World.add(this.world, body);

      var wrapper = new CWTrigger(body, {
        id: options.id || "trigger-" + body.id,
        tag: options.tag || null,
        isTrigger: true
      });

      this.bodiesById[wrapper.id] = wrapper;
      return wrapper;
    }

    /**
     * Advance the physics simulation.
     * input: { x: -1..1, y: -1..1 }
     */
    update(deltaMs, input) {
      if (this.player) {
        this.player.applyInput(input || { x: 0, y: 0 });
      }
      Engine.update(this.engine, deltaMs);
    }

    on(eventName, handler) {
      this.events.on(eventName, handler);
    }

    off(eventName, handler) {
      this.events.off(eventName, handler);
    }
  }

  // Export to global namespace
  global.CollisionWorld = CollisionWorld;
  global.CWBody = CWBody;
  global.CWSolid = CWSolid;
  global.CWTrigger = CWTrigger;
  global.CWPlayer = CWPlayer;
})(window);


