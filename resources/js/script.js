//Author Dylan Landman
//INVENTORY:


//COOKIES
function setCookie(cname,cvalue) {
  document.cookie = cname + "=" + cvalue + ";" + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  setCookie("title-screen",true);
}

//Removes content if found in cookies
function setVariables(){
  //console.log(document.cookie);
  if(getCookie("backpack") != ""){
    inventory.backpack = true;
    $("#backpack").css("opacity", "0");
    if(window.innerWidth > 600)
      $("#backpack-icon").css("visibility", "visible");
  }
  if(getCookie("axe") != ""){
    inventory.axe = true;
    $("#stump").css("background-image", URL.getNature()+"/stump-without-axe.png)");
    $(".inventory-slot.axe").css("background-image", URL.getMisc()+"/axe-icon-found.png)");
  }
  if(getCookie("matchbox") != ""){
    inventory.matchbox = true;
    $(".matchbox").css("display", "none");
    $(".inventory-slot.matches").css("background-image", URL.getMisc()+"/matchbox-icon-found.png)");
  }
  if(getCookie("resume") != ""){
    inventory.resume = true;
    $(".paper").css("display", "none");
    $(".inventory-slot.resume").css("background-image", URL.getMisc()+"/resume-icon-found.png)");
  }

  if(getCookie("minimap") != ""){
    inventory.minimap = true;
    $(".scroll").css("display", "none");
    $(".minimap-icon").css("display", "block");
  }

  if(getCookie("fishing-rod") != ""){
    inventory.fishingRod = true;
    $(".fishing-rod").css("display", "none");
    $(".inventory-slot.fishingRod").css("background-image", URL.getMisc()+"/fishing-rod-found.png)");
  }

  if(getCookie("tree-fallen") != ""){
    hitCount = 8;
    $("#falling-tree").css("background-image", URL.getFallingTree() + "/falling-tree-" + 7 + ".png)");
    $("#wood-log").css("visibility","visible");
    $("#wood-log").css({top: 320 + "px", left: 252 + "px"});
    if(getCookie("wood")){
      inventory.wood = true;
      $("#wood-log").css("display", "none");
      $(".inventory-slot.wood").css("background-image",URL.getMisc()+"/wood-icon-found.png)");
    }
  }

  if(getCookie("fishbook") != ""){
    inventory.fishbook = true;
    $(".book-item").css("display", "none");
    $(".inventory-slot.book").css("background-image", URL.getMisc()+"/fishbook-icon-found.png)");
  }

  var names = ["shark","whale","guinneafish","clownfish","blowfish","blobfish","turtle","surgeonfish","sunfish","bettafish"]
  
   names.map(x => getCookie(x) != ''?enableFish(x):0)
  function enableFish(x){
    $(".fish."+x).css("background-image", FISHREP.getFish(x).getImage());
    FISHREP.collection[x] = true
  }
}

//Stores values for inventory
let inventory = {
  axe: false,
  wood: false,
  minimap: false,
  backpack: false,
  matchbox: false,
  resume: false,
  fishingRod: false,
  fishbook: false
};

class Fish{
  constructor(name,image,weight,width,bio,imageNotFound) {
    this.name = name; //NAME OF THE FISH TYPE
    this.image = image; //URL OF THE FISH
    this.weight = weight; //USED FOR GETTING FISH OUT OF WATER
    this.width = width; //USED FOR POSITIONING FISH OVER THE CHARACTER
    this.bio = bio; //USED FOR POSITIONING FISH OVER THE CHARACTER
    this.imageNotFound = imageNotFound; //USED FOR POSITIONING FISH OVER THE CHARACTER
  }
  getName = () => this.name;
  getImage = () => this.image;
  getWeight = () => this.weight;
  getWidth = () => this.width;
  getBio = () => this.bio;
  getImageNotFound = () => this.imageNotFound;
}

class FishBook{
  constructor(){
    this.fishbook = {}
    this.collection = {
      shark: false,
      clownfish: false,
      guinneafish: false,
      blobfish: false,
      whale: false,
      turtle: false,
      blowfish: false,
      surgeonfish: false,
      bettafish: false,
      sunfish: false
    }
  } 
  getShark = () => new Fish("Shark",URL.getFishing()+"/shark.png)", 26, 100, "This is'nt no good white shark",URL.getFishing()+"/shark-not-found.png)");
  getBettaFish = () => new Fish("Bettafish",URL.getFishing()+"/betta-fish.png)", 18, 24,  "He's still a testing fish",URL.getFishing()+"/bettafish-not-found.png)");
  getBlobFish = () => new Fish("Blobfish",URL.getFishing()+"/blob-fish.png)", 20, 32, "The cutest fish in the sea",URL.getFishing()+"/blob-fish-not-found.png)");
  getBlowFish = () => new Fish("Blowfish",URL.getFishing()+"/blow-fish.png)", 18, 40, "Someone is looking bloated...",URL.getFishing()+"/blowfish-not-found.png)");
  getWhale = () => new Fish("Whale",URL.getFishing()+"/blue-whale.png)", 26, 128, "I must have a strong fishing line...",URL.getFishing()+"/blue-whale-not-found.png)");
  getClownFish = () => new Fish("Clownfish",URL.getFishing()+"/clown-fish.png)", 12, 24, "This is a funny one",URL.getFishing()+"/clownfish-not-found.png)");
  getGuinneaFish = () => new Fish("Guinneafish",URL.getFishing()+"/guinnea-fish.png)", 18, 32, "Straight from the lab",URL.getFishing()+"/guinneafish-not-found.png)");
  getSunFish = () => new Fish("Sunfish",URL.getFishing()+"/sunfish.png)", 14, 24, "Thankfully it's daytime",URL.getFishing()+"/sun-fish-not-found.png)");
  getSurgeonFish = () => new Fish("Surgeonfish",URL.getFishing()+"/surgeonfish.png)", 16, 24, "That one took guts",URL.getFishing()+"/surgeonfish-not-found.png)");
  getTurtle = () => new Fish("Turtle",URL.getFishing()+"/turtle.png)", 22, 48, "Quick! Take a Shellfie!",URL.getFishing()+"/turtle-not-found.png)");
  getCollection = () => this.collection;
  getFish = (fish) => 
    fish == "shark"?this.getShark():
    fish == "whale"?this.getWhale():
    fish == "guinneafish"?this.getGuinneaFish():
    fish == "clownfish"?this.getClownFish():
    fish == "blowfish"?this.getBlowFish():
    fish == "blobfish"?this.getBlobFish():
    fish == "turtle"?this.getTurtle():
    fish == "surgeonfish"?this.getSurgeonFish():
    fish == "sunfish"?this.getSunFish():
    fish == "bettafish"?this.getBettaFish():-1;
  
}

var FISHREP = new FishBook();

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

  setTimeout(function(){ 
    //if()
    $("#map").css({
    left: (1.2*(window.innerWidth/2)), 
    top: (700+(window.innerHeight/2))
  });},2400);//CHANGE IN ZOOM MUST CHANGE VALUE (CURR 1.2)(VALUE = 1+(1-ZOOMLEVEL))
  //Starts the game
  setTimeout(startGame, 2800);

  //Function to handle weather
  dayCycle();
});

$(window).resize(function () {
  $("#map").css({
    left: (1.2*(window.innerWidth/2)), 
    top: (700+(window.innerHeight/2))
  });

  if(window.innerWidth <= 600 && inventory.backpack){
    $("#backpack-icon").css("visibility","hidden");
    $(".inventory-slot").css("display","none");
  }
  else if(window.innerWidth > 600 && inventory.backpack) {
    $("#backpack-icon").css("visibility","visible");
    $(".inventory-slot").css("display","block");
  }
});


var x = 0;


