//Author Dylan Landman
//INVENTORY:


// Inventory cookies & helpers have been moved to inventory.js
// Inventory state, cookie helpers, and fish collection are now defined in inventory.js

//Var Stops movement for when an event is undergoing (ie: start of game)
var eventOccurence = true;

//tells user if character is sitting down
var sitting = false;

//URL Class holds file locations to images:
class urlLabels{
  constructor() {
    this.tag = "url(resources/images";
    this.getAnimalTracks = () => this.tag + "/animal-tracks";
    this.getBonfire = () => this.tag + "/bonfire";
    this.getBuildings = () => this.tag + "/buildings";
    this.getCharacters = () => this.tag + "/characters";
    this.getFences = () => this.tag + "/fences";
    this.getLogo = () => this.tag + "/logo icon";
    this.getMisc = () => this.tag + "/misc";
    this.getNature = () => this.tag + "/nature";
    this.getNPC = () => this.tag + "/NPCs";
    this.getPaintings = () => this.tag + "/paintings";
    this.getRoads = () => this.tag + "/roads";
    this.getSocials = () => this.tag + "/social-media";
    this.getTiles = () => this.tag + "/tiles";
    this.getWeather = () => this.tag + "/weather";
    this.getDylan = () => this.getCharacters() + "/dylan";
    this.getFallingTree = () => this.getNature() + "/falling-tree";
    this.getFishing = () => this.tag + "/fishing";
    this.getImgFormat = (imgName) => imgName + ")"
  }
}

var URL = new urlLabels();

// //Sound Optimizers
// var musicOn = false;
// var SFXOn = false;

//tells user if one of the tents is open
var tentOpen;

//Lazy Loads all the images for the character and other attributes that are animated
function lazyLoad() {

  //URLS to Lazy Load
  var URLs = [
    "resources/images/characters/dylan/dylan-front-1.png",
    "resources/images/characters/dylan/dylan-front-2.png",
    "resources/images/characters/dylan/dylan-front-3.png",
    "resources/images/characters/dylan/dylan-front-4.png",
    "resources/images/characters/dylan/dylan-front-5.png",
    "resources/images/characters/dylan/dylan-front-6.png",
    "resources/images/characters/dylan/dylan-front-7.png",
    "resources/images/characters/dylan/dylan-back-1.png",
    "resources/images/characters/dylan/dylan-back-2.png",
    "resources/images/characters/dylan/dylan-back-3.png",
    "resources/images/characters/dylan/dylan-back-4.png",
    "resources/images/characters/dylan/dylan-back-5.png",
    "resources/images/characters/dylan/dylan-back-6.png",
    "resources/images/characters/dylan/dylan-back-7.png",
    "resources/images/characters/dylan/dylan-left-1.png",
    "resources/images/characters/dylan/dylan-left-2.png",
    "resources/images/characters/dylan/dylan-left-3.png",
    "resources/images/characters/dylan/dylan-left-4.png",
    "resources/images/characters/dylan/dylan-left-5.png",
    "resources/images/characters/dylan/dylan-left-6.png",
    "resources/images/characters/dylan/dylan-left-7.png",
    "resources/images/characters/dylan/dylan-right-1.png",
    "resources/images/characters/dylan/dylan-right-2.png",
    "resources/images/characters/dylan/dylan-right-3.png",
    "resources/images/characters/dylan/dylan-right-4.png",
    "resources/images/characters/dylan/dylan-right-5.png",
    "resources/images/characters/dylan/dylan-right-6.png",
    "resources/images/characters/dylan/dylan-right-7.png",
    "resources/images/characters/dylan/axe/chop/dylan-chop-1.png",
    "resources/images/characters/dylan/axe/chop/dylan-chop-2.png",
    "resources/images/characters/dylan/axe/chop/dylan-chop-3.png",
    "resources/images/characters/dylan/axe/chop/dylan-chop-4.png",
    "resources/images/characters/dylan/axe/pickup/dylan-axe-1.png",
    "resources/images/characters/dylan/axe/pickup/dylan-axe-2.png",
    "resources/images/characters/dylan/axe/pickup/dylan-axe-3.png",
    "resources/images/characters/dylan/axe/pickup/dylan-axe-4.png",
    "resources/images/nature/falling-tree/falling-tree-2.png",
    "resources/images/nature/falling-tree/falling-tree-3.png",
    "resources/images/nature/falling-tree/falling-tree-4.png",
    "resources/images/nature/falling-tree/falling-tree-5.png",
    "resources/images/nature/falling-tree/falling-tree-6.png",
    "resources/images/nature/falling-tree/falling-tree-7.png",
  ];

  $("body").append("<div class='lazyLoad'>IM LAZY YO</div>");

  //Loads the urls to the body
  var imgs = URLs.map(function (URL) {
    var img = new Image();
    img.src = URL;
    $(".lazyLoad").append(img);
    return img;
  });

  //removes the lazyload class elements
  $(".lazyLoad").remove();
}

//When the window is done loading
$(window).load(function () {
  setVariables();
  $(".cover-screen.tent1").hide();
  document.title = "__________🔥__________";
  
  //Loads images used for animation
  lazyLoad();

  
  //Waits 1.4s then removes the loading screen
  setTimeout(function () {
     $('.loading-screen').fadeOut();  
  }, 2500);

  // Legacy: center the map after the loader finishes.
  // With the new physics/camera system, GameWorld now owns camera placement,
  // so we only call WORLD.centerMap if the old movement engine is still active.
  setTimeout(function(){ 
    if (
      !window.useNewMovementEngine &&
      typeof WORLD !== "undefined" &&
      typeof WORLD.centerMap === "function"
    ) {
      WORLD.centerMap();
    }
  },2400);//CHANGE IN ZOOM MUST CHANGE VALUE (CURR 1.2)(VALUE = 1+(1-ZOOMLEVEL))
  //Starts the game
  setTimeout(startGame, 2800);

  //Function to handle weather
  dayCycle();
  // Water animation
  if (typeof WORLD !== "undefined" && typeof WORLD.startRiverAnimation === "function") {
    WORLD.startRiverAnimation();
  }
  
  // Initialize minimap widget if map was already collected
  if (typeof inventory !== "undefined" && inventory.minimap && typeof initMinimapWidget === "function") {
    setTimeout(function() {
      initMinimapWidget();
    }, 3000);
  }
});

$(window).resize(function () {
  // Legacy auto-centering; disabled when using the new physics/camera system
  if (
    !window.useNewMovementEngine &&
    typeof WORLD !== "undefined" &&
    typeof WORLD.centerMap === "function"
  ) {
    WORLD.centerMap();
  }
});

var x = 0;
// Global reference to new physics-based game world
var gameWorld = null;


//Function called when the map is finished rendering
function startGame() { 

  document.title="Dylan Landman";

  // Initialize sprite manager
  if (typeof SpriteManager !== "undefined") {
    SpriteManager.init();
  }

  // Initialize physics-based world for main map using WORLD_COLLIDERS
  if (typeof GameWorld !== "undefined" && typeof WORLD_COLLIDERS !== "undefined") {
    try {
      gameWorld = new GameWorld();
      gameWorld.init("mainMap");
    } catch (e) {
      console.error("Failed to initialize GameWorld:", e);
    }
  }

  // Add click handlers for portfolio project stands
  setupPortfolioStandHandlers();
  
  // Initialize portfolio gallery with project previews and position shrubs
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(function() {
    initializePortfolioGallery();
  }, 100);

  // Disable original walk-out entrance animation; start with movement enabled
  eventOccurence = false;
  $("#dylan").css("visibility", "visible");
  // Ensure a reasonable idle sprite
  if (typeof SpriteManager !== "undefined") {
    SpriteManager.setSpriteFrame("front", 2);
  } else {
    $("#dylan").css(
      "background-image",
      "url(resources/images/characters/dylan/dylan-front-2.png)"
    );
  }
  // Show tutorial if it hasn't been shown before
  if (getCookie("title-screen") != "true") {
    openTutorial();
  }


  //if tree has already been cut down
  if(getCookie("tree-fallen")=="true"){
    $("#falling-tree").css("width","256px");
  }
}

function openTutorial(){
  // Don't block movement - tutorial is just informational
  // Show a global speech bubble at the top of the screen instead of a full-screen modal
  var $bubble = $("#tutorial-bubble");
  var isMobile = window.innerWidth <= 600;
  var message = isMobile 
    ? "Use the <b>arrow buttons</b> at the bottom to move.<br/>Tap objects to interact."
    : "Use <b>WASD</b> or <b>arrow keys</b> to move.<br/>Click objects to interact.";
  $bubble.find("p").html(message);
  $bubble.stop(true, true).fadeIn(200);
}
function closeTutorial(){
  // Remember that the tutorial has been shown once
  setCookie("title-screen", true);
  $("#tutorial-bubble").fadeOut(200);
}

//River Animation
$(function () {
  if (typeof WORLD !== "undefined" && typeof WORLD.startRiverAnimation === "function") {
    WORLD.startRiverAnimation();
  }
})


//Tells if the fire is on
var fireOn = false;

//ID of the fire interval
var fireInterval;

var woodOnFire = false;
//Function controls the fire

//used to tell if the fire has been enabled beofre
var fireEnabled = 0;

