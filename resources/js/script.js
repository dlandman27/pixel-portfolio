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

  if(window.innerWidth <= 600 && inventory.backpack){
    $("#backpack-icon").css("visibility","hidden");
    $(".inventory-slot").css("display","none");
  }
  else if(window.innerWidth > 600 && inventory.backpack) {
    $("#backpack-icon").css("visibility","visible");
    $(".inventory-slot").css("display","block");
  }
});

// Global UI: center camera button in main HUD
$(function () {
  $("#center-camera-btn").click(function () {
    if (
      window.playerController &&
      window.playerController.gameWorld &&
      typeof window.playerController.gameWorld.centerCameraOnPlayer ===
        "function"
    ) {
      window.playerController.gameWorld.centerCameraOnPlayer();
    }
  });
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
  if(parseInt($("#dylan").css("top")) >= 712 && parseInt($("#dylan").css("top")) <= 868 && parseInt($("#dylan").css("left")) >= 860 && parseInt($("#dylan").css("top")) <= 1124){
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
        var i = 0;
        fireInterval = setInterval(function () {
          ++i;
          if (i > 3) {
            i = 0
          }
          fire.css('background-image', url + fireArr[i] + ")");
        }, 100);
        if(!fireEnabled){
          $(".achievement").css({display:"block",backgroundColor: "#c99200"}).fadeIn();
          $(".achievement-name").text('Light It Up!');
          $(".achievement-description").text('Turn on the Fireplace');
          setTimeout(function(){
            $(".achievement").fadeOut().css("display","block");
          },3000);
        }
      }
      else {
        fireEnabled = true;
        // x.pause();
        fireOn = false;
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
  if(code == keySpace && !keysPressed[code]){
    document.getElementById("reel-progress").value += 1;
    if(document.getElementById("reel-progress").value == document.getElementById("reel-progress").max){
      clearInterval(reel_in_timer);
      $(".fish-from-water").css("display","block");
      $("progress").css("display","none");
      $(".fish-from-water").animate({
        top: 1438,
        marginLeft: "-="+(parseInt($(".fish-from-water").css("width"))/4)
      });
      isReelingIn = false;
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
    else{
      $("#dylan").css("background-image", URL.getDylan() + "/fishing/dylan-fishing-2.png)");
    }
    
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
  
  
  //if an event is occuring
  var animRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.anim : anim;
  if (onLog || eventOccurence || sitting) {
    clearInterval(animRef);
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
      $("#dylan").css({
        left: 260+"px",
        top: 464+"px"
      });
      $("#map").css({
        marginLeft: 2208+"px",
        marginTop: -816+"px"
      })
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

function sitOnLog(location) {
  if (location == 'top') {
    if(parseInt($("#dylan").css("left")) > 928 && parseInt($("#dylan").css("left")) < 1040 && parseInt($("#dylan").css("top")) <= 780 && parseInt($("#dylan").css("top")) >= 664) {
      if (!onLog) {
        
        initY = parseInt($("#map").css("margin-top"));
        initX = parseInt($("#map").css("margin-left"));

        $("#map").animate({
          marginTop: -1812 + "px",
          marginLeft: "-12px"
        })
        $(".bench").css("z-index", "10");
        var url = URL.getDylan();
        $("#dylan").css({
          top: "712px"
        })
        $("#dylan").css("background-image", url + "/dylan-front-1.png)");

        sitting = true;
        onLog = true;
        onLogTop = true;
      }
      else if (onLogTop) {
        onLog = false;
        sitting = false;
  
        $("#dylan").css({
          top: "740px"
        })
        $("#dylan").css("background-image", url + "/dylan-front-1.png)");
        $("#map").animate({
          marginTop: -1644 + "px",
          marginLeft: initX
        });
        onLogTop = false;
      }
    }    
  }
  else if (location == "bottom") {
    if(parseInt($("#dylan").css("left")) > 928 && parseInt($("#dylan").css("left")) < 1040 && parseInt($("#dylan").css("top")) >= 824 && parseInt($("#dylan").css("top")) <= 940) {
      if(!onLog){

        initY = parseInt($("#map").css("margin-top"));
        initX = parseInt($("#map").css("margin-left"));

        $("#map").animate({
          marginTop: -1812 + "px",
          marginLeft: "-12px"
        })
        $(".bench").css("z-index", "100");
        var url = URL.getDylan();
        $("#dylan").css({
          top: "868px"
        })
        $("#dylan").css("background-image", url + "/dylan-back-1.png)");

        sitting = true;
        onLog = true;
        onLogBottom = true;
      }  
      else if (onLogBottom) {
        var url = URL.getDylan();
        onLog = false;
        sitting = false;
        $(".bench").css("z-index", "100");

        $("#dylan").css({
          top: "860px"
        })
        $("#map").animate({
          marginTop: -1968 + "px",
          marginLeft: initX
        });
        $("#dylan").css("background-image", url + "/dylan-back-1.png)");

        onLogBottom = false;
      }
    }
  }

  else if (location == "left" && window.innerWidth > 600) {
    if (parseInt($("#dylan").css("top")) >= 740 && parseInt($("#dylan").css("top")) <= 868 && parseInt($("#dylan").css("left")) >= 788 && parseInt($("#dylan").css("left")) <= 938) {
      if (!onLog) {

        $("#map").animate({
          marginTop: -1812 + "px",
          marginLeft: "-12px"
        })


        $("#dylan").css({
          top: "800px",
          left: "872px"
        })

        $("#dylan").css("background-image", URL.getDylan()+"/dylan-right-1.png)");

        $(".tree-stump").css("z-index", "10");

        sitting = true;
        onLog = true;
        onLogLeft = true;
      }
      else if (onLogLeft) {

        onLog = false;
        sitting = false;
        $("#dylan").css({
          top: "812px",
          left: "908px"
        })
        $("#map").animate({
          marginTop: -1812 + "px",
          marginLeft: "204px"
        });
        $("#dylan").css("background-image", URL.getDylan()+"/dylan-right-1.png)")

        onLogLeft = false;
      }
    }
  }

  else if (location == "right" && window.innerWidth > 600) {
    if (parseInt($("#dylan").css("top")) >= 740 && parseInt($("#dylan").css("top")) <= 868 && parseInt($("#dylan").css("left")) >= 1032 && parseInt($("#dylan").css("left")) <= 1176) {
      if (!onLog) {

        $("#map").animate({
          marginTop: -1812 + "px",
          marginLeft: "-12px"
        })


        $("#dylan").css({
          top: "800px",
          left: "1100px"
        })

        $("#dylan").css("background-image", URL.getDylan()+"/dylan-left-1.png)");

        $(".tree-stump").css("z-index", "10");

        sitting = true;
        onLog = true;
        onLogRight = true;
      }

      else if (onLogRight) {

        onLog = false;
        sitting = false;

        $("#dylan").css({
          top: "812px",
          left: "1060px"
        })
        $("#map").animate({
          marginTop: -1812 + "px",
          marginLeft: "-228px"
        });
        $("#dylan").css("background-image", URL.getDylan()+"/dylan-left-1.png)")

        onLogRight = false;
      }
    }
  }
}

function openTent1(side){
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

function leaveTent1(dir){
  $('#dylan').remove();
  // Remove tooltip class to prevent visibility issues - tooltip is only needed for speech bubbles
  $('#map').append("<div id='dylan'> <img class='animation'/><div class='nes-balloon from-left'><p>HELLO WORLD</p></div></div>");
  $("#dylan").css("z-index","9999").css("display","block").css("visibility","visible");
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
  $("#dylan").css("z-index","49");
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
    
    // Clear any existing movement
    var animRef = (typeof WORLD !== "undefined" && WORLD.movement) ? WORLD.movement.anim : anim;
    clearInterval(animRef);
    if (typeof WORLD !== "undefined" && WORLD.movement) {
      WORLD.movement.anim = null;
      WORLD.movement.keyPressed = false;
    } else {
      keyPressed = false;
    }
    
    // Set the key as pressed in both keysPressed objects
    keysPressed[direction] = true;
    keysPressed[37] = false;
    keysPressed[38] = false;
    keysPressed[39] = false;
    keysPressed[40] = false;
    keysPressed[direction] = true;
    
    // Also update WORLD.movement.keysPressed if it exists
    if (typeof WORLD !== "undefined" && WORLD.movement && WORLD.movement.keysPressed) {
      WORLD.movement.keysPressed[direction] = true;
      WORLD.movement.keysPressed[37] = false;
      WORLD.movement.keysPressed[38] = false;
      WORLD.movement.keysPressed[39] = false;
      WORLD.movement.keysPressed[40] = false;
      WORLD.movement.keysPressed[direction] = true;
    }
    
    // Call move immediately to turn character and start movement
    move(direction);
  }

  function stopMovement() {
    // Clear the animation interval
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

  // Up button
  $('.mobile-btn-up').live('touchstart', function(e) {
    e.preventDefault();
    startMovement(38);
  });
  $('.mobile-btn-up').live('touchend touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-up').live('mousedown', function(e) {
    e.preventDefault();
    startMovement(38);
  });
  $('.mobile-btn-up').live('mouseup mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Down button
  $('.mobile-btn-down').live('touchstart', function(e) {
    e.preventDefault();
    startMovement(40);
  });
  $('.mobile-btn-down').live('touchend touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-down').live('mousedown', function(e) {
    e.preventDefault();
    startMovement(40);
  });
  $('.mobile-btn-down').live('mouseup mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Left button
  $('.mobile-btn-left').live('touchstart', function(e) {
    e.preventDefault();
    startMovement(37);
  });
  $('.mobile-btn-left').live('touchend touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-left').live('mousedown', function(e) {
    e.preventDefault();
    startMovement(37);
  });
  $('.mobile-btn-left').live('mouseup mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Right button
  $('.mobile-btn-right').live('touchstart', function(e) {
    e.preventDefault();
    startMovement(39);
  });
  $('.mobile-btn-right').live('touchend touchcancel', function(e) {
    e.preventDefault();
    stopMovement();
  });
  $('.mobile-btn-right').live('mousedown', function(e) {
    e.preventDefault();
    startMovement(39);
  });
  $('.mobile-btn-right').live('mouseup mouseleave', function(e) {
    e.preventDefault();
    stopMovement();
  });

  // Logo Gallery Click Handlers
  $('.logo-item').live('click', function(e) {
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

$("#minimap").live('click',function () {
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
  if(!inFishing && !isReelingIn && parseInt($("#dylan").css("top")) >= 1314 && inventory.fishingRod){
    $("progress").css("display","none");
    $(".fish-from-water").css({display: "none",marginLeft: 0, top: 1500});
    $("#fishing-game-screen").css("display","none");
    inFishing = true;
    $("#dylan").css({top: 1440, left: 984});
    $("#map").css({marginTop: -3696});
    

    document.getElementById('dialog-rounded').showModal();
    
    $("#soccer-start-screen").css("display","none");
    $("#fishing-start-screen").css("display","block");
    $("#1_player_form").css("display","none");
  }
  else if(parseInt($("#dylan").css("top")) < 1412 &&  inventory.fishingRod){
    $(".nes-balloon.from-left p").text("I need to be closer to the water to use this");
    $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
    setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1000)
  }
  $(".achievement").css("display","none");
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
  $("#dylan").css("background-image", URL.getDylan()+"/dylan-front-1.png)");
  $(".bio").css("display","none");
  $("#fishing-game-screen").css("display","none");
  
}

var reel_in_timer;


function throwLine(again){
  if(again = "again"){
    closeFishing();
  }
  eventOccurence = true;
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