//Function called when the map is finished rendering
function startGame() { 

  document.title="Dylan Landman";

  var url = 'url(resources/images/characters/dylan';
  var frame = 12;
  var top = 112;
  var speech;
  var start = setInterval(function () {
    if (top == 204) {//reached top location
      $("#dylan").css("background-image", url + "/dylan-front-" + 1 + ".png)");
      clearInterval(start);

      if(getCookie("title-screen") != 'true'){
        openTutorial();
        document.getElementById('dialog-default').showModal();
      }
      else{
        eventOccurence = false;
      }
    }
    frame++;
    $("#dylan").css("visibility", "visible");
    top += 4;
    if (frame > 7) {
      frame = 2;
    }
    $("#dylan").css("background-image", url + "/dylan-front-" + frame + ".png)");
    $("#dylan").css("top", top + "px");

  }, 100);


  //if tree has already been cut down
  if(getCookie("tree-fallen")=="true"){
    $("#falling-tree").css("width","256px");
  }
}

function openTutorial(){
  eventOccurence = true;
  $(".tutorial").css("display", "block");
}
function closeTutorial(){
  eventOccurence = false;
  $(".tutorial").css("display", "none");
}

//River Animation
$(function () {
  var x = 0;
  setInterval(function () {
    x += 1;
    $('#wrapper').css('background-position', x + 'px 0');

    $('.water.water_funnel').css('background-position', -x + 'px 0');
    $('.pool.top').css('background-position', -.5*x + 'px 0');
    $('.pool.middle').css('background-position', '0 '+ .5*x + 'px');
    $('.pool.verticalFunnel').css('background-position', '0 '+ .5*x + 'px');
    $('.water.waterfall1').css('background-position', -2*x + 'px 0');
    $('.pool.verticalFunnel2').css('background-position', '0 '+ 2*x + 'px');
    $('.pool.verticalFunnel3').css('background-position', '0 '+ 2*x + 'px');
    $('.pool.verticalFunnel4').css('background-position', '0 '+ 2*x + 'px');
  }, 75)

  // var y = 0;
  // var i = 0;
  // setInterval(function () {
  //   y += Math.sin(i);
  //   i += 0.05;

  //   if (i > 2 * Math.PI) {
  //     i = 0;
  //   }

  //   if (i > Math.PI / 2 + 1.3) {
  //     // $('#ocean-anim').css('opacity', 100 - (20*(i-Math.PI/2 - 1.3)) + '%');
  //     $("#water-on-shore").css('opacity', 100 - (20 * (i - Math.PI / 2 - 1.3)) + '%');
  //   }
  //   else {
  //     // $('#ocean-anim').css('opacity', 100 + '%');;
  //     // $("#water-on-shore").css('opacity', 0 + '%');
  //   }

  //   $('#ocean-anim').css('margin-top', -1.5 * y + 'px');
  //   $('#ocean').css('background-position', '0 ' + -0.2 * y + 'px')
  // }, 75);


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

//Keeps the interval for the animation
var anim;

//Used to determine which frame the animation is on
var frame = 1;

//determines if a key is pressed
var keyPressed = false;

//ASCII of Keys for animation and movement
var keyLeft = 37;
var keyUp = 38
var keyRight = 39
var keyDown = 40;
var keyW = 87;
var keyA = 65;
var keyS = 83;
var keyD = 68;
var keyEnter = 13;
var keySpace = 32;
//Variables for Movement
var dylan = $("#dylan"),
  // maxValue = pane.width() - box.width(), //replace with collision function
  keysPressed = {},
  distancePerIteration = 4;



var doorOpen = false;


//Keydown
$(document).keydown(function(e){
  if(isReelingIn){
    reelIn(e.keyCode);
  }
  keysPressed[e.which] = true;
  move(e.keyCode);  
  // useItem(e.keyCode);
  
  if(playSoccer && e.keyCode == keyEnter)
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
  if (onLog || eventOccurence || sitting) {
    clearInterval(anim);
    return;
  }
  else {
    $(".tooltiptext").css("opacity", 0);
  }

  
  
  
  var url = URL.getDylan();

  //Tells the computer what the last key pressed was from up down left right
  var key = "";
  var personMoving = true;

  if (!keyPressed) {
    keyPressed = true;
    anim = setInterval(function () {

      //Frame Animation
      frame++;

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
      else if (keyCode == keyLeft || keyCode == keyA) {

        // if(SFXOn){
        //   walking.play();
        // }
        if(key != "left")
          frame = 1;
        if (frame > 7)
          frame = 2;
        key = "left";
        $("#dylan").css("background-image", url + "/dylan-left-" + frame + ".png)");
      }
      else if (keyCode == keyUp || keyCode == keyW) {
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
        
        if(key != "up")
          frame = 1;
        if (frame > 7)
          frame = 2;
        key = "up";

        $("#dylan").css("background-image", url + "/dylan-back-" + frame + ".png)");

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
      else if (keyCode == keyDown || keyCode == keyS) {
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
        if(key != "down")
          frame = 1;
        if (frame > 7)
          frame = 2;
        key = "down";

        $("#dylan").css("background-image", url + "/dylan-front-" + frame + ".png)");

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
      else if (keyCode == keyRight || keyCode == keyD) {

        // if(SFXOn){
        //   // walking.play();
        // }
        if(key != "right")
          frame = 1;
        if (frame > 7)
          frame = 2;
        key = "right";
        $("#dylan").css("background-image", url + "/dylan-right-" + frame + ".png)");
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
    }, 50)//5 fast //50 normal
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
  if(isReelingIn && keysPressed[keySpace]){
    $("#dylan").css("background-image", URL.getDylan() + "/fishing/dylan-fishing-1.png)");
  }
  clearInterval(anim);
  keyPressed = false;
  keysPressed[e.which] = false;
})



var openBag = false;

function openInventory() {
  var backpackURL = URL.getMisc();
  if (!openBag) {

    $("#backpack-icon").css("opacity", "1");

    $(".inventory-slot").css("visibility", "visible");
    $("#backpack-icon").css("background-image", backpackURL + "/x-icon.png)");
    openBag = true;
    $(".inventory-slot.axe").animate({ "marginTop": "-144px" });
    $(".inventory-slot.wood").animate({ "marginTop": "-288px" });
    $(".inventory-slot.matches").animate({ "marginLeft": "-288px" });
    $(".inventory-slot.resume").animate({ "marginLeft": "-144px","marginTop": "-144px" });
    $(".inventory-slot.fishingRod").animate({ "marginLeft": "-144px","marginTop": "-288px" });
    $(".inventory-slot.book").animate({"marginLeft": "-144px"});
  }
  else {
    $("#backpack-icon").css("background-image", backpackURL + "/backpack-icon.png)")
    openBag = false;
    $(".inventory-slot").animate({ "marginTop": "0px", "marginLeft": "0px" });
  }
  inventory.backpack = true;
}

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
function dayCycle() {

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
  $('#tent1').append("<div id='dylan' class='tooltip'> <img class='animation'/><div class='nes-balloon from-left'><p>HELLO WORLD</p></div></div>");

  tentOpen = true;

  $("#dylan").css("z-index","9999").css("display","block");
  $(".cover-screen.tent1").show();

  if(side == "front"){
    $("#dylan").css({
      left: "192px",
      top: "152px",
      visibility: "visible",
      backgroundImage: "url(resources/images/characters/dylan/dylan-front-1.png)"
    }).hide().fadeIn();

    $("#map").css({
      marginLeft: 0,
      marginTop: "-1824px"
    });
  }
  else{
    $("#dylan").css({
      left: "156px",
      top: "-36px",
      visibility: "visible",
      backgroundImage: "url(resources/images/characters/dylan/dylan-front-1.png)"
    }).hide().fadeIn();

    $("#map").css({
      marginLeft: 108+"px",
      marginTop: "-1260px"
    });
  }
  
 
}

function leaveTent1(dir){
  $('#dylan').remove();
  $('#map').append("<div id='dylan' class='tooltip'> <img class='animation'/><div class='nes-balloon from-left'><p>HELLO WORLD</p></div></div>");
  $("#dylan").css("z-index","9999").css("display","block");
  tentOpen = false;
  
  if(dir == 1){
    $("#dylan").css({
      left: "292px",
      top: "648px",
      visibility: "visible",
      backgroundImage: "url(resources/images/characters/dylan/dylan-front-1.png)"
    });
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
      visibility: "visible",
      backgroundImage: "url(resources/images/characters/dylan/dylan-front-1.png)"
    });
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
  $(".joycon").css("display","none");
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
      visibility: "visible",
      backgroundImage: "url(resources/images/characters/dylan/dylan-back-1.png)"
    });
    $("#map").css({
      // marginLeft: "2160px",
      marginTop: "-1356px"

    });
  }
  else if(sitting){
    sitting = false;
    $("#dylan").css({
      top: "-8px",
      visibility: "visible",
      backgroundImage: "url(resources/images/characters/dylan/dylan-front-1.png)"
    });
    $("#map").css({
      // marginLeft: "2160px",
      marginTop: "-1360px"

    });
  }
  
}

function openPortfolio(){
  if(parseInt($("#dylan").css("top")) <= 552 && parseInt($("#dylan").css("left")) >= 1472){
    $(".portfolio-container").css("display","block");
    eventOccurence = true;
    $(".minimap-icon").css("display","none");
    $(".joycon").css("display","none");
  }
}

function closePortfolio(){
  $(".portfolio-container").css("display","none");
  eventOccurence = false;
  if(inventory.minimap)
    $(".minimap-icon").css("display","block");
  if(window.innerWidth <= 600)
    $(".joycon").css("display","block");
}

function turnOffTV(){
  $(".socialMedia-icon").css("display","block");
  $(".scrollmenu").css("display","none");
  $(".tv-container").css("display","none");
  if(inventory.minimap)
    $(".minimap-icon").css("display","block");
  if(window.innerWidth <= 600)
    $(".joycon").css("display","block");
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

  $('.joycon.arrow.up').live('click',function (e) {
    clearInterval(setint);
    if(!keyPressed){
      setint = setInterval(function () {
        keysPressed[38] = true;
        keysPressed[37] = false;
        keysPressed[39] = false;
        keysPressed[40] = false;
        move(38);     
      },1);
    }
    
  });

  $('.joycon.arrow.down').live('click',function (e) {
    clearInterval(setint);
    if(!keyPressed){
      setint = setInterval(function () {
        keysPressed[40] = true;
        keysPressed[37] = false;
        keysPressed[39] = false;
        keysPressed[38] = false;
        move(40);
      },1);
    }
  });

  $('.joycon.arrow.left').live('click',function (e) {
    clearInterval(setint);
    if(!keyPressed){
      setint = setInterval(function () {
        keysPressed[37] = true;
        keysPressed[38] = false;
        keysPressed[39] = false;
        keysPressed[40] = false;
        move(37);
      },1);
    }
    
  });

  $('.joycon.arrow.right').live('click',function (e) {
    clearInterval(setint);
    if(!keyPressed){
      setint = setInterval(function () {
        keysPressed[39] = true;
        keysPressed[37] = false;
        keysPressed[38] = false;
        keysPressed[40] = false;
        move(39); 
      },1);
    }
    
  });

  // $('.joycon.arrow.right').live("mouseleave mouseup", function () {
  //   val = 0;
  //   clearInterval(setint);
  //   keysPressed[39] = false;
  //   clearInterval(anim);
  //   keyPressed = false;
  // });

  $('.joycon.enter').live('click',function (e) {
    clearInterval(setint);
    clearInterval(anim);
    move(13);
    keysPressed[13] = false;
    keysPressed[37] = false;
    keysPressed[38] = false;
    keysPressed[39] = false;
    keysPressed[40] = false;
    clearInterval(anim);
    keyPressed = false;
  });
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
  if(inventory.fishbook){
    $(".fishbook").css("display","flex");
    eventOccurence = true;
  }
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
//Pick up item Functions
///////////////////////
function takeBook(){
  if(parseInt($("#dylan").css("left")) >= 764 && parseInt($("#dylan").css("left")) <= 1208 && parseInt($("#dylan").css("top")) >= 1068 && parseInt($("#dylan").css("top")) <= 1240){//376 412
    if (inventory.backpack && !inventory.fishbook) {
      $(".book-item").css("visibility", "hidden");
      inventory.fishbook = true;

      setCookie("fishbook","true");

      $(".inventory-slot.book").css("background-image",URL.getMisc()+"/fishbook-icon-found.png)");
      $(".achievement").css("background-color","#3EB489");
      $(".achievement").css("display","block").fadeIn();
      $(".achievement-name").text('What will we catch?');
      $(".achievement-description").text('Collect the Fish Collection Book');
      setTimeout(function(){
        $(".achievement").fadeOut();
      },3000);
      checkIfComplete();
    }
    else if(!inventory.fishbook){
      $(".nes-balloon.from-left p").text("Hmm... If only I had a place to store this");
      $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1300)
    }
  }
}

function takeMatchbox(){
  if(parseInt($("#dylan").css("left")) <= 168){
    if(inventory.backpack && !inventory.matchbox){
      inventory.matchbox = true;
      setCookie("matchbox",true);
      $(".achievement").css("background-color","#3EB489");
      $(".matchbox").css("display", "none");
      $(".inventory-slot.matches").css("background-image", URL.getMisc()+"/matchbox-icon-found.png)");   
      $(".achievement").css("display","block").fadeIn();
      $(".achievement-name").text('It\'s a Match!');
      $(".achievement-description").text('Pick up the matchbox');
      setTimeout(function(){
        $(".achievement").fadeOut().css("display","block");
      },3000);
      checkIfComplete();
    }
    else if(!inventory.matchbox){
      $(".nes-balloon.from-left p").text("Hmm... If only I had a place to store this");
      $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1000)
    }
  } 
}

function takeFishingRod(){
  if(parseInt($("#dylan").css("top")) >= 1208){
    if(inventory.backpack && !inventory.fishingRod){
      inventory.fishingRod = true;
      setCookie("fishing-rod",true);
      $(".fishing-rod").css("display", "none");
      $(".achievement").css("background-color","#3EB489");
      $(".inventory-slot.fishingRod").css("background-image", URL.getMisc()+"/fishing-rod-found.png)");   
      $(".achievement").css("display","block").fadeIn();
      $(".achievement-name").text('Lets Fish!');
      $(".achievement-description").text('Pick up the fishing rod');
      setTimeout(function(){
        $(".achievement").fadeOut();
      },3000);
      checkIfComplete();
    }
    else if(!inventory.fishingRod){
      $(".nes-balloon.from-left p").text("Hmm... If only I had a place to store this");
      $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1000)
    }
  }
  
}