function togglefire() {
  // Check if player is anywhere in the bonfire area
  // Bonfire area bounds: x: 680-1292, y: 650-1068 (world coordinates)
  
  // Try to get player position from GameWorld if available
  var playerPos = null;
  if (typeof global !== "undefined" && global.playerController && global.playerController.gameWorld && global.playerController.gameWorld.player) {
    playerPos = global.playerController.gameWorld.player.getPosition();
  }
  
  // If we have world position, use it directly
  var inBonfireArea = false;
  if (playerPos) {
    inBonfireArea = playerPos.x >= 680 && playerPos.x <= 1292 && 
                    playerPos.y >= 650 && playerPos.y <= 1068;
  } else {
    // Fallback: convert CSS position to approximate world coordinates
    // CSS left = pos.x - PLAYER_SPRITE_WIDTH/2, so pos.x = left + 16
    // CSS top = (pos.y + PLAYER_COLLIDER_HEIGHT/2) - PLAYER_SPRITE_HEIGHT, so pos.y = top + 64 - 20 = top + 44
    var dylanLeft = parseInt($("#dylan").css("left")) || 0;
    var dylanTop = parseInt($("#dylan").css("top")) || 0;
    var worldX = dylanLeft + 16; // Approximate world X
    var worldY = dylanTop + 44;  // Approximate world Y (foot position)
    
    inBonfireArea = worldX >= 680 && worldX <= 1292 && 
                    worldY >= 650 && worldY <= 1068;
  }
  
  if(inBonfireArea){
    if(woodOnFire && inventory.matchbox){
      // var x = document.getElementById("crackle-fire");
      // x.volume = .5; 

      var url = URL.getBonfire();
      var fire = $("#bonfire");
      bimg = $("#bonfire").css('background-image');
      var fireArr = ['/bonfire1.png', '/bonfire2.png', '/bonfire3.png', '/bonfire4.png']

      if (!fireOn) {
        // if(SFXOn){
        //   x.play();
        // }
        fireOn = true;
        // Turn on the bonfire light glow
        $("#bonfire-light").addClass("active");
        var i = 0;
        fireInterval = setInterval(function () {
          ++i;
          if (i > 3) {
            i = 0
          }
          fire.css('background-image', url + fireArr[i] + ")");
        }, 100);
        // Achievement temporarily disabled
        // if(!fireEnabled){
        //   $(".achievement").css({display:"block",backgroundColor: "#c99200"}).fadeIn();
        //   $(".achievement-name").text('Light It Up!');
        //   $(".achievement-description").text('Turn on the Fireplace');
        //   setTimeout(function(){
        //     $(".achievement").fadeOut().css("display","block");
        //   },3000);
        // }
      }
      else {
        fireEnabled = true;
        // x.pause();
        fireOn = false;
        // Turn off the bonfire light glow
        $("#bonfire-light").removeClass("active");
        clearInterval(fireInterval);
        fire.css('background-image', url + '/bonfire-empty.png)');
      }

    }  
    else if(inventory.wood){
      woodOnFire = true;
      $("#bonfire").css('background-image', URL.getBonfire() + '/bonfire-empty.png)');
    }  
    else if(woodOnFire && !inventory.matchbox){
      $(".nes-balloon.from-left p").text("Hmm... I need a way to light the fire");
      $(".nes-balloon.from-left").css({display:"block",top: "-60px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1400)
    }
    else if(!inventory.wood){
      $(".nes-balloon.from-left p").text("Hmm... I need more Wood");
      $(".nes-balloon.from-left").css({display:"block",top: "-80px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1400)
    }
  }
  
}

// Movement state and key constants are now in WORLD
// Access via WORLD.movement.* and WORLD.KEYS.*
// Initialize movement system when DOM is ready
$(function() {
  if (typeof WORLD !== "undefined" && typeof WORLD.initMovement === "function") {
    WORLD.initMovement();
  }
});

// Legacy aliases for backward compatibility (use WORLD.KEYS and WORLD.movement instead)
var keyLeft = typeof WORLD !== "undefined" ? WORLD.KEYS.LEFT : 37;
var keyUp = typeof WORLD !== "undefined" ? WORLD.KEYS.UP : 38;
var keyRight = typeof WORLD !== "undefined" ? WORLD.KEYS.RIGHT : 39;
var keyDown = typeof WORLD !== "undefined" ? WORLD.KEYS.DOWN : 40;
var keyW = typeof WORLD !== "undefined" ? WORLD.KEYS.W : 87;
var keyA = typeof WORLD !== "undefined" ? WORLD.KEYS.A : 65;
var keyS = typeof WORLD !== "undefined" ? WORLD.KEYS.S : 83;
var keyD = typeof WORLD !== "undefined" ? WORLD.KEYS.D : 68;
var keyEnter = typeof WORLD !== "undefined" ? WORLD.KEYS.ENTER : 13;
var keySpace = typeof WORLD !== "undefined" ? WORLD.KEYS.SPACE : 32;

// Movement state aliases (legacy - no longer used for core movement with the new engine)
var anim = typeof WORLD !== "undefined" ? WORLD.movement.anim : null;
var frame = typeof WORLD !== "undefined" ? WORLD.movement.frame : 1;
var keyPressed = typeof WORLD !== "undefined" ? WORLD.movement.keyPressed : false;
var keysPressed = typeof WORLD !== "undefined" ? WORLD.movement.keysPressed : {};
var distancePerIteration = typeof WORLD !== "undefined" ? WORLD.movement.distancePerIteration : 4;
var dylan = typeof WORLD !== "undefined" && WORLD.movement.dylan ? WORLD.movement.dylan : $("#dylan");



var doorOpen = false;


//Keydown - legacy handler; core movement is now handled by PlayerController in game/player-controller.js
$(document).keydown(function(e){
  if(isReelingIn){
    reelIn(e.keyCode);
  }

  // Toggle minimap widget with M key (77 is ASCII for M)
  if (e.keyCode === 77 && inventory.minimap && !eventOccurence) {
    toggleMinimapWidget();
    return;
  }

  // If the tutorial has not been acknowledged yet, close it on first movement input
  var moveKeys = [37, 38, 39, 40, 65, 68, 83, 87]; // arrows + WASD
  if (getCookie("title-screen") != 'true' && moveKeys.indexOf(e.which) !== -1) {
    closeTutorial();
  }

  // If the new movement engine is active, do not run legacy movement logic
  if (window.useNewMovementEngine) {
    return;
  }

  // Legacy movement path (will eventually be removed)
  if (typeof WORLD !== "undefined" && WORLD.movement) {
    WORLD.movement.keysPressed[e.which] = true;
  } else {
    keysPressed[e.which] = true;
  }
  move(e.keyCode);

  if (playSoccer && e.keyCode == keyEnter)
    moveBall();
});

var completedBook = false;

//Function called when reeling in a fish for key space
function reelIn(code){
  // Remove the keysPressed check since player-controller handles it now
  if(code == keySpace){
    // Ensure movement is disabled and player stays at fishing position
    setMovementDisabled(true);
    // Convert CSS position to world coordinates
    if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
      gameWorld.player.setPosition({ x: 992, y: 1558 });
      gameWorld.syncToDom();
    } else {
      $("#dylan").css({top: 1514, left: 976});
    }
    
    document.getElementById("reel-progress").value += 1;
    if(document.getElementById("reel-progress").value == document.getElementById("reel-progress").max){
      clearInterval(reel_in_timer);
      $(".fish-from-water").css("display","block");
      $("progress").css("display","none");
      $(".fish-from-water").animate({
        top: 1446, // 1438 + 8px to push fish down
        marginLeft: "-="+(parseInt($(".fish-from-water").css("width"))/4)
      });
      isReelingIn = false;
      // Keep movement disabled and maintain position
      setMovementDisabled(true);
      if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
        gameWorld.player.setPosition({ x: 992, y: 1558 });
        gameWorld.syncToDom();
      } else {
        $("#dylan").css({top: 1514, left: 976});
      }
      // Fishing catch sprite - keep direct for now as it's not part of walking animation
      $("#dylan").css("background-image", URL.getDylan() + "/fishing/dylan-fishing-catch.png)");
      $(".information").text("NICE!, I caught a "+fish.getName()+"!!");
      $(".bio").css("display","block");
      $(".bio").text(fish.getBio());
      $(".fish."+fish.getName().toLowerCase()).css("background-image",URL.getFishing()+"/")
      addToCollection(fish);
      setTimeout(endFishing,2000);

    
      var finishedBook = !Object.values(FISHREP.getCollection()).includes(false);

      if(finishedBook && !completedBook){
        $(".achievement").css("background-color","#9ACDE0");
        $(".achievement").css("display","block").fadeIn();
        $(".achievement-name").text('Expert Fisherperson');
        $(".achievement-description").text('Catch All Fish');
        setTimeout(function(){
          $(".achievement").fadeOut();
        },3000);
        completedBook = true;
      }
    }
    // Animation is now handled by player-controller (fishing-2 on space in, fishing-3 on space out)
    
  }
}
//function to handle movement of the character and the map

function move(keyCode) {
  // var backgroundMusic = document.getElementById("background-music"); 
  // if(musicOn){
  //   backgroundMusic.play();
  //   backgroundMusic.volume = 0.6;
  // }
  

  // if(parseInt($("#dylan").css("top")) < 320){
  //   var walking = document.getElementById("walking-on-wood"); 
  // }
  // else{
  //   var walking = document.getElementById("walking-on-grass"); 
  // }
  

  // walking.playbackRate = 2.5;
  
  
  //if an event is occuring or fishing
  var animRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.anim : anim;
  if (onLog || eventOccurence || sitting || inFishing || isReelingIn) {
    clearInterval(animRef);
    // Maintain fishing position if fishing
    if (inFishing || isReelingIn) {
      if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
        gameWorld.player.setPosition({ x: 992, y: 1558 });
        gameWorld.syncToDom();
      } else {
        $("#dylan").css({top: 1514, left: 976});
      }
    }
    if (typeof WORLD !== "undefined" && WORLD.movement) {
      WORLD.movement.anim = null;
    }
    return;
  }
  else {
    $(".tooltiptext").css("opacity", 0);
    // Hide tutorial bubble when user starts moving
    if ($("#tutorial-bubble").is(":visible")) {
      closeTutorial();
    }
  }

  
  
  
  var url = URL.getDylan();

  //Tells the computer what the last key pressed was from up down left right
  var key = "";
  var personMoving = true;

  // Use WORLD.movement state if available
  var keyPressedRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keyPressed : keyPressed;
  var frameRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;

  if (!keyPressedRef) {
    if (typeof WORLD !== "undefined" && WORLD.movement) {
      WORLD.movement.keyPressed = true;
    } else {
    keyPressed = true;
    }
    var intervalFunc = function () {
      // Use WORLD.movement state if available
      var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
      var ks = (typeof WORLD !== "undefined" && WORLD.movement && WORLD.movement.keysPressed) ? WORLD.movement.keysPressed : keysPressed;

      //Frame Animation
      frameVar++;
      if (typeof WORLD !== "undefined" && WORLD.movement) {
        WORLD.movement.frame = frameVar;
      } else {
        frame = frameVar;
      }

      //When enter key is pressed
      if(keyCode == keyEnter){
        if(tentOpen){
          //front door
          if(parseInt($("#dylan").css("top")) >= 136 && parseInt($("#dylan").css("left")) >= 172 && parseInt($("#dylan").css("left")) <= 216){
            leaveTent1(1);
          }
          //back door
          if(parseInt($("#dylan").css("top")) <= -28 && parseInt($("#dylan").css("left")) >= 148 && parseInt($("#dylan").css("left")) <= 168){
            leaveTent1(0);
          }
        }
      }
      // Check keysPressed dynamically instead of just keyCode for sprite animation
      else if ((keyCode == keyLeft || keyCode == keyA) && (ks[keyLeft] || ks[keyA])) {

        // if(SFXOn){
        //   walking.play();
        // }
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if(key != "left")
          frameVar = 1;
        if (frameVar > 7)
          frameVar = 2;
        if (typeof WORLD !== "undefined" && WORLD.movement) {
          WORLD.movement.frame = frameVar;
        } else {
          frame = frameVar;
        }
        key = "left";
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("left", frameVar);
        } else {
          $("#dylan").css("background-image", url + "/dylan-left-" + frameVar + ".png)");
        }
      }
      else if ((keyCode == keyUp || keyCode == keyW) && (ks[keyUp] || ks[keyW])) {
        // if(SFXOn){
        //   walking.pause();
        //   if(parseInt($("#dylan").css("top")) < 320){
        //     walking = document.getElementById("walking-on-wood"); 
        //   }
        //   else{
        //     walking = document.getElementById("walking-on-grass"); 
        //   }
        //   walking.play();
        // }
        
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if(key != "up")
          frameVar = 1;
        if (frameVar > 7)
          frameVar = 2;
        if (typeof WORLD !== "undefined" && WORLD.movement) {
          WORLD.movement.frame = frameVar;
        } else {
          frame = frameVar;
        }
        key = "up";
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("back", frameVar);
        } else {
          $("#dylan").css("background-image", url + "/dylan-back-" + frameVar + ".png)");
        }

        //If the up key will bring you into tent 1
        if(parseInt($("#dylan").css("left")) >= 288 && parseInt($("#dylan").css("left")) <= 296){
          if(parseInt($("#dylan").css("top")) == 648){
            openTent1("front");
          }
        }
        if(tentOpen && parseInt($("#dylan").css("left")) <= 168 && parseInt($("#dylan").css("left")) > 120 && parseInt($("#dylan").css("top")) == -44){
          leaveTent1(2);
        }
      }
      else if ((keyCode == keyDown || keyCode == keyS) && (ks[keyDown] || ks[keyS])) {
        // if(SFXOn){
        //   // walking.pause();
        //   // if(parseInt($("#dylan").css("top")) < 320){
        //   //   walking = document.getElementById("walking-on-wood"); 
        //   // }
        //   // else{
        //   //   walking = document.getElementById("walking-on-grass"); 
        //   // }
        //   // // walking.play();
        // }
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if(key != "down")
          frameVar = 2; // Start at 2 instead of 1 for front (frame 1 has wrong height)
        if (frameVar > 7)
          frameVar = 2; // Cycle back to 2, not 1
        // Skip frame 1 for front direction
        if (frameVar === 1) {
          frameVar = 2;
        }
        if (typeof WORLD !== "undefined" && WORLD.movement) {
          WORLD.movement.frame = frameVar;
        } else {
          frame = frameVar;
        }
        key = "down";
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("front", frameVar);
        } else {
          $("#dylan").css("background-image", url + "/dylan-front-" + frameVar + ".png)");
        }

        //If the up key will bring you into tent 1 from backyard
        if(!tentOpen && parseInt($("#dylan").css("left")) >= 248 && parseInt($("#dylan").css("left")) <= 340){
          if(parseInt($("#dylan").css("top")) == 616){
            openTent1("back");
          }
        }
        if(tentOpen && parseInt($("#dylan").css("top")) > 172){
          leaveTent1(1);
        }
        
      }
      else if ((keyCode == keyRight || keyCode == keyD) && (ks[keyRight] || ks[keyD])) {

        // if(SFXOn){
        //   // walking.play();
        // }
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if(key != "right")
          frameVar = 1;
        if (frameVar > 7)
          frameVar = 2;
        if (typeof WORLD !== "undefined" && WORLD.movement) {
          WORLD.movement.frame = frameVar;
        } else {
          frame = frameVar;
        }
        key = "right";
        var frameVar = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.frame : frame;
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("right", frameVar);
        } else {
          $("#dylan").css("background-image", url + "/dylan-right-" + frameVar + ".png)");
        }
      }

      //Movement on stair in firepit
      if(!tentOpen && parseInt($("#dylan").css("left")) <= 816 && parseInt($("#dylan").css("left")) >= 736 && parseInt($("#dylan").css("top")) >= 908 && parseInt($("#dylan").css("top")) < 952){
        if(keyCode == keyLeft || keyCode == keyA){
          $("#dylan").css({
            left: "-=12px"
            ,
            top: "-=4px"
          });

          $("#map").css({
            marginLeft: "+=36px"
            ,
            marginTop: "+=12px"
          });
        }
        else if(keyCode == keyRight || keyCode == keyD){
          $("#dylan").css({
            left: "+=12px"
            ,
            top: "+=4px"
          });

          $("#map").css({
            marginLeft: "-=36px"
            ,
            marginTop: "-=12px"
          });
        }
      }

      //movement on bridge to island
      else if(!tentOpen && parseInt($("#dylan").css("left")) <= 1544 && parseInt($("#dylan").css("left")) >= 1404 && parseInt($("#dylan").css("top")) <= 1020 && parseInt($("#dylan").css("top")) >= 980){
        //middle of bridge
        if(parseInt($("#dylan").css("left")) <= 1492 && parseInt($("#dylan").css("left")) >= 1456){
          if(keyCode == keyLeft || keyCode == keyA){
            $("#dylan").css({
              left: "-=4px"
            });
  
            $("#map").css({
              marginLeft: "+=12px"
            });
          }
          else if(keyCode == keyRight || keyCode == keyD){
            $("#dylan").css({
              left: "+=4px"
            });
  
            $("#map").css({
              marginLeft: "-=12px"
            });
          }
        }

        //right side of bridge
        else if(parseInt($("#dylan").css("left")) > 1492){
          if(keyCode == keyLeft || keyCode == keyA){
            $("#dylan").css({
              left: "-=12px"
              ,
              top: "-=4px"
            });
  
            $("#map").css({
              marginLeft: "+=36px"
              ,
              marginTop: "+=12px"
            });
          }
          else if(keyCode == keyRight || keyCode == keyD){
            $("#dylan").css({
              left: "+=12px"
              ,
              top: "+=4px"
            });
  
            $("#map").css({
              marginLeft: "-=36px"
              ,
              marginTop: "-=12px"
            });
          }
        }
        //left side of bridge
        else if(parseInt($("#dylan").css("left")) < 1456){
          if(keyCode == keyLeft || keyCode == keyA){
            $("#dylan").css({
              left: "-=12px"
              ,
              top: "+=4px"
            });
  
            $("#map").css({
              marginLeft: "+=36px"
              ,
              marginTop: "-=12px"
            });
          }
          else if(keyCode == keyRight || keyCode == keyD){
            $("#dylan").css({
              left: "+=12px"
              ,
              top: "-=4px"
            });
  
            $("#map").css({
              marginLeft: "-=36px"
              ,
              marginTop: "+=12px"
            });
          }
        }
      }
      //if one of the tents are currently being used
      else if(tentOpen){
        //UP DOWN LEFT RIGHT
        $("#dylan").css({
          left: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValueTent1(oldValue, keyLeft, keyRight, "dylan-left");
          },
          top: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValueTent1(oldValue, keyUp, keyDown, "dylan-top");
          }
        });

        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValueTent1(oldValue, keyLeft, keyRight, "body-left");
          },
          marginTop: function (index, oldValue) {
            return calculateNewValueTent1(oldValue, keyUp, keyDown, "body-top");
          }
        });

        //WASD
        $("#dylan").css({
          left: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValueTent1(oldValue, keyA, keyD, "dylan-left");
          },
          top: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValueTent1(oldValue, keyW, keyS, "dylan-top");
          }
        });

        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValueTent1(oldValue, keyA, keyD, "body-left");
          },
          marginTop: function (index, oldValue) {
            return calculateNewValueTent1(oldValue, keyW, keyS, "body-top");
          }
        });
      }
      else{
        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValue(oldValue, keyLeft, keyRight, "body-left");
          },
          marginTop: function (index, oldValue) {
            return calculateNewValue(oldValue, keyUp, keyDown, "body-top");
          }
        });
        //UP DOWN LEFT RIGHT
        $("#dylan").css({
          left: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValue(oldValue, keyLeft, keyRight, "dylan-left");
          },
          top: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValue(oldValue, keyUp, keyDown, "dylan-top");
          }
        });

        //WASD
        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValue(oldValue, keyA, keyD, "body-left");
          },
          marginTop: function (index, oldValue) {
            return calculateNewValue(oldValue, keyW, keyS, "body-top");
          }
        });

        $("#dylan").css({
          left: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValue(oldValue, keyA, keyD, "dylan-left");
          },
          top: function (index, oldValue) {
            //must change values to work for wasd
            return calculateNewValue(oldValue, keyW, keyS, "dylan-top");
          }
        });

        
      }      


      //CHANGE SPEED OF CHARACTER
      
      // Check for coin collection
      if (typeof checkCoinCollection === "function") {
        checkCoinCollection();
      }
    };
    var animId = setInterval(intervalFunc, 50); //5 fast //50 normal
    if (typeof WORLD !== "undefined" && WORLD.movement) {
      WORLD.movement.anim = animId;
    } else {
      anim = animId;
    }
  }

  //Controls Doors for Tents
  if (!doorOpen) {
    //DOOR OPEN FOR TENT1
    if (parseInt($("#dylan").css("left")) < 428){
      $(".tentdoor.tent1").animate({ "height": 0 }, 1000);
      doorOpen = true;
    }
  }
  else {
    if (parseInt($("#dylan").css("left")) >= 428){
      $(".tentdoor.tent1").animate({ "height": 38 }, 1000);
      doorOpen = false;
    }
  }
  //DOOR OPEN FOR TENT2
}


