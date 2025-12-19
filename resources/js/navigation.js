// navigation.js
// Keyboard handling, movement, and collision logic.

// Keeps the interval for the animation
var anim;

// Used to determine which frame the animation is on
var frame = 1;

// Determines if a key is pressed
var keyPressed = false;

// ASCII of Keys for animation and movement
var keyLeft = 37;
var keyUp = 38;
var keyRight = 39;
var keyDown = 40;
var keyW = 87;
var keyA = 65;
var keyS = 83;
var keyD = 68;
var keyEnter = 13;
var keySpace = 32;

// Variables for Movement
var dylan = $("#dylan"),
  // maxValue = pane.width() - box.width(), //replace with collision function
  keysPressed = {},
  distancePerIteration = 4;

var doorOpen = false;

// Keydown
$(document).keydown(function (e) {
  if (isReelingIn) {
    reelIn(e.keyCode);
  }
  keysPressed[e.which] = true;
  move(e.keyCode);

  if (playSoccer && e.keyCode == keyEnter) moveBall();
});

// Keyup
$(document).keyup(function (e) {
  // $("#dylan").fadeIn();
  if (isReelingIn && keysPressed[keySpace]) {
    $("#dylan").css(
      "background-image",
      URL.getDylan() + "/fishing/dylan-fishing-1.png)"
    );
  }
  clearInterval(anim);
  keyPressed = false;
  keysPressed[e.which] = false;
});