function takeAxe() {
  if(parseInt($("#dylan").css("left")) >= 272 && parseInt($("#dylan").css("left")) <= 412 && parseInt($("#dylan").css("top")) <= 492){//376 412
    if (inventory.backpack && !inventory.axe) {
      $("#dylan").css({
        left: 412+"px",
        top: 396+"px"
      });
      $("#map").css({
        marginLeft: 1728+"px",
        marginTop: -576+"px"
      });
      eventOccurence = true;
      var url = URL.getNature();
      //Change Stump Image
      var dylanURL = URL.getDylan()+"/axe/pickup"
      var i = 1;
      var wait = 0;
      var grabAxe = setInterval(function(){
        if(i > 3){
          $(".achievement").css("background-color","#3EB489");
          $("#stump").css("background-image", url+"/stump-without-axe.png)");
          $("#dylan").css("background-size","40px").css("width","40px");
          $(".achievement").css("display","block").fadeIn();
          $(".achievement-name").text('Axe to Grind');
          $(".achievement-description").text('Grab the Axe');
          setTimeout(function(){
            $(".achievement").fadeOut();
          },3000);
        }
        if(i > 6){
          eventOccurence = false;
          $("#dylan").css("background-size","32px").css("width","32px");
          clearInterval(grabAxe);
          $("#dylan").css("background-image", URL.getDylan() + "/dylan-left-" + 1 + ".png)");
        }
        else if(wait < 5 && i == 3){
          wait++;
          $("#dylan").css("background-image", dylanURL + "/dylan-axe-" + i + ".png)");
        }
        
        else{
          $("#dylan").css("background-image", dylanURL + "/dylan-axe-" + i + ".png)");
          i++;
        }
        
      },80)

      
      inventory.axe = true;
      setCookie("axe",true);
      //Add Axe to the Inventory
      $(".inventory-slot.axe").css("background-image", URL.getMisc()+"/axe-icon-found.png)");

      checkIfComplete();
    }
    else if(!inventory.axe){
      $(".nes-balloon.from-left p").text("Hmm... If only I had a place to store this");
      $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1300)
    }
  }
}