//Keyup 
$(document).keyup(function (e) {
  // var walkingSound = document.getElementById("walking-on-grass"); 
  // walkingSound.pause();

  // var walkingSound2 = document.getElementById("walking-on-wood"); 
  // walkingSound2.pause();
  
  // $("#dylan").fadeIn();
  var ks = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keysPressed : keysPressed;
  if(isReelingIn && ks[keySpace]){
    $("#dylan").css("background-image", URL.getDylan() + "/fishing/dylan-fishing-1.png)");
  }
  var animRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.anim : anim;
  clearInterval(animRef);
  if (typeof WORLD !== "undefined" && WORLD.movement) {
    WORLD.movement.keyPressed = false;
    WORLD.movement.keysPressed[e.which] = false;
    WORLD.movement.anim = null;
  } else {
  keyPressed = false;
  keysPressed[e.which] = false;
  }
})



var openBag = false;

var hitCount = 1;
//TODO ADD MOVEMENT OF SCREEN ON CHOP
function treeChop() {
  if (parseInt($("#dylan").css("top")) <= 536 && parseInt($("#dylan").css("left")) <= 380) {
    if (inventory.axe && hitCount < 7) {
      hitCount++;
      var url = URL.getFallingTree();
      // Disable movement during tree chopping
      setMovementDisabled(true);
      // Set map position first
      $("#map").css({
        marginLeft: 2208+"px",
        marginTop: -816+"px"
      });
      // Set player position to world coordinates at the tree location
      // Tree is at CSS left: 212-272 (center ~242), top: 448-464 (center ~456)
      // Using world coordinates: (242, 456)
      if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
        gameWorld.player.setPosition({ x: 242, y: 456 });
        if (typeof gameWorld.player.setVelocity === "function") {
          gameWorld.player.setVelocity({ x: 0, y: 0 });
        }
        gameWorld.syncToDom();
        // Force another sync after a brief delay to ensure position sticks
        setTimeout(function() {
          if (gameWorld && gameWorld.player && gameWorld.syncToDom) {
            gameWorld.player.setPosition({ x: 242, y: 456 });
            if (typeof gameWorld.player.setVelocity === "function") {
              gameWorld.player.setVelocity({ x: 0, y: 0 });
            }
            gameWorld.syncToDom();
          }
        }, 10);
      } else {
        // Fallback to direct CSS if player controller not available
        $("#dylan").css({
          left: 260+"px",
          top: 464+"px"
        });
      }
      $("#falling-tree").css("z-index","48");
      eventOccurence = true;
      $("#dylan").css("background-image", URL.getDylan() + "/axe/chop/dylan-chop-" + 1 + ".png)");
      setTimeout(function(){
        if (hitCount < 4){
          var temp = 1;
          var swing = setInterval(function(){
            if(temp > 4){
              temp = 1;
              clearInterval(swing);
              eventOccurence = false;
              setMovementDisabled(false);
              $("#falling-tree").css("background-image", url + "/falling-tree-" + hitCount + ".png)").css("width","256px");
            }
            else{
              $("#dylan").css("background-image", URL.getDylan() + "/axe/chop/dylan-chop-" + temp + ".png)");
              temp++;          
            }
          },50);
        }
        else {
          var temp = 1;
          var swing = setInterval(function(){
            if(temp > 4){
              temp = 1;
              clearInterval(swing);
              for (let i = 0; i < 3; ++i) {
                setTimeout(function () {
                  $("#falling-tree").css("background-image", url + "/falling-tree-" + (++hitCount) + ".png)");
                  eventOccurence = false;
                  setMovementDisabled(false);
                  // Screen shake when tree falls (on last frame)
                  if (i === 2) {
                    screenShake();
                  }
                }, 30 * (i + 1));
              }
              moveWood();
              setCookie("tree-fallen",true);
            }
            else{
              $("#dylan").css("background-image", URL.getDylan() + "/axe/chop/dylan-chop-" + temp + ".png)");
              temp++;
            }
          },50);
        }
      },300)
      
    }
    else if(!inventory.axe){
      $(".nes-balloon.from-left p").text("Hmm...I need a tool to chop this down");
      $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1000)
    }
  } 
  
}

function moveWood() {
  $("#wood-log").css("visibility", "visible");
  $("#wood-log").animate({ top: 214 + "px", left: 240 + "px" }, 200);
  $("#wood-log").animate({ top: 320 + "px", left: 252 + "px" }, 800);
}




function openResume(){
  $("#resume").css("display","block")
}
// Test mode: set to 'dawn', 'day', 'dusk', or 'night' to force a time state
// Set to null to use real-world time
var DAY_CYCLE_TEST_MODE = 'day'; // Change this to test different times: 'dawn', 'day', 'dusk', 'night', or null

function dayCycle() {
  var timeState = '';
  var brightness = 1;
  var overlayOpacity = 0;
  
  // Use test mode if set, otherwise use real time
  if (DAY_CYCLE_TEST_MODE) {
    // Force test mode
    timeState = DAY_CYCLE_TEST_MODE;
  } else {
    // Get current time
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var timeOfDay = hour + (minute / 60); // Convert to decimal hours for easier comparison
    
    // Define time ranges (in decimal hours)
    // Dawn: 5:00 - 7:00 (5.0 - 7.0)
    // Day: 7:00 - 18:00 (7.0 - 18.0)
    // Dusk: 18:00 - 20:00 (18.0 - 20.0)
    // Night: 20:00 - 5:00 (20.0 - 29.0, wraps to 0.0 - 5.0)
    
    if (timeOfDay >= 5.0 && timeOfDay < 7.0) {
      // Dawn (5 AM - 7 AM)
      timeState = 'dawn';
    } else if (timeOfDay >= 7.0 && timeOfDay < 18.0) {
      // Day (7 AM - 6 PM)
      timeState = 'day';
    } else if (timeOfDay >= 18.0 && timeOfDay < 20.0) {
      // Dusk (6 PM - 8 PM)
      timeState = 'dusk';
    } else {
      // Night (8 PM - 5 AM)
      timeState = 'night';
    }
  }
  
  // Set visual properties based on time state
  switch(timeState) {
    case 'dawn':
      brightness = 0.85;
      overlayOpacity = 0.15;
      break;
    case 'day':
      brightness = 1;
      overlayOpacity = 0;
      break;
    case 'dusk':
      brightness = 0.7;
      overlayOpacity = 0.3;
      break;
    case 'night':
      brightness = 0.35;
      overlayOpacity = 0.7;
      break;
  }
  
  // Remove any existing time-of-day classes
  $('body').removeClass('dawn day dusk night');
  // Add current time state class
  $('body').addClass(timeState);
  
  // Apply brightness filter to the map
  $('#map').css({
    'filter': 'brightness(' + brightness + ')',
    '-webkit-filter': 'brightness(' + brightness + ')'
  });
  
  // Create or update night overlay for darkness effect
  var $overlay = $('#day-night-overlay');
  if ($overlay.length === 0) {
    $overlay = $('<div id="day-night-overlay"></div>');
    $('body').append($overlay);
  }
  
  $overlay.css({
    'opacity': overlayOpacity,
    'transition': 'opacity 2s ease-in-out'
  });
  
  // Add stars for night time
  if (timeState === 'night') {
    createStars();
  } else {
    removeStars();
  }
  
  // Log current state for debugging
  console.log('Day/Night Cycle:', timeState, 'Brightness:', brightness, 'Overlay:', overlayOpacity);
  
  // Schedule next update (check every minute, or every 5 seconds in test mode)
  var updateInterval = DAY_CYCLE_TEST_MODE ? 5000 : 60000;
  setTimeout(dayCycle, updateInterval);
}

function createStars() {
  // Remove existing stars if any
  removeStars();
  
  var $starsContainer = $('<div id="stars-container"></div>');
  $('body').append($starsContainer);
  
  // Create 50-100 stars randomly positioned
  var starCount = 50 + Math.floor(Math.random() * 50);
  for (var i = 0; i < starCount; i++) {
    var $star = $('<div class="star"></div>');
    $star.css({
      'left': Math.random() * 100 + '%',
      'top': Math.random() * 100 + '%',
      'animation-delay': Math.random() * 3 + 's',
      'opacity': 0.3 + Math.random() * 0.7
    });
    $starsContainer.append($star);
  }
}

function removeStars() {
  $('#stars-container').remove();
}
function openDoc(location){
  if(inventory.resume || location== 2)
    window.open('resources/resume/resume.pdf', '_blank');
}

var onLog = false;
var onLogTop = false,
  onLogBottom = false,
  onLogLeft = false,
  onLogRight = false;
var initX = 0;
var initY = 0;

/**
 * Stand up from any log/bench
 * Exposed globally so PlayerController can call it
 */
function standUpFromLog() {
  if (!onLog || !sitting) return;
  
  // Get playerController and gameWorld
  var playerController = null;
  if (typeof window !== "undefined" && window.playerController) {
    playerController = window.playerController;
  } else if (typeof global !== "undefined" && global.playerController) {
    playerController = global.playerController;
  }
  
  if (!playerController || !playerController.gameWorld) return;
  
  var gameWorld = playerController.gameWorld;
  var player = gameWorld.player;
  if (!player) return;
  
  var pos = player.getPosition();
  var MAP_SCALE = 3;
  
  // Stand up based on which log we're on
  if (onLogTop) {
    onLog = false;
    sitting = false;
    
    var standWorldX = 1001;
    var standWorldY = 749 + 20;
    player.setPosition({ x: standWorldX, y: standWorldY });
    
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("front", 1);
    } else {
      var url = URL.getDylan();
      $("#dylan").css("background-image", url + "/dylan-front-1.png)");
    }
    
    // Re-enable input AFTER setting position
    playerController.disableInput = false;
    
    gameWorld.setCameraOffset(initX, initY);
    gameWorld.syncToDom();
    onLogTop = false;
  }
  else if (onLogBottom) {
    onLog = false;
    sitting = false;
    
    $(".bench").css("z-index", "100");
    
    var standWorldX = 999;
    var standWorldY = 907 - 20;
    player.setPosition({ x: standWorldX, y: standWorldY });
    
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("back", 1);
    } else {
      var url = URL.getDylan();
      $("#dylan").css("background-image", url + "/dylan-back-1.png)");
    }
    
    // Re-enable input AFTER setting position
    playerController.disableInput = false;
    
    gameWorld.setCameraOffset(initX, initY);
    gameWorld.syncToDom();
    onLogBottom = false;
  }
  else if (onLogLeft) {
    onLog = false;
    sitting = false;
    
    var standWorldX = 890 + 20;
    var standWorldY = 836;
    player.setPosition({ x: standWorldX, y: standWorldY });
    
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("right", 1);
    } else {
      $("#dylan").css("background-image", URL.getDylan() + "/dylan-right-1.png)");
    }
    
    // Re-enable input AFTER setting position
    playerController.disableInput = false;
    
    gameWorld.setCameraOffset(initX, initY);
    gameWorld.syncToDom();
    onLogLeft = false;
  }
  else if (onLogRight) {
    onLog = false;
    sitting = false;
    
    var standWorldX = 1100;
    var standWorldY = 836;
    player.setPosition({ x: standWorldX, y: standWorldY });
    
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("left", 1);
    } else {
      $("#dylan").css("background-image", URL.getDylan() + "/dylan-left-1.png)");
    }
    
    // Re-enable input AFTER setting position
    playerController.disableInput = false;
    
    gameWorld.setCameraOffset(initX, initY);
    gameWorld.syncToDom();
    onLogRight = false;
  }
}