// function to handle movement of the character and the map
function move(keyCode) {
  // if an event is occuring
  if (onLog || eventOccurence || sitting) {
    clearInterval(anim);
    return;
  } else {
    $(".tooltiptext").css("opacity", 0);
  }

  var url = URL.getDylan();

  // Tells the computer what the last key pressed was from up down left right
  var key = "";

  if (!keyPressed) {
    keyPressed = true;
    anim = setInterval(function () {
      // Frame Animation
      frame++;

      // When enter key is pressed
      if (keyCode == keyEnter) {
        if (tentOpen) {
          // front door
          if (
            parseInt($("#dylan").css("top")) >= 136 &&
            parseInt($("#dylan").css("left")) >= 172 &&
            parseInt($("#dylan").css("left")) <= 216
          ) {
            leaveTent1(1);
          }
          // back door
          if (
            parseInt($("#dylan").css("top")) <= -28 &&
            parseInt($("#dylan").css("left")) >= 148 &&
            parseInt($("#dylan").css("left")) <= 168
          ) {
            leaveTent1(0);
          }
        }
      } else if (keyCode == keyLeft || keyCode == keyA) {
        if (key != "left") frame = 1;
        if (frame > 7) frame = 2;
        key = "left";
        $("#dylan").css(
          "background-image",
          url + "/dylan-left-" + frame + ".png)"
        );
      } else if (keyCode == keyUp || keyCode == keyW) {
        if (key != "up") frame = 1;
        if (frame > 7) frame = 2;
        key = "up";

        $("#dylan").css(
          "background-image",
          url + "/dylan-back-" + frame + ".png)"
        );

        // If the up key will bring you into tent 1
        if (
          parseInt($("#dylan").css("left")) >= 288 &&
          parseInt($("#dylan").css("left")) <= 296
        ) {
          if (parseInt($("#dylan").css("top")) == 648) {
            openTent1("front");
          }
        }
        if (
          tentOpen &&
          parseInt($("#dylan").css("left")) <= 168 &&
          parseInt($("#dylan").css("left")) > 120 &&
          parseInt($("#dylan").css("top")) == -44
        ) {
          leaveTent1(2);
        }
      } else if (keyCode == keyDown || keyCode == keyS) {
        if (key != "down") frame = 1;
        if (frame > 7) frame = 2;
        key = "down";

        $("#dylan").css(
          "background-image",
          url + "/dylan-front-" + frame + ".png)"
        );

        // If the up key will bring you into tent 1 from backyard
        if (
          !tentOpen &&
          parseInt($("#dylan").css("left")) >= 248 &&
          parseInt($("#dylan").css("left")) <= 340
        ) {
          if (parseInt($("#dylan").css("top")) == 616) {
            openTent1("back");
          }
        }
        if (tentOpen && parseInt($("#dylan").css("top")) > 172) {
          leaveTent1(1);
        }
      } else if (keyCode == keyRight || keyCode == keyD) {
        if (key != "right") frame = 1;
        if (frame > 7) frame = 2;
        key = "right";
        $("#dylan").css(
          "background-image",
          url + "/dylan-right-" + frame + ".png)"
        );
      }

      // Movement on stair in firepit
      if (
        !tentOpen &&
        parseInt($("#dylan").css("left")) <= 816 &&
        parseInt($("#dylan").css("left")) >= 736 &&
        parseInt($("#dylan").css("top")) >= 908 &&
        parseInt($("#dylan").css("top")) < 952
      ) {
        if (keyCode == keyLeft || keyCode == keyA) {
          $("#dylan").css({
            left: "-=12px",
            top: "-=4px",
          });

          $("#map").css({
            marginLeft: "+=36px",
            marginTop: "+=12px",
          });
        } else if (keyCode == keyRight || keyCode == keyD) {
          $("#dylan").css({
            left: "+=12px",
            top: "+=4px",
          });

          $("#map").css({
            marginLeft: "-=36px",
            marginTop: "-=12px",
          });
        }
      }

      // movement on bridge to island
      else if (
        !tentOpen &&
        parseInt($("#dylan").css("left")) <= 1544 &&
        parseInt($("#dylan").css("left")) >= 1404 &&
        parseInt($("#dylan").css("top")) <= 1020 &&
        parseInt($("#dylan").css("top")) >= 980
      ) {
        // middle of bridge
        if (
          parseInt($("#dylan").css("left")) <= 1492 &&
          parseInt($("#dylan").css("left")) >= 1456
        ) {
          if (keyCode == keyLeft || keyCode == keyA) {
            $("#dylan").css({
              left: "-=4px",
            });

            $("#map").css({
              marginLeft: "+=12px",
            });
          } else if (keyCode == keyRight || keyCode == keyD) {
            $("#dylan").css({
              left: "+=4px",
            });

            $("#map").css({
              marginLeft: "-=12px",
            });
          }
        }

        // right side of bridge
        else if (parseInt($("#dylan").css("left")) > 1492) {
          if (keyCode == keyLeft || keyCode == keyA) {
            $("#dylan").css({
              left: "-=12px",
              top: "-=4px",
            });

            $("#map").css({
              marginLeft: "+=36px",
              marginTop: "+=12px",
            });
          } else if (keyCode == keyRight || keyCode == keyD) {
            $("#dylan").css({
              left: "+=12px",
              top: "+=4px",
            });

            $("#map").css({
              marginLeft: "-=36px",
              marginTop: "-=12px",
            });
          }
        }
        // left side of bridge
        else if (parseInt($("#dylan").css("left")) < 1456) {
          if (keyCode == keyLeft || keyCode == keyA) {
            $("#dylan").css({
              left: "-=12px",
              top: "+=4px",
            });

            $("#map").css({
              marginLeft: "+=36px",
              marginTop: "-=12px",
            });
          } else if (keyCode == keyRight || keyCode == keyD) {
            $("#dylan").css({
              left: "+=12px",
              top: "-=4px",
            });

            $("#map").css({
              marginLeft: "-=36px",
              marginTop: "+=12px",
            });
          }
        }
      }
      // if one of the tents are currently being used
      else if (tentOpen) {
        // Arrow keys
        $("#dylan").css({
          left: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyLeft,
              keyRight,
              "dylan-left"
            );
          },
          top: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyUp,
              keyDown,
              "dylan-top"
            );
          },
        });

        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyLeft,
              keyRight,
              "body-left"
            );
          },
          marginTop: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyUp,
              keyDown,
              "body-top"
            );
          },
        });

        // WASD
        $("#dylan").css({
          left: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyA,
              keyD,
              "dylan-left"
            );
          },
          top: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyW,
              keyS,
              "dylan-top"
            );
          },
        });

        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyA,
              keyD,
              "body-left"
            );
          },
          marginTop: function (index, oldValue) {
            return calculateNewValueTent1(
              oldValue,
              keyW,
              keyS,
              "body-top"
            );
          },
        });
      } else {
        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValue(
              oldValue,
              keyLeft,
              keyRight,
              "body-left"
            );
          },
          marginTop: function (index, oldValue) {
            return calculateNewValue(oldValue, keyUp, keyDown, "body-top");
          },
        });
        // Arrow keys
        $("#dylan").css({
          left: function (index, oldValue) {
            return calculateNewValue(
              oldValue,
              keyLeft,
              keyRight,
              "dylan-left"
            );
          },
          top: function (index, oldValue) {
            return calculateNewValue(oldValue, keyUp, keyDown, "dylan-top");
          },
        });

        // WASD
        $("#map").css({
          marginLeft: function (index, oldValue) {
            return calculateNewValue(oldValue, keyA, keyD, "body-left");
          },
          marginTop: function (index, oldValue) {
            return calculateNewValue(oldValue, keyW, keyS, "body-top");
          },
        });

        $("#dylan").css({
          left: function (index, oldValue) {
            return calculateNewValue(oldValue, keyA, keyD, "dylan-left");
          },
          top: function (index, oldValue) {
            return calculateNewValue(oldValue, keyW, keyS, "dylan-top");
          },
        });
      }
      // CHANGE SPEED OF CHARACTER: interval duration controls speed
    }, 50);
  }

  // Controls Doors for Tents
  if (!doorOpen) {
    // additional door logic remains here if needed
  }
}