function takeWood() {
  $("#wood-log").css("visibility", "hidden");
  inventory.wood = true;
  setCookie("wood","true")
  //Flash Backpack
  // flashInventory = setInterval(flashBackpack, 700);
  $(".inventory-slot.wood").css("background-image",URL.getMisc()+"/wood-icon-found.png)");
  $(".achievement").css("background-color","#3EB489");
  $(".achievement").css("display","block").fadeIn();
  $(".achievement-name").text('Woodn\'nt that be nice');
  $(".achievement-description").text('Collect Firewood');
  setTimeout(function(){
    $(".achievement").fadeOut();
  },3000);
  checkIfComplete();

}

function takeMap(){
  if(parseInt($("#dylan").css("left")) >= 756 && parseInt($("#dylan").css("left")) <= 1200 && parseInt($("#dylan").css("top")) >= 312 && parseInt($("#dylan").css("top")) <= 552){
    $(".minimap-icon").css("display","block");
    $(".scroll").css("display","none");
    inventory.minimap = true;
    $(".achievement").css("background-color","#3EB489");
    $(".achievement").css("display","block").fadeIn();
    $(".achievement-name").text('Mind the Map');
    $(".achievement-description").text('Collect the Map');
    setTimeout(function(){
      $(".achievement").fadeOut();
    },3000);

    setCookie("minimap","true");
    checkIfComplete();
  }
  
}

function takeResume() {
  if(parseInt($("#dylan").css("left")) >= 1544 && parseInt($("#dylan").css("top")) >= 952 && parseInt($("#dylan").css("top")) <= 1100){//376 412
    if (inventory.backpack && !inventory.resume) {
      $(".paper").css("visibility", "hidden");
      inventory.resume = true;
      setCookie("resume","true");

      $(".inventory-slot.resume").css("background-image",URL.getMisc()+"/resume-icon-found.png)");
      $(".achievement").css("background-color","#3EB489");
      $(".achievement").css("display","block").fadeIn();
      $(".achievement-name").text('Who am I?');
      $(".achievement-description").text('Collect my Resume');
      setTimeout(function(){
        $(".achievement").fadeOut();
      },3000);
      checkIfComplete();
    }
    else if(!inventory.resume){
      $(".nes-balloon.from-left p").text("Hmm... If only I had a place to store this");
      $(".nes-balloon.from-left").css({display:"block",top: "-90px"});
      setTimeout(function(){$(".nes-balloon.from-left").fadeOut()},1300)
    }
  }
}

function enableBackpack() {
  if(parseInt($("#dylan").css("top")) > 680 && parseInt($("#dylan").css("left")) >= 1348){
    inventory.backpack = true;
    setCookie("backpack",true);
    $("#backpack").css("opacity", "0");
    $(".achievement").css("background-color","#3EB489");
    if(window.innerWidth > 600)
      $("#backpack-icon").css("visibility", "visible");
    $(".achievement").css("display","block").fadeIn();
    $(".achievement-name").text('Extra Baggage');
    $(".achievement-description").text('Pick up Backpack');
    setTimeout(function(){
      $(".achievement").fadeOut().css("display","block");
    },3000);
  }
}

function checkIfComplete(){
  if (!Object.values(inventory).includes(false)){
    $(".achievement").css("background-color","goldenrod");
    $(".achievement").css("display","block").fadeIn();
    $(".achievement-name").text('Strapped Up');
    $(".achievement-description").text('Collect All Items');
    setTimeout(function(){
      $(".achievement").fadeOut();
    },5000);
  }
}
///////////////////////
//COLLISION
///////////////////////