function sitOnLog(location) {
  console.log("sitOnLog called with location:", location);
  
  // Get GameWorld from playerController (same pattern as togglefire function)
  // Try both window and global
  var playerController = null;
  if (typeof window !== "undefined" && window.playerController) {
    playerController = window.playerController;
  } else if (typeof global !== "undefined" && global.playerController) {
    playerController = global.playerController;
  }
  
  if (!playerController) {
    console.log("PlayerController not available yet");
    // Wait a bit for it to initialize (it's initialized in $(function() {...}))
    // For now, just return - the user needs to wait for the system to initialize
    console.log("Please wait for the game to fully load, or refresh the page");
    return;
  }
  
  if (!playerController || !playerController.gameWorld) {
    console.log("GameWorld not available, playerController:", playerController);
    return;
  }
  
  var gameWorld = playerController.gameWorld;
  var player = gameWorld.player;
  
  if (!player) {
    console.log("Player not found");
    return;
  }
  
  // Only work on main map
  if (gameWorld.sceneName !== "mainMap") {
    console.log("Not on main map, scene:", gameWorld.sceneName);
    return;
  }
  
  var pos = player.getPosition();
  console.log("Player position:", pos);
  var MAP_SCALE = 3; // Match GameWorld MAP_SCALE
  
  // Bonfire area boundaries (world coordinates)
  var bonfireMinX = 680;
  var bonfireMaxX = 1292;
  var bonfireMinY = 650;
  var bonfireMaxY = 1068;
  
  // Check if player is in bonfire area
  var inBonfireArea = pos.x >= bonfireMinX && pos.x <= bonfireMaxX &&
                     pos.y >= bonfireMinY && pos.y <= bonfireMaxY;
  console.log("In bonfire area:", inBonfireArea);
  
  // Convert old CSS pixel positions to world coordinates
  // Old positions were in CSS pixels, new system uses world coords (divide by scale)
  
  if (location == 'top') {
    // Old check: left > 928 && left < 1040, top <= 780 && top >= 664
    // World coords: left > 928/3 && left < 1040/3, top <= 780/3 && top >= 664/3
    var worldLeft = pos.x;
    var worldTop = pos.y;
      var $dylan = $("#dylan");
      if (!$dylan.length) {
        console.log("Dylan element not found");
        return;
      }
      var cssLeft = parseInt($dylan.css("left")) || 0;
      var cssTop = parseInt($dylan.css("top")) || 0;
      // Check using CSS positions for compatibility OR if in bonfire area
      var canSit = inBonfireArea || (cssLeft > 928 && cssLeft < 1040 && cssTop <= 780 && cssTop >= 664);
      console.log("Can sit on top bench:", canSit, "cssLeft:", cssLeft, "cssTop:", cssTop);
      if (canSit) {
        if (!onLog) {
          // Save current camera offset
          var cameraOffset = gameWorld.getCameraOffset();
          initX = cameraOffset.x;
          initY = cameraOffset.y;
          
          // Bonfire center in world coordinates
          var bonfireCenterX = 984;
          var bonfireCenterY = 720;
          
          // Set camera offset to 0 when sitting
          // syncToDom will use bonfireCenterX/Y for camX/camY when sitting, so offset should be 0
          // This ensures the camera stays centered on bonfire
          gameWorld.setCameraOffset(0, 0);
          
          // Immediately update camera position (syncToDom will handle the animation smoothly)
          gameWorld.syncToDom();
          
          $(".bench").css("z-index", "10");
          
          // Set player position for top bench (facing front, sitting)
          // Using exact world coordinates from collider points
          var sitWorldX = 1001;
          var sitWorldY = 749;
          player.setPosition({ x: sitWorldX, y: sitWorldY });
          
          // Set sprite
          if (typeof SpriteManager !== "undefined") {
            SpriteManager.setSpriteFrame("front", 1);
          } else {
            var url = URL.getDylan();
            $("#dylan").css("background-image", url + "/dylan-front-1.png)");
          }
          
          // Disable input
          playerController.disableInput = true;
          
          sitting = true;
          onLog = true;
          onLogTop = true;
          
          // Set top bench z-index to 10 with !important (player will be 100)
          var $topBench = $(".bench.top");
          if ($topBench.length && $topBench[0]) {
            $topBench[0].style.setProperty("z-index", "10", "important");
          }
          // Also set player z-index to 100
          var $dylan = $("#dylan");
          if ($dylan.length && $dylan[0]) {
            $dylan[0].style.setProperty("z-index", "100", "important");
          }
          
          // Force z-index update immediately to ensure it sticks
          if (typeof ZIndexManager !== "undefined" && player) {
            var pos = player.getPosition();
            ZIndexManager.update(pos.y, pos.x, gameWorld.sceneName);
          }
        }
        else if (onLogTop) {
          // Stand up
          onLog = false;
          sitting = false;
          playerController.disableInput = false;
          
          // Stand up position: slightly in front of the bench (below it)
          var standWorldX = 1001; // Same X as sitting
          var standWorldY = 749 + 20; // Slightly below sitting position
          player.setPosition({ x: standWorldX, y: standWorldY });
          
          // Set sprite
          if (typeof SpriteManager !== "undefined") {
            SpriteManager.setSpriteFrame("front", 1);
          } else {
            var url = URL.getDylan();
            $("#dylan").css("background-image", url + "/dylan-front-1.png)");
          }
          
          // Remove !important from z-index to restore normal z-index rules
          var $topBench = $(".bench.top");
          if ($topBench.length && $topBench[0]) {
            $topBench[0].style.removeProperty("z-index");
          }
          // Restore player z-index to normal (will be set by game-world.js)
          var $dylan = $("#dylan");
          if ($dylan.length && $dylan[0]) {
            $dylan[0].style.removeProperty("z-index");
          }
          
          // Restore camera to follow player
          gameWorld.setCameraOffset(initX, initY);
          // Trigger camera update
          gameWorld.syncToDom();
          
          // Force z-index update to restore normal rules
          if (typeof ZIndexManager !== "undefined" && player) {
            var pos = player.getPosition();
            ZIndexManager.update(pos.y, pos.x, gameWorld.sceneName);
          }
          
          onLogTop = false;
        }
      }
  }
  else if (location == "bottom") {
    var $dylan = $("#dylan");
    if (!$dylan.length) {
      console.log("Dylan element not found");
      return;
    }
    var cssLeft = parseInt($dylan.css("left")) || 0;
    var cssTop = parseInt($dylan.css("top")) || 0;
    var canSit = inBonfireArea || (cssLeft > 928 && cssLeft < 1040 && cssTop >= 824 && cssTop <= 940);
    console.log("Can sit on bottom bench:", canSit);
      if (canSit) {
      if (!onLog) {
        var cameraOffset = gameWorld.getCameraOffset();
        initX = cameraOffset.x;
        initY = cameraOffset.y;
        
        // Bonfire center in world coordinates
        var bonfireCenterX = 984;
        var bonfireCenterY = 720;
        
        // Set camera offset to 0 when sitting
        // syncToDom will use bonfireCenterX/Y for camX/camY when sitting, so offset should be 0
        gameWorld.setCameraOffset(0, 0);
        
        // Immediately update camera position (syncToDom will handle it)
        gameWorld.syncToDom();
        
        $(".bench").css("z-index", "100");
        
        // Bottom bench position (facing back, sitting)
        // Using exact world coordinates from collider points
        var sitWorldX = 999;
        var sitWorldY = 907;
        player.setPosition({ x: sitWorldX, y: sitWorldY });
        
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("back", 1);
        } else {
          var url = URL.getDylan();
          $("#dylan").css("background-image", url + "/dylan-back-1.png)");
        }
        
        playerController.disableInput = true;
        
        sitting = true;
        onLog = true;
        onLogBottom = true;
      }
        else if (onLogBottom) {
          onLog = false;
          sitting = false;
          playerController.disableInput = false;
          
          $(".bench").css("z-index", "100");
          
          // Stand up position: slightly in front of the bench (above it)
          var standWorldX = 999; // Same X as sitting
          var standWorldY = 907 - 20; // Slightly above sitting position
          player.setPosition({ x: standWorldX, y: standWorldY });
          
          if (typeof SpriteManager !== "undefined") {
            SpriteManager.setSpriteFrame("back", 1);
          } else {
            var url = URL.getDylan();
            $("#dylan").css("background-image", url + "/dylan-back-1.png)");
          }
          
          // Restore camera to follow player
          gameWorld.setCameraOffset(initX, initY);
          gameWorld.syncToDom();
          
          onLogBottom = false;
        }
    }
  }
  else if (location == "left" && window.innerWidth > 600) {
    var $dylan = $("#dylan");
    if (!$dylan.length) {
      console.log("Dylan element not found");
      return;
    }
    var cssLeft = parseInt($dylan.css("left")) || 0;
    var cssTop = parseInt($dylan.css("top")) || 0;
    var canSit = inBonfireArea || (cssTop >= 740 && cssTop <= 868 && cssLeft >= 788 && cssLeft <= 938);
    console.log("Can sit on left stump:", canSit);
      if (canSit) {
      if (!onLog) {
        // Bonfire center
        var bonfireCenterX = 984;
        var bonfireCenterY = 720;
        
        // Set camera offset to 0 when sitting
        // syncToDom will use bonfireCenterX/Y for camX/camY when sitting, so offset should be 0
        gameWorld.setCameraOffset(0, 0);
        
        // Immediately update camera position (syncToDom will handle it)
        gameWorld.syncToDom();
        
        // Left stump position (facing right, sitting)
        // Using exact world coordinates from collider points
        var sitWorldX = 890;
        var sitWorldY = 836;
        player.setPosition({ x: sitWorldX, y: sitWorldY });
        
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("right", 1);
        } else {
          $("#dylan").css("background-image", URL.getDylan() + "/dylan-right-1.png)");
        }
        
        playerController.disableInput = true;
        
        sitting = true;
        onLog = true;
        onLogLeft = true;
        
        // Set left stump z-index to 10 with !important (player will be 100)
        var $leftStump = $(".tree-stump.left");
        if ($leftStump.length && $leftStump[0]) {
          $leftStump[0].style.setProperty("z-index", "10", "important");
        }
        // Also set player z-index to 100
        var $dylan = $("#dylan");
        if ($dylan.length && $dylan[0]) {
          $dylan[0].style.setProperty("z-index", "100", "important");
        }
        
        // Force z-index update immediately to ensure it sticks
        if (typeof ZIndexManager !== "undefined" && player) {
          var pos = player.getPosition();
          ZIndexManager.update(pos.y, pos.x, gameWorld.sceneName);
        }
      }
        else if (onLogLeft) {
          onLog = false;
          sitting = false;
          playerController.disableInput = false;
          
          // Stand up position: slightly to the right of the stump
          var standWorldX = 890 + 20; // Slightly to the right of sitting position
          var standWorldY = 836; // Same Y as sitting
          player.setPosition({ x: standWorldX, y: standWorldY });
          
          if (typeof SpriteManager !== "undefined") {
            SpriteManager.setSpriteFrame("right", 1);
          } else {
            $("#dylan").css("background-image", URL.getDylan() + "/dylan-right-1.png)");
          }
          
          // Remove !important from z-index to restore normal z-index rules
          var $leftStump = $(".tree-stump.left");
          if ($leftStump.length && $leftStump[0]) {
            $leftStump[0].style.removeProperty("z-index");
          }
          // Restore player z-index to normal (will be set by game-world.js)
          if ($dylan.length && $dylan[0]) {
            $dylan[0].style.removeProperty("z-index");
          }
          
          // Restore camera
          gameWorld.setCameraOffset(initX, initY);
          gameWorld.syncToDom();
          
          // Force z-index update to restore normal rules
          if (typeof ZIndexManager !== "undefined" && player) {
            var pos = player.getPosition();
            ZIndexManager.update(pos.y, pos.x, gameWorld.sceneName);
          }
          
          onLogLeft = false;
        }
    }
  }
  else if (location == "right" && window.innerWidth > 600) {
    var $dylan = $("#dylan");
    if (!$dylan.length) {
      console.log("Dylan element not found");
      return;
    }
    var cssLeft = parseInt($dylan.css("left")) || 0;
    var cssTop = parseInt($dylan.css("top")) || 0;
    var canSit = inBonfireArea || (cssTop >= 740 && cssTop <= 868 && cssLeft >= 1032 && cssLeft <= 1176);
    console.log("Can sit on right stump:", canSit);
      if (canSit) {
      if (!onLog) {
        // Bonfire center
        var bonfireCenterX = 984;
        var bonfireCenterY = 720;
        
        // Set camera offset to 0 when sitting
        // syncToDom will use bonfireCenterX/Y for camX/camY when sitting, so offset should be 0
        gameWorld.setCameraOffset(0, 0);
        
        // Immediately update camera position (syncToDom will handle it)
        gameWorld.syncToDom();
        
        // Right stump position (facing left, sitting)
        // Swapped: sitting position is now where standing was
        var sitWorldX = 1120; // 20px to the right (swapped from standing position)
        var sitWorldY = 836; // Same Y as left stump
        player.setPosition({ x: sitWorldX, y: sitWorldY });
        
        if (typeof SpriteManager !== "undefined") {
          SpriteManager.setSpriteFrame("left", 1);
        } else {
          $("#dylan").css("background-image", URL.getDylan() + "/dylan-left-1.png)");
        }
        
        playerController.disableInput = true;
        
        sitting = true;
        onLog = true;
        onLogRight = true;
        
        // Set right stump z-index to 10 with !important (player will be 100)
        var $rightStump = $(".tree-stump.right");
        if ($rightStump.length && $rightStump[0]) {
          $rightStump[0].style.setProperty("z-index", "10", "important");
        }
        // Also set player z-index to 100
        var $dylan = $("#dylan");
        if ($dylan.length && $dylan[0]) {
          $dylan[0].style.setProperty("z-index", "100", "important");
        }
        
        // Force z-index update immediately to ensure it sticks
        if (typeof ZIndexManager !== "undefined" && player) {
          var pos = player.getPosition();
          ZIndexManager.update(pos.y, pos.x, gameWorld.sceneName);
        }
      }
        else if (onLogRight) {
          onLog = false;
          sitting = false;
          playerController.disableInput = false;
          
          // Stand up position: swapped - now at original sitting position
          var standWorldX = 1100; // Original sitting position (swapped)
          var standWorldY = 836; // Same Y as sitting
          player.setPosition({ x: standWorldX, y: standWorldY });
          
          if (typeof SpriteManager !== "undefined") {
            SpriteManager.setSpriteFrame("left", 1);
          } else {
            $("#dylan").css("background-image", URL.getDylan() + "/dylan-left-1.png)");
          }
          
          // Remove !important from z-index to restore normal z-index rules
          var $rightStump = $(".tree-stump.right");
          if ($rightStump.length && $rightStump[0]) {
            $rightStump[0].style.removeProperty("z-index");
          }
          // Restore player z-index to normal (will be set by game-world.js)
          var $dylan = $("#dylan");
          if ($dylan.length && $dylan[0]) {
            $dylan[0].style.removeProperty("z-index");
          }
          
          // Restore camera
          gameWorld.setCameraOffset(initX, initY);
          gameWorld.syncToDom();
          
          // Force z-index update to restore normal rules
          if (typeof ZIndexManager !== "undefined" && player) {
            var pos = player.getPosition();
            ZIndexManager.update(pos.y, pos.x, gameWorld.sceneName);
          }
          
          onLogRight = false;
        }
    }
  }
}

function openTent1(side){
  // Use GameWorld if available, otherwise fall back to old system
  if (typeof gameWorld !== "undefined" && gameWorld && typeof gameWorld.changeScene === "function") {
    // Convert CSS positions to world coordinates
    // Front door: CSS left: 192px, top: 152px -> world coords
    // Back door: CSS left: 156px, top: -36px -> world coords
    var spawnPos;
    if (side === "front") {
      // Front door spawn - default spawn position (near front doormat)
      spawnPos = { x: 208, y: 94 }; // Default front spawn
    } else if (side === "back") {
      // Back door spawn - position near back door (top of tent)
      // Back door trigger is at x: 152, y: -58, doormat.back is centered
      // CSS position was left: 156px, top: -36px
      // Convert to world coordinates: tent is 416px wide, center is 208
      // For back door, spawn near the top where back door is located
      spawnPos = { x: 208, y: -45 }; // Near back door area (centered, near top)
    } else {
      // Default to front if side is not specified
      spawnPos = { x: 208, y: 94 };
    }
    
    console.log("openTent1: side =", side, "spawnPos =", spawnPos);
    gameWorld.changeScene("tent1", { spawnOverride: spawnPos });ssd
    tentOpen = true;
    
    // Ensure player position is set correctly after scene change
    // Use setTimeout to ensure scene change has completed
    setTimeout(function() {
      if (gameWorld.player && typeof gameWorld.player.setPosition === "function") {
        console.log("Setting player position to:", spawnPos);
        gameWorld.player.setPosition(spawnPos);
        // Force sync to update DOM immediately
        gameWorld.syncToDom();
      }
    }, 0);
    
    // Set z-index and visibility
    $("#dylan").css("z-index", "9999").css("display", "block").css("visibility", "visible");
    $(".cover-screen.tent1").show();
    
    // Set sprite frame
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("front", 2);
    } else {
      $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
    }
  } else {
    // Old system fallback
    $('#dylan').remove(); 
    // Remove tooltip class to prevent visibility issues - tooltip is only needed for speech bubbles
    $('#tent1').append("<div id='dylan'> <img class='animation'/><div class='nes-balloon from-left'><p>HELLO WORLD</p></div></div>");

    tentOpen = true;

    $("#dylan").css("z-index","9999").css("display","block").css("visibility","visible");
    $(".cover-screen.tent1").show();

    if(side == "front"){
      $("#dylan").css({
        left: "192px",
        top: "152px",
        visibility: "visible"
      });
      // Use frame 2 instead of 1 (frame 1 has wrong height)
      if (typeof SpriteManager !== "undefined") {
        SpriteManager.setSpriteFrame("front", 2);
      } else {
        $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
      }
      $("#dylan").fadeIn();

      $("#map").css({
        marginLeft: 0,
        marginTop: "-1824px"
      });
    }
    else{
      $("#dylan").css({
        left: "156px",
        top: "-36px",
        visibility: "visible"
      });
      // Use frame 2 instead of 1 (frame 1 has wrong height)
      if (typeof SpriteManager !== "undefined") {
        SpriteManager.setSpriteFrame("front", 2);
      } else {
        $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
      }
      $("#dylan").fadeIn();

      $("#map").css({
        marginLeft: 108+"px",
        marginTop: "-1260px"
      });
    }
  }
}

function leaveTent1(dir){
  // Use GameWorld if available, otherwise fall back to old system
  if (typeof gameWorld !== "undefined" && gameWorld && typeof gameWorld.changeScene === "function") {
    // Determine spawn position based on exit direction
    var spawnPos;
    if (dir == 1) {
      // Front door exit
      spawnPos = { x: 308, y: 730 };
    } else {
      // Back door exit
      spawnPos = { x: 290, y: 640 };
    }
    
    // Change scene back to mainMap with correct spawn position
    gameWorld.changeScene("mainMap", { spawnOverride: spawnPos });
    tentOpen = false;
    
    // Set z-index to 49 for main map (correct z-index for player on main map)
    $("#dylan").css("z-index", "49").css("display", "block").css("visibility", "visible");
    $(".cover-screen.tent1").hide();
    
    // Close tent door if exiting front
    if (dir == 1) {
      $(".tentdoor.tent1").height(0);
    }
    
    // Set sprite frame
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("front", 2);
    } else {
      $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
    }
  } else {
    // Old system fallback
    $('#dylan').remove();
    // Remove tooltip class to prevent visibility issues - tooltip is only needed for speech bubbles
    $('#map').append("<div id='dylan'> <img class='animation'/><div class='nes-balloon from-left'><p>HELLO WORLD</p></div></div>");
    $("#dylan").css("z-index","49").css("display","block").css("visibility","visible");
    tentOpen = false;
    
    if(dir == 1){
      $("#dylan").css({
        left: "292px",
        top: "648px",
        visibility: "visible"
      });
      // Use frame 2 instead of 1 (frame 1 has wrong height)
      if (typeof SpriteManager !== "undefined") {
        SpriteManager.setSpriteFrame("front", 2);
      } else {
        $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
      }
      $("#map").css({
        marginLeft: "2064px",
        marginTop: "-1344px"
      });
      $(".tentdoor.tent1").height(0);
    }
    else{
      $("#dylan").css({
        left: "260px",
        top: "584px",
        visibility: "visible"
      });
      // Use frame 2 instead of 1 (frame 1 has wrong height)
      if (typeof SpriteManager !== "undefined") {
        SpriteManager.setSpriteFrame("front", 2);
      } else {
        $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
      }
      $("#map").css({
        marginLeft: "2160px",
        marginTop: "-1164px"
      });
    }
    $(".cover-screen.tent1").hide();
  }
}

function openSettings(){
  if($(".settings_bar").hasClass("open"))
    $(".settings_bar").removeClass("open");
  else
    $(".settings_bar").addClass("open");
}
// function toggleMusic(){
//   if($(".settings-icon.music").hasClass("on")){
//     $(".settings-icon.music").removeClass("on").addClass("off");
//     // musicOn = false;
//     // document.getElementById("background-music").pause(); 
//   }
//   else{
//     $(".settings-icon.music").removeClass("off").addClass("on");
//     // document.getElementById("background-music").play(); 
//     // musicOn = true;
//   }   
// }

// function toggleSFX(){
//   if($(".settings-icon.SFX").hasClass("on")){
//     $(".settings-icon.SFX").removeClass("on").addClass("off");

//     if(fireOn){
//       document.getElementById("crackle-fire").pause(); 
//     }
//     SFXOn = false;
//   }
//   else{
//     $(".settings-icon.SFX").removeClass("off").addClass("on");
//     if(fireOn){
//       document.getElementById("crackle-fire").play(); 
//     }
//     SFXOn = true;
//   }
// }

function toggleSocialMedia(){
  if($(".socialMedia-icon").hasClass("on")){
    $(".iphone-screen").css("display","none");
    $(".socialMedia-icon").removeClass("on").addClass("off");
   
  }
  else{
    $(".iphone-screen").css("display","block");
    $(".socialMedia-icon").removeClass("off").addClass("on");
    
  }
}

function openTVScreen(){
  $(".socialMedia-icon").css("display","none");
  $(".minimap-icon").css("display","none");
  $(".mobile-controller").css("display","none");
  // sitting = true;
  // $(".couch").css("z-index", "10000");
  // $("#dylan").css({
  //   // left: "260px",
  //   top: "-4px",
  //   visibility: "visible",
  //   backgroundImage: "url(resources/images/characters/dylan/dylan-back-1.png)"
  // });
  // $("#map").css({
  //   // marginLeft: "2160px",
  //   marginTop: "-1356px"
  // });
  $(".tv-container").css("display","flex");
  $(".scrollContent").css("display","none");
}

function sitOnCouch(){
  if(!sitting && parseInt($("#dylan").css("left")) >= 288 && parseInt($("#dylan").css("left")) <= 360){
    sitting = true;
    $(".couch").css("z-index", "10000");
    $("#dylan").css({
      // left: "260px",
      top: "-4px",
      visibility: "visible"
    });
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("back", 1);
    } else {
      $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-back-1.png)");
    }
    $("#map").css({
      // marginLeft: "2160px",
      marginTop: "-1356px"

    });
  }
  else if(sitting){
    sitting = false;
    $("#dylan").css({
      top: "-8px",
      visibility: "visible"
    });
    // Use frame 2 instead of 1 for front (frame 1 has wrong height)
    if (typeof SpriteManager !== "undefined") {
      SpriteManager.setSpriteFrame("front", 2);
    } else {
      $("#dylan").css("backgroundImage", "url(resources/images/characters/dylan/dylan-front-2.png)");
    }
    $("#map").css({
      // marginLeft: "2160px",
      marginTop: "-1360px"

    });
  }
  
}

function openPortfolio(){
  // Allow opening portfolio from anywhere (including global menu)
    $(".portfolio-container").css("display","block");
    eventOccurence = true;
    $(".minimap-icon").css("display","none");
    $(".mobile-controller").css("display","none");
    
    // Initialize portfolio tabs and load projects
    initPortfolioTabs();
    loadPortfolioProjects();
}

function openPortfolioWithLogoFilter(){
  // Open portfolio and filter to show only logos
  openPortfolio();
  // Small delay to ensure portfolio modal is loaded
  setTimeout(function() {
    if (typeof filterSelection === "function") {
      filterSelection('.logo');
    }
  }, 100);
}

function closePortfolio(){
  $(".portfolio-container").css("display","none");
  eventOccurence = false;
  if(inventory.minimap)
    $(".minimap-icon").css("display","block");
  if(window.innerWidth <= 600)
    $(".mobile-controller").css("display","flex");
}

// Portfolio tab management
function initPortfolioTabs() {
  $(".portfolio-tab").on("click", function() {
    var tabName = $(this).data("tab");
    switchPortfolioTab(tabName);
  });
}

function switchPortfolioTab(tabName) {
  // Remove active class from all tabs and content
  $(".portfolio-tab").removeClass("active");
  $(".portfolio-tab-content").removeClass("active");
  
  // Add active class to selected tab and content
  $(".portfolio-tab[data-tab='" + tabName + "']").addClass("active");
  $("#portfolio-tab-" + tabName).addClass("active");
}

// Load portfolio projects from config
function loadPortfolioProjects() {
  if (typeof PORTFOLIO_PROJECTS === "undefined") {
    console.error("PORTFOLIO_PROJECTS not defined");
    return;
  }
  
  var $grid = $("#portfolio-projects-grid");
  if (!$grid.length) return;
  
  $grid.empty();
  
  PORTFOLIO_PROJECTS.forEach(function(project) {
    var $project = $('<div class="portfolio-project-card nes-container with-title is-centered" data-category="' + project.category + '" onclick="openProjectLightbox(\'' + project.id + '\')">');
    $project.append('<p class="title">' + (project.title || "") + '</p>');
    if (project.image) {
      $project.append('<img src="' + project.image + '" alt="' + (project.title || "") + '" style="width:100%; max-height:200px; object-fit:contain;">');
    }
    $project.append('<p>' + (project.description || "").substring(0, 100) + '...</p>');
    $grid.append($project);
  });
}