//Calculates the new value of the key pressed
//Collision Handler for main map
function calculateNewValue(oldValue, keyCode1, keyCode2, elem) {
  if (onLog) {
    return parseInt(oldValue, 10);
  }

  if (elem == "body-top" || elem == "body-left") {
    distancePerIteration = -12;
  }
  else {
    distancePerIteration = 4;
  }

  //window borders
  if (elem == "body-top") {
    if (parseInt($("#dylan").css("top")) < 204) {
      return parseInt(oldValue, 10);
    }
  //   if (parseInt($("#dylan").css("top")) > 1972) {
  //     return parseInt(oldValue, 10);
  //   }
  // }
  // if (elem == "body-left") {
  //   if (parseInt($("#dylan").css("left")) < 344) {
  //     return parseInt(oldValue, 10);
  //   }
  //   if (parseInt($("#dylan").css("left")) > 1596) {
  //     return parseInt(oldValue, 10);
  //   }
   }

/*
 *  //////////////////////////////////////////
 *  //UP & DOWN COLLISION 
 *  //////////////////////////////////////////
*/
  if (elem == "dylan-top" || elem == "body-top") {

    ////////////////////////////////////
    //Tent1
    ///////////////////////////////////
    if(parseInt($("#dylan").css("top")) < 680){
      $(".tent.t1").css("z-index", "51");
    }
    else{
      $(".tent.t1").css("z-index", "48");
    }
    if((parseInt($("#dylan").css("left")) < 288 && parseInt($("#dylan").css("left")) > 200) || (parseInt($("#dylan").css("left")) <= 384 && parseInt($("#dylan").css("left")) > 296)){
      if(parseInt($("#dylan").css("top")) == 680 && keysPressed[keyCode1]){
        return parseInt(oldValue, 10);
      }
    }
    

    ///////////////////////////////////
    ///FENCES
    ///////////////////////////////////

    //Top fence and bridge
    if (parseInt($("#dylan").css("top")) < 348 && (((parseInt($("#dylan").css("left"))) < 948) || (parseInt($("#dylan").css("left"))) > 1016)) {
      if (keysPressed[keyCode1])
        return parseInt(oldValue, 10);
    }
    //bottom fence
    if (parseInt($("#dylan").css("top")) == 1272 && (((parseInt($("#dylan").css("left"))) < 952) || (parseInt($("#dylan").css("left"))) > 1020)) {
      if (keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    //Fence opposite of tent 1
    if(parseInt($("#dylan").css("top")) == 796){
      if(parseInt($("#dylan").css("left")) < 484){
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
    }
    //Fence on Tent 1
    if(parseInt($("#dylan").css("top")) == 648){
      if(parseInt($("#dylan").css("left")) < 452){
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    //bottom fence in backyard of tent 1
    if(parseInt($("#dylan").css("top")) < 628){
      $(".fence.tent1").css("z-index", "50");
    }
    else{
      $(".fence.tent1").css("z-index", "10");
    }
    if(parseInt($("#dylan").css("top")) == 616){
      if(parseInt($("#dylan").css("left")) <= 412){
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
    }

    ///////////////////////////////////
    ///DOCK
    ///////////////////////////////////
    if (parseInt($("#dylan").css("top")) >= 1444) {
      if (keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    
    ///////////////////////////////////
    ///DOORS
    ///////////////////////////////////

    //Cave door
    if (parseInt($("#dylan").css("top")) <= 160) {
      if (keysPressed[keyCode1] && (parseInt($("#dylan").css("left")) < 968 || parseInt($("#dylan").css("left")) > 992))
        return parseInt(oldValue, 10);
    }
    if(parseInt($("#dylan").css("top")) == 108 && keysPressed[keyCode1]){
      openTutorial();
      return parseInt(oldValue, 10);
    }

    ///////////////////////////////////
    ///Incline
    ///////////////////////////////////

    //Soccer Nets
    if(parseInt($("#dylan").css("top")) > 456){
      $(".soccer-goal").css("z-index", "48");
    }
    else{
      $(".soccer-goal").css("z-index", "51");
    }

    if(parseInt($("#dylan").css("top")) > 456){
      $(".soccer-goal.back").css("z-index", "48");
    }
    else{
      $(".soccer-goal.back").css("z-index", "51");
    }

    //soccer-ball
    if(parseInt($("#dylan").css("top")) > 560){
      $(".soccer-ball").css("z-index", "48");
    }
    else{
      $(".soccer-ball").css("z-index", "51");
    }

    //Bottom of incline
    if(parseInt($("#dylan").css("top")) == 740){
      if(parseInt($("#dylan").css("left")) < 1576 && parseInt($("#dylan").css("left")) > 1412){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }
    //Right side with trees and staircase
    if(parseInt($("#dylan").css("top")) > 716){
      $(".curved-tree").css("z-index", "48");
    }
    else{
      $(".curved-tree").css("z-index", "51");
    }
    if(parseInt($("#dylan").css("top")) == 756){
      if(parseInt($("#dylan").css("left")) <= 1716 && parseInt($("#dylan").css("left")) >= 1640){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }
    //left side of staircase bottom
    if(parseInt($("#dylan").css("top")) == 756){
      if(parseInt($("#dylan").css("left")) < 1608 && parseInt($("#dylan").css("left")) >= 1572){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //top top of cliff
    if(parseInt($("#dylan").css("top")) == 396){
      if(parseInt($("#dylan").css("left")) <= 1688 && parseInt($("#dylan").css("left")) >= 1472){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //BOTTOM of top of cliff
    if(parseInt($("#dylan").css("top")) == 680){
      if((parseInt($("#dylan").css("left")) < 1608 && parseInt($("#dylan").css("left")) >= 1472) || (parseInt($("#dylan").css("left")) <= 1688 && parseInt($("#dylan").css("left")) > 1636) ){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }

    if(parseInt($("#dylan").css("left")) >= 1608 && parseInt($("#dylan").css("left")) <= 1636 && parseInt($("#dylan").css("top")) < 756 && parseInt($("#dylan").css("top")) > 680){
      if(elem == "dylan-top")
        distancePerIteration = 8;
      else  //window
        distancePerIteration = -24;
    }


    ///////////////////////////////////
    ///Pond
    ///////////////////////////////////

    //outer top
    if(parseInt($("#dylan").css("top")) == 828){
      if(parseInt($("#dylan").css("left")) <= 1716 && parseInt($("#dylan").css("left")) >= 1412){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //outer bottom
    if(parseInt($("#dylan").css("top")) == 1212){
      if(parseInt($("#dylan").css("left")) <= 1804 && parseInt($("#dylan").css("left")) >= 1412){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //outside bridge
    if(parseInt($("#dylan").css("left")) >=1396 && parseInt($("#dylan").css("left")) <= 1412){
      if(parseInt($("#dylan").css("top")) == 972 && keysPressed[keyCode2]){
        return parseInt(oldValue, 10);
      }
      if(parseInt($("#dylan").css("top")) == 1040 && keysPressed[keyCode1]){
        return parseInt(oldValue, 10);
      }
    }

    //top of island
    if(parseInt($("#dylan").css("top")) == 952){
      if(keysPressed[keyCode1] && parseInt($("#dylan").css("left")) <= 1684 && parseInt($("#dylan").css("left")) >= 1548){
        return parseInt(oldValue, 10);
      }
    }
    //bottom of island
    if(parseInt($("#dylan").css("top")) == 1100){
      if(keysPressed[keyCode2] && parseInt($("#dylan").css("left")) <= 1684 && parseInt($("#dylan").css("left")) >= 1548){
        return parseInt(oldValue, 10);
      }
    }

    if(parseInt($("#dylan").css("top")) < 1028){
      $(".fountain").css("z-index", "100");
      $(".paper").css("z-index", "101");
    }
    else{
      $(".fountain").css("z-index", "10");
      $(".paper").css("z-index", "11");
    }

    //top and bottom of fountain
    if(parseInt($("#dylan").css("left")) <= 1652 && parseInt($("#dylan").css("left")) >= 1572){
      if(keysPressed[keyCode1] && parseInt($("#dylan").css("top")) == 1044){
        return parseInt(oldValue, 10);
      }
      if(keysPressed[keyCode2] && parseInt($("#dylan").css("top")) == 992){
        return parseInt(oldValue, 10);
      }
    }

    ///////////////////////////////////
    ///Fire Pit
    ///////////////////////////////////

    //top trees
    if(parseInt($("#dylan").css("top")) < 1064){
      $(".tall-tree.bottom").css("z-index", "100");
      $(".characters").css("z-index", "101");
      $(".special-thanks-sign").css("z-index", "101");
      $(".tall-tree.right").css("z-index", "100");
    }
    else{
      $(".tall-tree.bottom").css("z-index", "5");
      $(".tall-tree.right").css("z-index", "5");
      $(".characters").css("z-index", "6");
      $(".special-thanks-sign").css("z-index", "6");
    }

    //inside of staircase 1
    if(parseInt($("#dylan").css("left")) >= 972 && parseInt($("#dylan").css("left")) <= 1004 && parseInt($("#dylan").css("top")) < 624 && parseInt($("#dylan").css("top")) > 548){
      if(elem == "dylan-top")
        distancePerIteration = 8;
      else  
        distancePerIteration = -24;
    }

    //s
    if(parseInt($("#dylan").css("top")) == 552){
      if((parseInt($("#dylan").css("left")) < 972 && parseInt($("#dylan").css("left")) > 680) || (parseInt($("#dylan").css("left")) > 1004 && parseInt($("#dylan").css("left")) < 1292)){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //bottom cliff
    if(parseInt($("#dylan").css("top")) == 984){
      if((parseInt($("#dylan").css("left")) < 1180 && parseInt($("#dylan").css("left")) >= 788)){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //top cliff
    if(parseInt($("#dylan").css("top")) == 628){
      if((parseInt($("#dylan").css("left")) < 1180 && parseInt($("#dylan").css("left")) > 1004) || (parseInt($("#dylan").css("left")) > 784 && parseInt($("#dylan").css("left")) < 968)){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //bottom trees
    if(parseInt($("#dylan").css("top")) == 1068){
      if((parseInt($("#dylan").css("left")) > 680 && parseInt($("#dylan").css("left")) < 1292)){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }
    //trees between stairs on left
    if(parseInt($("#dylan").css("left")) <= 724 && parseInt($("#dylan").css("left")) >= 684){
      if(parseInt($("#dylan").css("top")) == 876 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("top")) == 1016 && keysPressed[keyCode2])
      return parseInt(oldValue, 10);
    }

    //bonfire
    if(parseInt($("#dylan").css("top")) < 804){
      $("#bonfire").css("z-index", "100");
    }
    else{
      $("#bonfire").css("z-index", "10");
    }
    if(parseInt($("#dylan").css("top")) == 780){
      if(parseInt($("#dylan").css("left")) < 1032 && parseInt($("#dylan").css("left")) > 936){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }
    if(parseInt($("#dylan").css("top")) == 824){
      if(parseInt($("#dylan").css("left")) < 1032 && parseInt($("#dylan").css("left")) > 936){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //firepit left staircase
      if(parseInt($("#dylan").css("left")) >= 788 && parseInt($("#dylan").css("left")) < 820){
        if(keysPressed[keyCode2] && parseInt($("#dylan").css("top")) == 900){
          return parseInt(oldValue, 10);
        }
        if(keysPressed[keyCode1] && parseInt($("#dylan").css("top")) == 972){
          return parseInt(oldValue, 10);
        }
      }

    
    
    ///////////////////////////////////
    ///Nature
    ///////////////////////////////////

    //bushes by bridge-top
    if(parseInt($("#dylan").css("top")) < 448){
      $(".shrub.pathway.topShrubs").css("z-index", "100");
    }
    else{
      $(".shrub.pathway.topShrubs").css("z-index", "11");
    }
    if((parseInt($("#dylan").css("left")) > 896 && parseInt($("#dylan").css("left")) < 968) || (parseInt($("#dylan").css("left")) > 1008 && parseInt($("#dylan").css("left")) < 1068)){
      if (parseInt($("#dylan").css("top")) == 320 && keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      if (parseInt($("#dylan").css("top")) == 448 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
    }

    //Log Bench
    if (parseInt($("#dylan").css("top")) < 740 || ((parseInt($("#dylan").css("top")) > 844) && parseInt($("#dylan").css("top")) < 900)) {
      $(".bench").css("z-index", "100");
    }
    else {
      $(".bench").css("z-index", "10");
    }
    if (parseInt($("#dylan").css("left")) > 900 && parseInt($("#dylan").css("left")) < 1064) {
      if (parseInt($("#dylan").css("top")) == 740 || parseInt($("#dylan").css("top")) == 900) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
      if (parseInt($("#dylan").css("top")) == 704 || parseInt($("#dylan").css("top")) == 868) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
    }

    //Wood Stumps (LR in Bonfire)
    if (parseInt($("#dylan").css("top")) <= 796) {
      $(".tree-stump").css("z-index", "100");
    }
    else {
      $(".tree-stump").css("z-index", "10");
    }
    if ((parseInt($("#dylan").css("left")) > 1064 && parseInt($("#dylan").css("left")) < 1160) || (parseInt($("#dylan").css("left")) > 808 && parseInt($("#dylan").css("left")) < 904)) {
      if (parseInt($("#dylan").css("top")) == 796) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
      if (parseInt($("#dylan").css("top")) == 836) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    //stump with axe
    if (parseInt($("#dylan").css("top")) <= 376) {
      $("#stump").css("z-index", "100");
    }
    else {
      $("#stump").css("z-index", "10");
    }
    if ((parseInt($("#dylan").css("left")) > 324 && parseInt($("#dylan").css("left")) < 412)) {
      if (parseInt($("#dylan").css("top")) == 376) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
      if (parseInt($("#dylan").css("top")) == 412) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }


    //tree
    if (parseInt($("#dylan").css("top")) <= 448) {
      $("#falling-tree").css("z-index", "100");
    }
    else {
      $("#falling-tree").css("z-index", "10");
    }

    if (hitCount < 7) {

      //tree standing
      if (parseInt($("#dylan").css("top")) == 464) {
        if (parseInt($("#dylan").css("left")) > 212 && parseInt($("#dylan").css("left")) < 272) {
          if (keysPressed[keyCode1])
            return parseInt(oldValue, 10);
        }
      }
      if (parseInt($("#dylan").css("top")) == 448) {
        if (parseInt($("#dylan").css("left")) > 212 && parseInt($("#dylan").css("left")) < 272) {
          if (keysPressed[keyCode2])
            return parseInt(oldValue, 10);
        }
      }
    }

    else {
      //tree fallen
      if (parseInt($("#dylan").css("top")) == 464) {
        if (parseInt($("#dylan").css("left")) > 184 && parseInt($("#dylan").css("left")) < 376) {
          if (keysPressed[keyCode1])
            return parseInt(oldValue, 10);
        }
      }
      if (parseInt($("#dylan").css("top")) == 448) {
        if (parseInt($("#dylan").css("left")) > 184 && parseInt($("#dylan").css("left")) < 376) {
          if (keysPressed[keyCode2])
            return parseInt(oldValue, 10);
        }
      }
    }

    //wood log when tree is chopped down
    if (parseInt($("#dylan").css("top")) <= 472) {
      $("#wood-log").css("z-index", "100");
    }
    else {
      $("#wood-log").css("z-index", "10");
    }

    //Moss Log
    if (parseInt($("#dylan").css("top")) <= 356) {
      $(".moss-log").css("z-index", "100");
    }
    else {
      $(".moss-log").css("z-index", "10");
    }


    if ((parseInt($("#dylan").css("left")) > 652 && parseInt($("#dylan").css("left")) < 780)) {
      if (parseInt($("#dylan").css("top")) == 356) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
      if (parseInt($("#dylan").css("top")) == 384) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    //z-index for signs
    if(parseInt($("#dylan").css("top")) >= 668){
      $(".s4").css("z-index", "40");
    }
    else{
      $(".s4").css("z-index", "51");
    }
    if(parseInt($("#dylan").css("top")) >= 436){
      $(".s2").css("z-index", "40");
      $(".s3").css("z-index", "40");
    }
    else{
      $(".s2").css("z-index", "51");
      $(".s3").css("z-index", "51");
    }
    if(parseInt($("#dylan").css("top")) >= 956){
      $(".s8").css("z-index", "40");
    }
    else{
      $(".s8").css("z-index", "51");
    }
  }

  //////////////////////////////////////////
  //LEFT/RIGHT COLLISION 
  //////////////////////////////////////////

  if (elem == "dylan-left" || elem == "body-left") {
    ///////////////
    //Fences
    //////////////

    //Left fence
    if (parseInt($("#dylan").css("left")) < 168 && (parseInt($("#dylan").css("top"))) >= 344) {
      if (keysPressed[keyCode1])
        return parseInt(oldValue, 10);
    }
    //Right Fence
    if (parseInt($("#dylan").css("left")) > 1800) {
      if (keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    //Backyard Fence
    if(parseInt($("#dylan").css("left")) == 452){
      if(parseInt($("#dylan").css("top")) <= 640){
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }
    if(parseInt($("#dylan").css("left")) == 412){
      if(parseInt($("#dylan").css("top")) <= 630){
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
    }

    //bottom left fence by trees
    if(parseInt($("#dylan").css("left")) == 484){
      if(parseInt($("#dylan").css("top")) >= 800){
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    ///////////////////////////////////
    ///DOCK
    ///////////////////////////////////
    if (parseInt($("#dylan").css("top")) > 1272) {
      if (keysPressed[keyCode1] && parseInt($("#dylan").css("left")) <= 952)
        return parseInt(oldValue, 10);
      if (keysPressed[keyCode2] && parseInt($("#dylan").css("left")) >= 1020)
        return parseInt(oldValue, 10);
    }

    /////////////////////
    /////Tent 1
    /////////////////////
    if(parseInt($("#dylan").css("top")) >= 584 && parseInt($("#dylan").css("top")) <= 676){
      if((parseInt($("#dylan").css("left")) == 384 || parseInt($("#dylan").css("left")) == 288) && keysPressed[keyCode1]){
        return parseInt(oldValue, 10);
      }
      if((parseInt($("#dylan").css("left")) == 200 || parseInt($("#dylan").css("left")) == 296)&& keysPressed[keyCode2]){
        return parseInt(oldValue, 10);
      }
    }

    //////////
    //Resume Island
    /////////

    //Left outside
    if(parseInt($("#dylan").css("left")) == 1412){
      if((parseInt($("#dylan").css("top")) <= 972 && parseInt($("#dylan").css("top")) > 828) || (parseInt($("#dylan").css("top")) < 1212 && parseInt($("#dylan").css("top")) >= 1040)){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }
    
    //bridge outsides
    if((parseInt($("#dylan").css("top")) < 1040 && parseInt($("#dylan").css("top")) > 1020) || (parseInt($("#dylan").css("top")) < 1000 && parseInt($("#dylan").css("top")) > 972)){
      if(keysPressed[keyCode2] && parseInt($("#dylan").css("left")) == 1392){
        return parseInt(oldValue, 10);
      }
      if(keysPressed[keyCode1] && parseInt($("#dylan").css("left")) == 1548){
        return parseInt(oldValue, 10);
      }
    }

    //left side of pond inside
    if(parseInt($("#dylan").css("left")) == 1548){
      if(keysPressed[keyCode1] && ((parseInt($("#dylan").css("top")) > 1020 && parseInt($("#dylan").css("top")) < 1212) || (parseInt($("#dylan").css("top")) > 944 && parseInt($("#dylan").css("top")) < 996))){
        return parseInt(oldValue, 10);
      }
    }
    //right side of pond inside
    if(parseInt($("#dylan").css("left")) == 1684){
      if(keysPressed[keyCode2] && parseInt($("#dylan").css("top")) >= 944 && parseInt($("#dylan").css("top")) < 1548){
        return parseInt(oldValue, 10);
      }
    }

    if(parseInt($("#dylan").css("top")) < 1044 && parseInt($("#dylan").css("top")) > 992){
      if(keysPressed[keyCode1] && parseInt($("#dylan").css("left")) == 1652){
        return parseInt(oldValue, 10);
      }
      if(keysPressed[keyCode2] && parseInt($("#dylan").css("left")) == 1572){
        return parseInt(oldValue, 10);
      }
    }

    //////////
    //Fire Pit
    /////////

    //bonfire
    if(parseInt($("#dylan").css("left")) == 936){
      if(parseInt($("#dylan").css("top")) < 824 && parseInt($("#dylan").css("top")) > 780){
        if(keysPressed[keyCode2]){
          return parseInt(oldValue, 10);
        }
      }
    }
    if(parseInt($("#dylan").css("left")) == 1032){
      if(parseInt($("#dylan").css("top")) < 824 && parseInt($("#dylan").css("top")) > 780){
        if(keysPressed[keyCode1]){
          return parseInt(oldValue, 10);
        }
      }
    }

    //left trees and right trees around fire pit
    if(parseInt($("#dylan").css("top")) < 856){
      $(".tall-tree.walls.left").css("z-index", "100");
      $(".intro-portfolio.s5").css("z-index", "101");
    }
    else{
      $(".tall-tree.walls.left").css("z-index", "10"); 
      $(".intro-portfolio.s5").css("z-index", "11");
    }
    if(parseInt($("#dylan").css("top")) < 1068 && parseInt($("#dylan").css("top")) > 552){
      if(parseInt($("#dylan").css("left")) == 1292 && keysPressed[keyCode1]){
        return parseInt(oldValue, 10);
      }
      if(parseInt($("#dylan").css("left")) == 680 && keysPressed[keyCode2]){
        if((parseInt($("#dylan").css("top")) > 556 && parseInt($("#dylan").css("top")) < 876) || (parseInt($("#dylan").css("top")) > 1012 && parseInt($("#dylan").css("top")) < 1068)){
          return parseInt(oldValue, 10);
        }
      }
    }

    //staircase
    if(parseInt($("#dylan").css("top")) < 624 && parseInt($("#dylan").css("top")) > 552){
      if(parseInt($("#dylan").css("left")) == 972 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 1004 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }
    //right cliff
    if(parseInt($("#dylan").css("left")) == 1176){
      if(parseInt($("#dylan").css("top")) >= 628 && parseInt($("#dylan").css("top")) <= 984 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    //left cliff
    if(parseInt($("#dylan").css("left")) == 788){
      if((parseInt($("#dylan").css("top")) >= 628 && parseInt($("#dylan").css("top")) <= 904) || (parseInt($("#dylan").css("top")) >= 936 && parseInt($("#dylan").css("top")) <= 1012))
        if(keysPressed[keyCode1])
          return parseInt(oldValue, 10);
    }

    //left cliff outside
    if(parseInt($("#dylan").css("left")) == 724){
      if((parseInt($("#dylan").css("top")) >= 684 && parseInt($("#dylan").css("top")) <= 904) || (parseInt($("#dylan").css("top")) >= 936 && parseInt($("#dylan").css("top")) <= 1016))
        if(keysPressed[keyCode2])
          return parseInt(oldValue, 10);
    }

    //staircase left 
    if(parseInt($("#dylan").css("left")) == 820){
      if((parseInt($("#dylan").css("top")) >= 904 && parseInt($("#dylan").css("top")) <= 924) || (parseInt($("#dylan").css("top")) >= 952 && parseInt($("#dylan").css("top")) <= 968))
        if(keysPressed[keyCode1])
          return parseInt(oldValue, 10);
    }

    //////////
    //Inclined Surface
    ///////////

    //Left Cliff 
    if(parseInt($("#dylan").css("left")) == 1412){
      if(parseInt($("#dylan").css("top")) >= 344 && parseInt($("#dylan").css("top")) <= 736){
        if(keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }  
    }

    //outside left staircase
    if(parseInt($("#dylan").css("left")) == 1572){
      if(parseInt($("#dylan").css("top")) >= 740 && parseInt($("#dylan").css("top")) <= 752){
        if(keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }  
    }

    //Right side top
    if(parseInt($("#dylan").css("left")) == 1688){
      if(parseInt($("#dylan").css("top")) >= 360 && parseInt($("#dylan").css("top")) <= 680){
        if(keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }  
    }
    //left side top
    if(parseInt($("#dylan").css("left")) == 1472){
      if(parseInt($("#dylan").css("top")) >= 360 && parseInt($("#dylan").css("top")) <= 680){
        if(keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }  
    }

    //inside staircase left side
    if(parseInt($("#dylan").css("left")) == 1608){
      if(parseInt($("#dylan").css("top")) > 680 && parseInt($("#dylan").css("top")) < 756){
        if(keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }  
    }
    //inside staircase right side
    if(parseInt($("#dylan").css("left")) == 1636){
      if(parseInt($("#dylan").css("top")) > 680 && parseInt($("#dylan").css("top")) < 756){
        if(keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }  
    }

    //////////
    //Pond
    ///////////
    if(parseInt($("#dylan").css("left")) == 1716){
      if(parseInt($("#dylan").css("top")) >= 752 && parseInt($("#dylan").css("top")) <= 832){
        if(keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }  
    }

    

    //////////
    //NATURE
    ////////////

    //Top Bushes
    if(parseInt($("#dylan").css("top")) < 448 && parseInt($("#dylan").css("top")) > 320){
      if(parseInt($("#dylan").css("left")) == 960 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 1008 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 1068 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 896 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    //Top Bridge
    if (parseInt($("#dylan").css("top")) < 344) {
      $("#arch").css("z-index", "100");
      //left
      if (keysPressed[keyCode1] && parseInt($("#dylan").css("left")) < 952)
        return parseInt(oldValue, 10);
      //right
      if ((keysPressed[keyCode2] && parseInt($("#dylan").css("left")) > 1012)) {
        return parseInt(oldValue, 10);
      }

      //cave door:
      if (parseInt($("#dylan").css("top")) < 160) {
        if (keysPressed[keyCode1] && parseInt($("#dylan").css("left")) <= 968)
          return parseInt(oldValue, 10);
        if (keysPressed[keyCode2] && parseInt($("#dylan").css("left")) >= 992)
          return parseInt(oldValue, 10);
      }
    }
    else {
      $("#arch").css("z-index", "11");
    }

    //Log in Fireplace
    if ((parseInt($("#dylan").css("top")) > 704 && parseInt($("#dylan").css("top")) < 740) || (parseInt($("#dylan").css("top")) > 864 && parseInt($("#dylan").css("top")) < 900)) {
      if (parseInt($("#dylan").css("left")) == 900) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }

      if (parseInt($("#dylan").css("left")) == 1064) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    //Tree Stumps in Fireplace
    if ((parseInt($("#dylan").css("top")) > 796 && parseInt($("#dylan").css("top")) < 836)) {
      if (parseInt($("#dylan").css("left")) == 808 || parseInt($("#dylan").css("left")) == 1064) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }

      if (parseInt($("#dylan").css("left")) == 904 || parseInt($("#dylan").css("left")) == 1160) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    //Stump with axe
    if ((parseInt($("#dylan").css("top")) > 376 && parseInt($("#dylan").css("top")) < 412)) {
      if (parseInt($("#dylan").css("left")) == 324) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }

      if (parseInt($("#dylan").css("left")) == 412) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }

    //TREE chop
    if (parseInt($("#dylan").css("top")) < 464 && parseInt($("#dylan").css("top")) > 448) {
      if (hitCount < 7) {
        if (keysPressed[keyCode2] && parseInt($("#dylan").css("left")) == 212)
          return parseInt(oldValue, 10);
        if (keysPressed[keyCode1] && parseInt($("#dylan").css("left")) == 272)
          return parseInt(oldValue, 10);
      }
      else {
        if (keysPressed[keyCode2] && parseInt($("#dylan").css("left")) == 184)
          return parseInt(oldValue, 10);
        if (keysPressed[keyCode1] && parseInt($("#dylan").css("left")) == 376)
          return parseInt(oldValue, 10);
      }
    }

    //Moss Log
    if ((parseInt($("#dylan").css("top")) > 356 && parseInt($("#dylan").css("top")) < 384)) {
      if (parseInt($("#dylan").css("left")) == 652) {
        if (keysPressed[keyCode2])
          return parseInt(oldValue, 10);
      }
      if (parseInt($("#dylan").css("left")) == 780) {
        if (keysPressed[keyCode1])
          return parseInt(oldValue, 10);
      }
    }
    
  }

  
  //MOVEMENT FOR NO COLLISION
  var newValue = parseInt(oldValue, 10)
  - (keysPressed[keyCode1] ? distancePerIteration : 0)
  + (keysPressed[keyCode2] ? distancePerIteration : 0);


  return newValue;
}

//Collision Handler for Tent1
function calculateNewValueTent1(oldValue, keyCode1, keyCode2, elem) {
  if(sitting){
    return parseInt(oldValue, 10);
  }
  if (elem == "body-top") {
    distancePerIteration = -12;
  }
  else if (elem == "body-left") {
    distancePerIteration = -12; //-6
  }
  else {
    distancePerIteration = 4;
  }
  //////////////
  //UP DOWN COLLISION
  //////////////
  if (elem == "dylan-top" || elem == "body-top") {

    //bottom borders
    if(parseInt($("#dylan").css("top")) == 176 && keysPressed[keyCode2]){
      // leaveTent1(1);
      return parseInt(oldValue, 10);
    }
    if(parseInt($("#dylan").css("top")) == 132 && keysPressed[keyCode2]){
      if(parseInt($("#dylan").css("left")) <= 152 || parseInt($("#dylan").css("left")) >= 232)
        return parseInt(oldValue, 10);
    }

    //TOP BORDERS
    if(parseInt($("#dylan").css("top")) == -44 && keysPressed[keyCode1]){
      return parseInt(oldValue, 10);
    }
    //border wall
    if(parseInt($("#dylan").css("top")) == 52 && keysPressed[keyCode1]){
      if(parseInt($("#dylan").css("left")) > 168 && parseInt($("#dylan").css("left")) < 264)
        return parseInt(oldValue, 10);
    }

    //kitchenware
    if(parseInt($("#dylan").css("left")) < 100 && parseInt($("#dylan").css("top")) == -32 && keysPressed[keyCode1]){
        return parseInt(oldValue, 10);
    }
    //Kitchen table
    if(parseInt($("#dylan").css("top")) <= -12){
      $(".kitchen-table").css("z-index", "10000");
      $(".matchbox").css("z-index", "10001");
    }
    else{
      $(".kitchen-table").css("z-index", "9996");
      $(".matchbox").css("z-index", "9997");
    }
    
    if(parseInt($("#dylan").css("left")) < 120 && parseInt($("#dylan").css("left")) > 8){
      if(parseInt($("#dylan").css("top")) == 32 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("top")) == -12 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    //couch
    if(parseInt($("#dylan").css("top")) <= -4)
      $(".couch").css("z-index", "10000");
    else
    $(".couch").css("z-index", "9996");
    if(parseInt($("#dylan").css("left")) < 384 && parseInt($("#dylan").css("left")) > 268){
      if(parseInt($("#dylan").css("top")) == 20 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("top")) == -4 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

  }

  //////////////
  //LEFT RIGHT COLLISION
  //////////////

  //left and right borders
  if (elem == "dylan-left" || elem == "body-left") {
    if(parseInt($("#dylan").css("left")) == 384 && keysPressed[keyCode2]){
      return parseInt(oldValue, 10);
    }
    if(parseInt($("#dylan").css("left")) == 0 && keysPressed[keyCode1]){
      return parseInt(oldValue, 10);
    }

    //border wall
    if(parseInt($("#dylan").css("top")) < 52){
      if(parseInt($("#dylan").css("left")) == 168 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 264 &&  keysPressed[keyCode1])
        return parseInt(oldValue, 10);
    }


    //enterance walls
    if(parseInt($("#dylan").css("top")) > 132){
      if(parseInt($("#dylan").css("left")) == 160 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 224 &&  keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }

    //kitchenware
    if(parseInt($("#dylan").css("left")) == 96 && parseInt($("#dylan").css("top")) < -32 &&  keysPressed[keyCode1])
      return parseInt(oldValue, 10);
    //kitchen table
    if(parseInt($("#dylan").css("top")) <= 32 && parseInt($("#dylan").css("top")) >= -12){
      if(parseInt($("#dylan").css("left")) == 120 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 8 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
    }
    //couch
    if(parseInt($("#dylan").css("top")) < 20 && parseInt($("#dylan").css("top")) > -4){
      if(parseInt($("#dylan").css("left")) == 264 && keysPressed[keyCode2])
        return parseInt(oldValue, 10);
      if(parseInt($("#dylan").css("left")) == 384 && keysPressed[keyCode1])
        return parseInt(oldValue, 10);
    }
  }
  //MOVEMENT FOR NO COLLISION
  var newValue = parseInt(oldValue, 10)
    - (keysPressed[keyCode1] ? distancePerIteration : 0)
    + (keysPressed[keyCode2] ? distancePerIteration : 0);


  return newValue;
}