// Filter portfolio projects by category
function filterPortfolioProjects(category) {
  // Update filter buttons
  $(".portfolio-filter-btn").removeClass("active");
  $(".portfolio-filter-btn[data-category='" + category + "']").addClass("active");
  
  // Filter project cards
  if (category === "all") {
    $(".portfolio-project-card").show();
  } else {
    $(".portfolio-project-card").hide();
    $(".portfolio-project-card[data-category='" + category + "']").show();
  }
}

// Initialize portfolio gallery with project previews and labels
function initializePortfolioGallery() {
  if (typeof PORTFOLIO_PROJECTS === "undefined" || typeof PORTFOLIO_SQUARE_MAP === "undefined") {
    return;
  }
  
  // Track which squares are occupied by spans
  var occupiedSquares = {};
  
  // Populate squares based on mapping
  Object.keys(PORTFOLIO_SQUARE_MAP).forEach(function(squareId) {
    var mapping = PORTFOLIO_SQUARE_MAP[squareId];
    var $square = $('.portfolio-garden-square[data-square-id="' + squareId + '"]');
    
    if (!$square.length) return;
    
    // Skip if this square is already occupied by a span
    if (occupiedSquares[squareId]) {
      $square.hide(); // Hide the square that's part of a span
      return;
    }
    
    // Handle 2-column spans
    if (mapping.span === 2) {
      var parts = squareId.split('-');
      var row = parseInt(parts[0]);
      var col = parseInt(parts[1]);
      // Mark the next square as occupied too
      var nextSquareId = row + '-' + (col + 1);
      occupiedSquares[nextSquareId] = true;
      
      // Hide the yellow flower between the two squares
      var $row = $square.closest('.portfolio-garden-row');
      var $rowChildren = $row.children();
      var flowerIndex = $rowChildren.index($square) + 1;
      if ($rowChildren.eq(flowerIndex).hasClass('portfolio-yellow-flower')) {
        $rowChildren.eq(flowerIndex).hide();
      }
    }
    
    // Handle 2-row spans (vertical)
    if (mapping.spanRows === 2) {
      var parts = squareId.split('-');
      var row = parseInt(parts[0]);
      var col = parseInt(parts[1]);
      // Mark the square below as occupied
      var belowSquareId = (row + 1) + '-' + col;
      occupiedSquares[belowSquareId] = true;
      
      // Hide the rose bush divider between the rows
      var $gallery = $square.closest('.portfolio-gallery');
      var $roseRow = $gallery.find('.portfolio-rose-row.row-divider-' + row);
      if ($roseRow.length) {
        $roseRow.hide();
      }
      
      // Position absolutely to cover both rows
      var $row = $square.closest('.portfolio-garden-row');
      var rowTop = $row.position().top;
      $square.css({
        'position': 'absolute',
        'top': rowTop + 'px',
        'left': $square.position().left + 'px'
      });
    }
    
    // Apply span classes if needed
    if (mapping.span === 2) {
      $square.addClass('span-2');
    }
    if (mapping.spanRows === 2) {
      $square.addClass('span-2-rows');
    }
    
    // If there's a project assigned to this square
    if (mapping.projectId) {
      var project = getProjectById(mapping.projectId);
      if (project) {
        // Add preview image, video, or placeholder text
        if (project.image) {
          var $preview = $('<div class="project-preview"></div>');
          // Ensure proper URL encoding for paths with spaces
          var imageUrl = project.image.replace(/ /g, '%20');
          $preview.css({
            'background-image': 'url(' + imageUrl + ')'
          });
          $square.append($preview);
        } else if (project.video) {
          // Add video element for video projects
          var $video = $('<video class="project-video" muted loop playsinline></video>');
          var videoUrl = project.video.replace(/ /g, '%20');
          $video.attr('src', videoUrl);
          $video.css({
            'width': '100%',
            'height': '100%',
            'object-fit': 'cover'
          });
          $square.append($video);
          // Auto-play video on hover
          $square.hover(
            function() { $video[0].play(); },
            function() { $video[0].pause(); }
          );
        } else if (project.placeholder) {
          // Use placeholder text instead of image
          var $placeholder = $('<div class="project-placeholder"></div>');
          $placeholder.text(project.placeholder);
          
          // Special handling for Colorle - random color background
          if (project.placeholderColor) {
            var randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            $placeholder.css('background-color', randomColor);
            // Calculate contrast color (white or black text based on brightness)
            var r = parseInt(randomColor.substr(1, 2), 16);
            var g = parseInt(randomColor.substr(3, 2), 16);
            var b = parseInt(randomColor.substr(5, 2), 16);
            var brightness = (r * 299 + g * 587 + b * 114) / 1000;
            var textColor = brightness > 128 ? '#000000' : '#ffffff';
            $placeholder.css('color', textColor);
            $placeholder.css('text-shadow', brightness > 128 ? 'none' : '2px 2px 0px rgba(0, 0, 0, 0.8)');
          }
          
          // Special handling for Fractal - fractal pattern background
          if (project.placeholderFractal) {
            $placeholder.addClass('fractal-pattern');
          }
          
          $square.append($placeholder);
        }
        
        // Add project badge with type icon and color
        var $badge = $('<div class="project-badge type-' + project.type + '"></div>');
        
        // FontAwesome icons for each type
        var typeIcons = {
          'mobile-app': 'fa-mobile-alt',
          'website': 'fa-globe',
          'logo': 'fa-palette',
          'graphic': 'fa-image',
          'research-paper': 'fa-file-alt'
        };
        
        var iconClass = typeIcons[project.type] || 'fa-tag';
        var $icon = $('<i class="fas ' + iconClass + ' project-badge-icon"></i>');
        $badge.append($icon);
        
        $square.append($badge);
        
        // Add click handler (using .click() for older jQuery compatibility)
        $square.click(function() {
          openProjectLightbox(project.id);
        });
        
        // Add data attribute for styling
        $square.attr('data-project-id', project.id);
      }
    } else {
      // Empty square - make it less prominent
      $square.css('opacity', '0.5');
    }
  });
}

// Setup click handlers for portfolio project displays
function setupPortfolioStandHandlers() {
  // Use event delegation for portfolio project displays (both old and new class names)
  document.addEventListener('click', function(e) {
    var target = e.target;
    var displayElement = null;
    
    // Check if clicked element or its parent is a portfolio project display
    while (target && target !== document.body) {
      if (target.classList && (
          target.classList.contains('portfolio-project-display') || 
          target.classList.contains('portfolio-project-stand') ||
          target.classList.contains('portfolio-project-frame')
        )) {
        // Find the parent display element if we clicked on a child
        var parent = target;
        while (parent && parent !== document.body) {
          if (parent.classList && parent.classList.contains('portfolio-project-display')) {
            displayElement = parent;
            break;
          }
          if (parent.classList && parent.classList.contains('portfolio-project-stand')) {
            displayElement = parent;
            break;
          }
          parent = parent.parentElement;
        }
        if (!displayElement && target.classList.contains('portfolio-project-display')) {
          displayElement = target;
        }
        if (!displayElement && target.classList.contains('portfolio-project-stand')) {
          displayElement = target;
        }
        break;
      }
      target = target.parentElement;
    }
    
    if (displayElement) {
      var projectId = displayElement.getAttribute("data-project-id");
      if (projectId && typeof openProjectLightbox === "function") {
        openProjectLightbox(projectId);
      }
    }
  });
}

function openPaintingLightbox(){
  $(".painting-lightbox").css("display","flex");
  eventOccurence = true;
  $(".minimap-icon").css("display","none");
  if(window.innerWidth <= 600)
    $(".mobile-controller").css("display","none");
}

function closePaintingLightbox(){
  $(".painting-lightbox").css("display","none");
  eventOccurence = false;
  if(inventory.minimap)
    $(".minimap-icon").css("display","block");
  if(window.innerWidth <= 600)
    $(".mobile-controller").css("display","flex");
}

function openProjectLightbox(projectId){
  if (typeof PORTFOLIO_PROJECTS === "undefined" || typeof getProjectById === "undefined") {
    console.error("Portfolio config not loaded");
    return;
  }
  
  var project = getProjectById(projectId);
  if (!project) {
    console.error("Project not found:", projectId);
    return;
  }
  
  var $lightbox = $(".project-lightbox");
  if (!$lightbox.length) {
    console.error("Project lightbox element not found");
    return;
  }
  
  // Set project image or video
  var $img = $("#project-lightbox-image");
  var $video = $("#project-lightbox-video");
  
  if (project.video) {
    // Show video instead of image
    $img.hide();
    if (!$video.length) {
      // Create video element if it doesn't exist
      $video = $('<video id="project-lightbox-video" class="project-lightbox-video" controls autoplay></video>');
      $img.after($video);
    }
    var videoUrl = project.video.replace(/ /g, '%20');
    $video.attr("src", videoUrl);
    $video.show();
  } else if (project.image) {
    // Show image
    $video.hide();
    // Ensure proper URL encoding for paths with spaces
    var imageUrl = project.image.replace(/ /g, '%20');
    $img.attr("src", imageUrl);
    $img.show();
  } else {
    $img.hide();
    $video.hide();
  }
  
  // Set project title
  $("#project-lightbox-title").text(project.title || "");
  
  // Set category
  var categoryNames = {
    "web-development": "Web Development",
    "software-projects": "Software Projects",
    "ux-design": "UX Design",
    "logos": "Logos"
  };
  $("#project-lightbox-category").text(categoryNames[project.category] || project.category || "");
  
  // Set description
  $("#project-lightbox-description").text(project.description || "");
  
  // Set meta information
  var $meta = $("#project-lightbox-meta");
  $meta.empty();
  if (project.type) {
    var typeNames = {
      "website": "Website",
      "mobile-app": "Mobile App",
      "research-paper": "Research Paper"
    };
    $meta.append('<div class="project-type">' + (typeNames[project.type] || project.type) + '</div>');
  }
  if (project.published) {
    $meta.append('<div class="project-published">Published</div>');
  }
  if (project.awards && project.awards.length > 0) {
    project.awards.forEach(function(award) {
      $meta.append('<div class="project-award">🏆 ' + award + '</div>');
    });
  }
  
  // Set links
  var $links = $("#project-lightbox-links");
  $links.empty();
  if (project.link) {
    $links.append('<a href="' + project.link + '" target="_blank" class="nes-btn is-primary">Visit Project</a>');
  }
  
  // Show lightbox
  $lightbox.css("display", "flex");
  eventOccurence = true;
  $(".minimap-icon").css("display", "none");
  if(window.innerWidth <= 600)
    $(".mobile-controller").css("display", "none");
}

function closeProjectLightbox(){
  $(".project-lightbox").css("display", "none");
  eventOccurence = false;
  if(inventory.minimap)
    $(".minimap-icon").css("display", "block");
  if(window.innerWidth <= 600)
    $(".mobile-controller").css("display", "flex");
}

function turnOffTV(){
  $(".socialMedia-icon").css("display","block");
  $(".scrollmenu").css("display","none");
  $(".tv-container").css("display","none");
  if(inventory.minimap)
    $(".minimap-icon").css("display","block");
  if(window.innerWidth <= 600)
    $(".mobile-controller").css("display","flex");
}

function toggleJoycon(e){
  // const event = new CustomEvent('build', { keyCode: e });
  // let element = document.querySelector('.joycon.arrow');
  // element.dispatchEvent(new KeyboardEvent("keydown", {
  //   key: "e",
  //   keyCode: 37, // example values.
  //   code: "KeyE", // put everything you need in this object.
  //   which: 69
  // }));
  // move(e);
}


//handler for joycon on mobile
var setint  = '';
$(document).ready(function() {

  // Mobile controller handlers with touch support
  function startMovement(direction) {
    // Hide tutorial bubble when user starts moving
    if ($("#tutorial-bubble").is(":visible")) {
      closeTutorial();
    }
    
    // Check if new movement engine (PlayerController) is active
    if (window.useNewMovementEngine && window.playerController) {
      // Clear all direction keys first
      window.playerController.keysDown[37] = false;
      window.playerController.keysDown[38] = false;
      window.playerController.keysDown[39] = false;
      window.playerController.keysDown[40] = false;
      
      // Set the pressed direction
      window.playerController.keysDown[direction] = true;
      
      // Recompute axes to update movement
      if (typeof window.playerController._recomputeAxes === 'function') {
        window.playerController._recomputeAxes();
      }
    } else {
      // Legacy movement engine
      var animRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.anim : anim;
      clearInterval(animRef);
      if (typeof WORLD !== "undefined" && WORLD.movement) {
        WORLD.movement.anim = null;
      } else {
        anim = null;
      }
      
      // Clear all direction keys first
      keysPressed[37] = false;
      keysPressed[38] = false;
      keysPressed[39] = false;
      keysPressed[40] = false;
      
      // Then set the current direction as pressed
      keysPressed[direction] = true;
      
      // Also update WORLD.movement.keysPressed if it exists
      if (typeof WORLD !== "undefined" && WORLD.movement && WORLD.movement.keysPressed) {
        WORLD.movement.keysPressed[37] = false;
        WORLD.movement.keysPressed[38] = false;
        WORLD.movement.keysPressed[39] = false;
        WORLD.movement.keysPressed[40] = false;
        WORLD.movement.keysPressed[direction] = true;
      }
      
      // Reset keyPressed flag so move() can start a new interval
      if (typeof WORLD !== "undefined" && WORLD.movement) {
        WORLD.movement.keyPressed = false;
      } else {
        keyPressed = false;
      }
      
      // Call move immediately to turn character and start movement
      move(direction);
    }
  }

  function stopMovement() {
    // Check if new movement engine (PlayerController) is active
    if (window.useNewMovementEngine && window.playerController) {
      // Clear all direction keys
      window.playerController.keysDown[37] = false;
      window.playerController.keysDown[38] = false;
      window.playerController.keysDown[39] = false;
      window.playerController.keysDown[40] = false;
      
      // Recompute axes to stop movement
      if (typeof window.playerController._recomputeAxes === 'function') {
        window.playerController._recomputeAxes();
      }
    } else {
      // Legacy movement engine
      var animRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.anim : anim;
      clearInterval(animRef);
      if (typeof WORLD !== "undefined" && WORLD.movement) {
        WORLD.movement.keyPressed = false;
        WORLD.movement.anim = null;
      } else {
        keyPressed = false;
      }
      
      // Clear all direction keys in both keysPressed objects
      keysPressed[37] = false;
      keysPressed[38] = false;
      keysPressed[39] = false;
      keysPressed[40] = false;
      
      // Also clear WORLD.movement.keysPressed if it exists
      if (typeof WORLD !== "undefined" && WORLD.movement && WORLD.movement.keysPressed) {
        WORLD.movement.keysPressed[37] = false;
        WORLD.movement.keysPressed[38] = false;
        WORLD.movement.keysPressed[39] = false;
        WORLD.movement.keysPressed[40] = false;
      }
    }
  }

  // Up button
  $('.mobile-btn-up').bind('touchstart', function(e) {
    e.preventDefault();
    e.stopPropagation();
    startMovement(38);
    return false;
  });
  $('.mobile-btn-up').bind('touchend', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-up').bind('touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-up').bind('mousedown', function(e) {
    e.preventDefault();
    startMovement(38);
  });
  $('.mobile-btn-up').bind('mouseup', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-up').bind('mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Down button
  $('.mobile-btn-down').bind('touchstart', function(e) {
    e.preventDefault();
    startMovement(40);
  });
  $('.mobile-btn-down').bind('touchend', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-down').bind('touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-down').bind('mousedown', function(e) {
    e.preventDefault();
    startMovement(40);
  });
  $('.mobile-btn-down').bind('mouseup', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-down').bind('mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Left button
  $('.mobile-btn-left').bind('touchstart', function(e) {
    e.preventDefault();
    startMovement(37);
  });
  $('.mobile-btn-left').bind('touchend', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-left').bind('touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-left').bind('mousedown', function(e) {
    e.preventDefault();
    startMovement(37);
  });
  $('.mobile-btn-left').bind('mouseup', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-left').bind('mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Right button
  $('.mobile-btn-right').bind('touchstart', function(e) {
    e.preventDefault();
    startMovement(39);
  });
  $('.mobile-btn-right').bind('touchend', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-right').bind('touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-right').bind('mousedown', function(e) {
    e.preventDefault();
    startMovement(39);
  });
  $('.mobile-btn-right').bind('mouseup', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-right').bind('mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Logo Gallery Click Handlers
  $('.logo-item').bind('click', function(e) {
    e.stopPropagation();
    openPortfolioWithLogoFilter();
  });

  // $('.joycon.arrow.right').live("mouseleave mouseup", function () {
  //   val = 0;
  //   clearInterval(setint);
  //   keysPressed[39] = false;
  //   clearInterval(anim);
  //   keyPressed = false;
  // });

});

function showContent(id){
  // y = "#JS"
  //  $(y).css("display","block");

  contents = ["#HTML","#JS","#Java","#Python"];
  contents.map(x => x==id? $(x).css("display","block") : $(x).css("display","none"));
}

function openMenu(type){

}

//Handler for Filtering elements in the portfolio
function filterSelection(category){
  var classes = [".logo",".graphic",".video"];

  classes.map(x => (x==category || category==".all")?$(x).css("display","inline-block"):$(x).css("display","none"));

  classes.push(".all");
  classes.map(x => (x==category)?$(x+"Button").addClass("is-primary"):$(x+"Button").removeClass("is-primary"));
}



function openMinimap(){
  // Get the element
  var elem = document.querySelector('#map');

  // Create a copy of it
  var clone = elem.cloneNode(true);

  // Update the ID and add a class
  clone.id = 'minimap';

  // Inject it into the DOM
  elem.after(clone);

  clone.style.removeProperty('left');
  clone.style.removeProperty('top');
  clone.style.removeProperty('margin-left');
  clone.style.removeProperty('margin-top');
  eventOccurence = true;
}

$("#minimap").live('click', function () {
  $("#minimap").remove();
  if(!inSoccer && !inFishing){
    eventOccurence = false;
  }
});

// ----------------------
// Minimap Widget System
// ----------------------
var minimapWidgetVisible = false;
var minimapWidgetUpdateInterval = null;

function initMinimapWidget() {
  if (!inventory.minimap) {
    return; // Don't show if minimap hasn't been collected
  }

  // Clone the map for the minimap widget (simplified version)
  var $map = $("#map");
  var $widgetContent = $("#minimap-widget-content");
  
  // Clear existing content
  $widgetContent.empty();
  
  // Create a simplified map representation
  // We'll use a canvas or simplified div structure
  // For now, let's create a basic representation
  var mapWidth = 2000; // Approximate map width
  var mapHeight = 2000; // Approximate map height
  
  // Create a background representation
  var $bg = $('<div></div>').css({
    position: 'absolute',
    width: mapWidth + 'px',
    height: mapHeight + 'px',
    background: 'linear-gradient(135deg, #2d5016 0%, #1a3009 100%)',
    left: '0',
    top: '0'
  });
  
  $widgetContent.append($bg);
  
  // Start updating player position
  updateMinimapWidgetPlayer();
  if (minimapWidgetVisible) {
    startMinimapWidgetUpdates();
  }
}

function toggleMinimapWidget() {
  if (!inventory.minimap) {
    return;
  }

  minimapWidgetVisible = !minimapWidgetVisible;
  var $widget = $("#minimap-widget");
  
  if (minimapWidgetVisible) {
    $widget.addClass("active");
    initMinimapWidget();
    startMinimapWidgetUpdates();
  } else {
    $widget.removeClass("active");
    stopMinimapWidgetUpdates();
  }
}

function startMinimapWidgetUpdates() {
  if (minimapWidgetUpdateInterval) {
    clearInterval(minimapWidgetUpdateInterval);
  }
  minimapWidgetUpdateInterval = setInterval(function() {
    updateMinimapWidgetPlayer();
  }, 100); // Update 10 times per second
}

function stopMinimapWidgetUpdates() {
  if (minimapWidgetUpdateInterval) {
    clearInterval(minimapWidgetUpdateInterval);
    minimapWidgetUpdateInterval = null;
  }
}

function updateMinimapWidgetPlayer() {
  if (!minimapWidgetVisible || !inventory.minimap) {
    return;
  }

  var $player = $("#minimap-widget-player");
  var $dylan = $("#dylan");
  var $map = $("#map");
  
  // Get player position on screen
  var playerLeft = parseInt($dylan.css("left")) || 0;
  var playerTop = parseInt($dylan.css("top")) || 0;
  
  // Get map offset (how much the map has moved)
  var mapLeft = parseInt($map.css("margin-left")) || 0;
  var mapTop = parseInt($map.css("margin-top")) || 0;
  
  // Get map center position
  var mapCenterLeft = parseInt($map.css("left")) || 0;
  var mapCenterTop = parseInt($map.css("top")) || 0;
  
  // Calculate absolute position on the map
  // The map center is at (mapCenterLeft, mapCenterTop)
  // Player screen position is (playerLeft, playerTop)
  // Map offset is (mapLeft, mapTop)
  // So absolute map position is: center - offset + player screen position
  
  var absoluteMapLeft = mapCenterLeft - mapLeft + playerLeft;
  var absoluteMapTop = mapCenterTop - mapTop + playerTop;
  
  // Map dimensions (approximate - you may need to adjust these)
  var mapWidth = 2000;
  var mapHeight = 2000;
  
  // Widget dimensions
  var widgetWidth = 200;
  var widgetHeight = 200;
  var scale = 0.12;
  
  // Calculate position in minimap (0,0 is top-left of map)
  // Map center is at (mapWidth/2, mapHeight/2) in absolute coordinates
  var mapOriginLeft = mapCenterLeft - (mapWidth / 2);
  var mapOriginTop = mapCenterTop - (mapHeight / 2);
  
  // Player position relative to map origin
  var relativeLeft = absoluteMapLeft - mapOriginLeft;
  var relativeTop = absoluteMapTop - mapOriginTop;
  
  // Scale to minimap widget size
  var minimapLeft = relativeLeft * scale;
  var minimapTop = relativeTop * scale;
  
  // Clamp to widget bounds (with padding for player dot)
  minimapLeft = Math.max(6, Math.min(widgetWidth - 6, minimapLeft));
  minimapTop = Math.max(6, Math.min(widgetHeight - 6, minimapTop));
  
  $player.css({
    left: minimapLeft + 'px',
    top: minimapTop + 'px'
  });
}

///////////////////////
//Functions for Fishing
///////////////////////

var fish;

//Holds info for fish caught


var inFishing = false;
var isReelingIn = false;

function setMovementDisabled(flag) {
  if (window.playerController) {
    playerController.disableInput = !!flag;
    if (flag) {
      playerController.keysDown = {};
      playerController.inputState = { x: 0, y: 0 };
      if (
        playerController.gameWorld &&
        playerController.gameWorld.player &&
        typeof playerController.gameWorld.player.setVelocity === "function"
      ) {
        playerController.gameWorld.player.setVelocity({ x: 0, y: 0 });
      }
    }
  }
}

function goFishing(){
  $(".try-again").css("display","none");
  $("#rules-fishing").css("display","block");
  eventOccurence = true;
  // if(inFishing){
  //   $("#dylan").css("background-image", URL.getDylan()+"/dylan-front-1.png)");
  //   $(".fish-from-water").css({display: "none",marginLeft: 0, top: 1500});
  //   inFishing = false;
  //   eventOccurence = false;
  //   $(".bio").css("display","none");
  //   $("#fishing-game-screen").css("display","none");
  // }
  if(!inFishing && !isReelingIn && parseInt($("#dylan").css("top")) >= 1314){
    $("progress").css("display","none");
    $(".fish-from-water").css({display: "none",marginLeft: 0, top: 1500});
    $("#fishing-game-screen").css("display","none");
    inFishing = true;
    setMovementDisabled(true);
    // Move player to fishing position using player controller
    // Convert CSS position to world coordinates
    // CSS left: 976, top: 1514
    // World x = CSS left + sprite width/2 = 976 + 16 = 992
    // World y: CSS top = footY - sprite height, so footY = 1514 + 64 = 1578
    // World y = footY - collider height/2 = 1578 - 20 = 1558
    if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
      // Set position and velocity to zero
      gameWorld.player.setPosition({ x: 992, y: 1558 });
      if (typeof gameWorld.player.setVelocity === "function") {
        gameWorld.player.setVelocity({ x: 0, y: 0 });
      }
      gameWorld.syncToDom();
      // Force another sync after a brief delay to ensure position sticks
      setTimeout(function() {
        if (gameWorld && gameWorld.player && gameWorld.syncToDom) {
          gameWorld.player.setPosition({ x: 992, y: 1558 });
          if (typeof gameWorld.player.setVelocity === "function") {
            gameWorld.player.setVelocity({ x: 0, y: 0 });
          }
          gameWorld.syncToDom();
        }
      }, 10);
    } else {
      // Fallback to direct CSS if player controller not available
      $("#dylan").css({top: 1514, left: 976});
    }
    $("#map").css({marginTop: -3696});
    

    document.getElementById('dialog-rounded').showModal();
    
    $("#soccer-start-screen").css("display","none");
    $("#fishing-start-screen").css("display","block");
    $("#1_player_form").css("display","none");
    
    // Update button state based on fishing rod availability
    updateFishingRodButtonState();
  }
  else if(parseInt($("#dylan").css("top")) < 1412){
    $(".nes-balloon.from-left p").text("I need to be closer to the water to use this");
    $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
    setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1000)
  }
  $(".achievement").css("display","none");
}

function updateFishingRodButtonState(){
  var throwLineBtn = $("#throw-line-btn");
  var rodMessage = $("#fishing-rod-message");
  
  if(!inventory.fishingRod){
    throwLineBtn.prop("disabled", true);
    throwLineBtn.addClass("is-disabled");
    rodMessage.show();
  } else {
    throwLineBtn.prop("disabled", false);
    throwLineBtn.removeClass("is-disabled");
    rodMessage.hide();
  }
}

function addToCollection(fish){
  $(".fish."+fish.getName().toLowerCase()).css("background-image",fish.getImage());
  FISHREP.getCollection()[fish.getName().toLowerCase()] = true;
  setCookie(fish.getName().toLowerCase(),"Caught");
}

function endFishing(){
  $(".try-again").css("display","block");
}

function closeFishing(){
  $(".fish-from-water").css({display: "none",marginLeft: 0, top: 1500});
  inFishing = false;
  eventOccurence = false;
  setMovementDisabled(false);
  $("#dylan").css("background-image", URL.getDylan()+"/dylan-front-1.png)");
  $(".bio").css("display","none");
  $("#fishing-game-screen").css("display","none");
  
}

var reel_in_timer;

// Screen shake function for tree falling
function screenShake() {
  if (typeof gameWorld === "undefined" || !gameWorld) return;
  
  var shakeIntensity = 8;
  var shakeDuration = 400; // milliseconds
  var shakeInterval = 20; // milliseconds between shakes
  var shakeCount = shakeDuration / shakeInterval;
  var currentShake = 0;
  
  var shakeTimer = setInterval(function() {
    if (currentShake >= shakeCount) {
      // Reset shake offset
      if (gameWorld && gameWorld._shakeOffset) {
        gameWorld._shakeOffset.x = 0;
        gameWorld._shakeOffset.y = 0;
      }
      clearInterval(shakeTimer);
      return;
    }
    
    // Calculate shake intensity (decreases over time)
    var intensity = shakeIntensity * (1 - (currentShake / shakeCount));
    var offsetX = (Math.random() - 0.5) * intensity * 2;
    var offsetY = (Math.random() - 0.5) * intensity * 2;
    
    // Apply shake offset to game world
    if (gameWorld && gameWorld._shakeOffset) {
      gameWorld._shakeOffset.x = offsetX;
      gameWorld._shakeOffset.y = offsetY;
    }
    
    currentShake++;
  }, shakeInterval);
}


function throwLine(again){
  // Check if fishing rod is available
  if(!inventory.fishingRod){
    return; // Button should be disabled, but just in case
  }
  
  if(again = "again"){
    closeFishing();
  }
  eventOccurence = true;
  // Ensure movement is disabled and player is at fishing position
  setMovementDisabled(true);
  // Convert CSS position to world coordinates
  // CSS left: 976, top: 1514
  // World x = CSS left + sprite width/2 = 976 + 16 = 992
  // World y: CSS top = footY - sprite height, so footY = 1514 + 64 = 1578
  // World y = footY - collider height/2 = 1578 - 20 = 1558
  if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
    gameWorld.player.setPosition({ x: 992, y: 1558 });
    // Force immediate sync
    setTimeout(function() {
      if (gameWorld && gameWorld.syncToDom) {
        gameWorld.syncToDom();
      }
    }, 0);
  } else {
    $("#dylan").css({top: 1514, left: 976});
  }
  
  $(".try-again").css("display","none");
  $(".information").text("Searching...");
  $(".bio").css("display","none");
  $("#dylan").css("background-image", URL.getDylan()+"/fishing/dylan-fishing-1.png)");
  time = 2 + Math.random() * (5);
  document.getElementById("reel-progress").value = 0;

  $("#fishing-game-screen").css("display","block");
  setTimeout(putFishOnLine,Math.floor(time*1000));
  $(".achievement").css("display","none")
}

var rarity = [2,2,2,4,4,4,3,5,5,5];

function putFishOnLine(){
  eventOccurence = true;
  isReelingIn = true;
  // Ensure movement is disabled and player stays at fishing position
  setMovementDisabled(true);
  // Convert CSS position to world coordinates
  if (typeof gameWorld !== "undefined" && gameWorld && gameWorld.player && typeof gameWorld.player.setPosition === "function") {
    gameWorld.player.setPosition({ x: 992, y: 1558 });
    gameWorld.syncToDom();
  } else {
    $("#dylan").css({top: 1514, left: 976});
  }
  
  $(".information").text("REEL IT IN!!");
  var names = ["shark","whale","guinneafish","clownfish","blowfish","blobfish","turtle","surgeonfish","sunfish","bettafish"]
  
  var init = 0;
  var numCaught = Object.values(FISHREP.getCollection()).filter(x => x).length;
  var changeRarity = names.map(x => FISHREP.getCollection()[x]?0:numCaught);

  for(i = 0;i<rarity.length;++i){
    rarity[i] += changeRarity[i];
  }
 

  var randomArray = [];
  for(i=0;i<rarity.length;++i){
    for(j=0;j<rarity[i];++j){
      randomArray.push(names[i]);
    }
  }


  

  fish = randomArray[Math.floor(Math.random() * randomArray.length)];
  fish = FISHREP.getFish(fish);


  $(".fish-from-water").css("width",fish.getWidth());
  $(".fish-from-water").css("background-size",fish.getWidth());
  $(".fish-from-water").css("background-image",fish.getImage());
  $("progress").css("display","block");
  var fishingTimer = 2100;
  document.getElementById("progress-timer").value = 2000;
  document.getElementById("reel-progress").max = fish.getWeight();
  

  reel_in_timer = setInterval(function(){
    if(fishingTimer < 0){
      clearInterval(reel_in_timer);
      $(".information").text("Fish Got Away...");
      isReelingIn = false;
      // Keep movement disabled and maintain position
      setMovementDisabled(true);
      $("#dylan").css({top: 1514, left: 976});
      $("progress").css("display","none");
      setTimeout(endFishing,1000);
    }
    fishingTimer-=2;
    document.getElementById("progress-timer").value = fishingTimer;
  })
}

function openFishbook(){
  // Allow opening fishbook from anywhere (including global menu)
    $(".fishbook").css("display","flex");
    eventOccurence = true;
}

function closeFishbook(){
  $(".fishbook").css("display","none");
  eventOccurence = false;
}

function openTimelineModal(entry) {
  var $modal = $(".timeline-modal");
  var $content = $(".timeline-modal-content");
  
  if (!$modal.length) return;
  
  // Clear previous content
  $content.find(".timeline-entry-content").remove();
  
  // Build content
  var $entryContent = $('<div class="timeline-entry-content"></div>');
  
  if (entry.image) {
    var $img = $('<div class="timeline-entry-img"></div>');
    $img.css("background-image", "url(" + entry.image + ")");
    $entryContent.append($img);
  }
  
  $entryContent.append('<div class="timeline-entry-year">' + (entry.year || "") + '</div>');
  $entryContent.append('<div class="timeline-entry-title">' + (entry.title || "") + '</div>');
  $entryContent.append('<div class="timeline-entry-desc">' + (entry.description || "") + '</div>');
  
  // Insert content after close button
  $content.find(".timeline-modal-close").after($entryContent);
  
  // Show modal
  $modal.addClass("active");
  eventOccurence = true;
}

function closeTimelineModal() {
  $(".timeline-modal").removeClass("active");
  eventOccurence = false;
}

function displayFish(name){
  var fish = FISHREP.getFish(name);
  $(".fish-display").css({width: fish.getWidth()*2});

  if(FISHREP.getCollection()[name]){
    $(".fish-display").css("background-image",fish.getImage());
    $(".fish-name").text(fish.getName());
  }
  else{
    $(".fish-display").css("background-image",fish.getImageNotFound());
    $(".fish-name").text("Not Found Yet");
  }
  
}
///////////////////////
//Functions for Soccer Game
///////////////////////

var inSoccer = false;

function choosePlayers(){
  if(window.innerWidth <= 600){

  }
  else if(parseInt($("#dylan").css("left")) >= 1472 && parseInt($("#dylan").css("top")) <= 680){
    if(!eventOccurence){
      document.getElementById('dialog-rounded').showModal();
      $("#soccer-start-screen").css("display","block");
      $("#fishing-start-screen").css("display","none");
      // $("#1_player_form").css("display","none");
      resetGame();
      eventOccurence = true;
    }
  }
}

var ballMovement;
var score = 0;
var time = 30.00;
var highScore = 0; //High score for no cookies

function playSoccer(){
  time = 30.00;
  $("#dylan").css("display","none");
  $("#map").css({
    marginLeft: "-1620px",
    marginTop: "-1104px"
  });
  
  $("#scoreboard").css("display","block");
  $("#score").text("");
  var countdown_timer = 3.00;

  $("#timer").text("Game Starts in: "+countdown_timer.toFixed(0));

  //Counts down the game from 3, change countdown_timer to change start delay
  var countdown_timer_interval = setInterval(function(){
    countdown_timer-=1;
    $("#timer").text("Game Starts in: "+countdown_timer.toFixed(0));
    if(countdown_timer <= 0){
      clearInterval(countdown_timer_interval);
      gameMechanic();
      $("#score").text("Score: 0");
      score = 0;
      inSoccer = true;
    }
  },1000)

  

  function gameMechanic(){
    if(time > 0){
      var dir = "right";
      ballMovement = setInterval(function(){
        if(parseInt($(".soccer-ball").css("left")) == 1478){
          dir = "right";
        }
        if(parseInt($(".soccer-ball").css("left")) == 1576){
          dir = "left";
        }

        if(dir == "left"){
          $(".soccer-ball").css("left","-=2px");
        }

        else if(dir == "right"){
          $(".soccer-ball").css("left","+=2px");
        }
      },6)
    }

    var countdown = setInterval(function(){
      time-=.01;
      $("#timer").text("Time: "+time.toFixed(2));
      if(time <= 0){
        $("#timer").text("Times Up!");
        clearInterval(countdown);
        clearInterval(ballMovement);
        inSoccer = false;
        document.getElementById('dialog-rounded').showModal();
        $("#1_player_form").css("display","block");
        $("#num_player_form").css("display","none");
        $("#start_game_form").css("display","none");
        $("#scoreboard").css("display","none");
        setCookie("matchbox",true);
        if(score > (getCookie("soccer-high-score") == ''?0:getCookie("soccer-high-score")) || score > highScore){
          setCookie("soccer-high-score",score);
          highScore = score;
          $(".achievement").css("display","block").fadeIn();
          $(".achievement-name").text('Soccer Star');
          $(".achievement-description").text('Get a new High Score on Soccer Shootout');
          setTimeout(function(){
            $(".achievement").fadeOut().css("display","block");
          },3000);
        }
        $("#highscore").text("Personal Best: "+highScore);
        $("#score_on_scoreboard").text("Score: "+score);
      }
    },10)
  }
}

function moveBall(direction){
  if(parseInt($(".soccer-ball").css("top")) == 410 && inSoccer == true){
    clearInterval(ballMovement);
      var moveUp = setInterval(function(){
        $(".soccer-ball").css("top","-=2px");
        if(parseInt($(".soccer-ball").css("top")) == 304){
          clearInterval(moveUp);
          if(parseInt($(".soccer-ball").css("left")) >= 1522 && parseInt($(".soccer-ball").css("left")) <= 1538)
            $("#score").text("Score: " + (score=score+1));
          resetBall();
        }
      },10)
  }    

  function resetBall(){
    $(".soccer-ball").css("left","1478px");
    $(".soccer-ball").css("top","410px");

    if(time > 0){
      ballMovement = setInterval(function(){
        if(parseInt($(".soccer-ball").css("left")) == 1478){
          dir = "right";
        }
        if(parseInt($(".soccer-ball").css("left")) == 1576){
          dir = "left";
        }

        if(dir == "left"){
          $(".soccer-ball").css("left","-=2px");
        }

        else if(dir == "right"){
          $(".soccer-ball").css("left","+=2px");
        }
     },6)  
    }
    else{
      $(".soccer-ball").css("left","1528px");
    }
  }
}

function resetGame(){
  $(".soccer-goal").css("z-index", "48");
  $(".soccer-ball").css("z-index", "51");
  score = 0;
  time = 30.00;
  setTimeout(function(){
    $("#1_player_form").css("display","none");
    $("#start_game_form").css("display","block");
    $("#scoreboard").css("display","none");
  },1)
}

function endSoccerGame(){
  eventOccurence = false;
  $("#soccer-start-screen").css("display","none");
  $("#dylan").css({
    display: "block",
    left: 1520+"px",
    top: 540+"px"
  });
  $("#map").css({
    marginLeft: "-1620px",
    marginTop: "-996px"
  });

  $(".soccer-ball").css("left","1528px");
}


///////////////////////
//COLLISION
///////////////////////


//Calculates the new value of the key pressed
//Collision Handler for main map
function calculateNewValue(oldValue, keyCode1, keyCode2, elem) {
  // Use collision engine only
  if (typeof CollisionEngine !== "undefined" && typeof COLLISION_CONFIG !== "undefined" && COLLISION_CONFIG.mainMap) {
    return CollisionEngine.checkCollisions(COLLISION_CONFIG.mainMap, elem, keyCode1, keyCode2, oldValue);
  }
  
  // Fallback if engine/config not available (shouldn't happen, but safety net)
  console.warn("Collision engine not available, using basic fallback");
  var ks = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keysPressed : (typeof keysPressed !== "undefined" ? keysPressed : {});
  var dist = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.distancePerIteration : (typeof distancePerIteration !== "undefined" ? distancePerIteration : 4);
  var newValue = parseInt(oldValue, 10)
    - (ks[keyCode1] ? dist : 0)
    + (ks[keyCode2] ? dist : 0);
  return newValue;
}

//Collision Handler for Tent1
function calculateNewValueTent1(oldValue, keyCode1, keyCode2, elem) {
  // Use collision engine only
  if (typeof CollisionEngine !== "undefined" && typeof COLLISION_CONFIG !== "undefined" && COLLISION_CONFIG.tent1) {
    return CollisionEngine.checkCollisions(COLLISION_CONFIG.tent1, elem, keyCode1, keyCode2, oldValue);
  }
  
  // Fallback if engine/config not available (shouldn't happen, but safety net)
  console.warn("Collision engine not available, using basic fallback");
  var ks = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keysPressed : (typeof keysPressed !== "undefined" ? keysPressed : {});
  var dist = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.distancePerIteration : (typeof distancePerIteration !== "undefined" ? distancePerIteration : 4);
  var newValue = parseInt(oldValue, 10)
    - (ks[keyCode1] ? dist : 0)
    + (ks[keyCode2] ? dist : 0);
  return newValue;
}
//Collision Handler for Tent1
function calculateNewValueTent1(oldValue, keyCode1, keyCode2, elem) {
  // Use collision engine only
  if (typeof CollisionEngine !== "undefined" && typeof COLLISION_CONFIG !== "undefined" && COLLISION_CONFIG.tent1) {
    return CollisionEngine.checkCollisions(COLLISION_CONFIG.tent1, elem, keyCode1, keyCode2, oldValue);
  }
  
  // Fallback if engine/config not available (shouldn't happen, but safety net)
  console.warn("Collision engine not available, using basic fallback");
  var ks = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.keysPressed : (typeof keysPressed !== "undefined" ? keysPressed : {});
  var dist = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.distancePerIteration : (typeof distancePerIteration !== "undefined" ? distancePerIteration : 4);
  var newValue = parseInt(oldValue, 10)
    - (ks[keyCode1] ? dist : 0)
    + (ks[keyCode2] ? dist : 0);
  return newValue;
}
