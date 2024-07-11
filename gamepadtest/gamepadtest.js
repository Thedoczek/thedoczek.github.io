/*
 * Gamepad API Test
 * Written in 2013 by Ted Mielczarek <ted@mielczarek.org>
 *
 * To the extent possible under law, the author(s) have dedicated all copyright and related and neighboring rights to this software to the public domain worldwide. This software is distributed without any warranty.
 *
 * You should have received a copy of the CC0 Public Domain Dedication along with this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
 */
var haveEvents = 'GamepadEvent' in window;
var haveWebkitEvents = 'WebKitGamepadEvent' in window;
var controllers = {};
var rAF = window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.requestAnimationFrame;

function connecthandler(e) {
  addgamepad(e.gamepad);
}
function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
  var d = document.createElement("div");
  d.setAttribute("id", "controller" + gamepad.index);
  var t = document.createElement("h1");
  t.appendChild(document.createTextNode("gamepad: " + gamepad.id));
  t.setAttribute("style", "display: none;");
  d.appendChild(t);
  
  var b = document.createElement("div");
  b.className = "buttons";
  for (var i = 0; i < gamepad.buttons.length; i++) {
    var e = document.createElement("span");
    e.className = "button";
    e.innerHTML = i;
    b.appendChild(e);
  }
  d.appendChild(b);
  
  var a = document.createElement("div");
  a.className = "axes";
  for (i = 0; i < gamepad.axes.length; i++) {
    e = document.createElement("meter");
    e.className = "axis";
    e.setAttribute("min", "-1");
    e.setAttribute("max", "1");
    e.setAttribute("value", "0");
    if (i >= 2) {e.setAttribute("style", "display: none;")}
    e.innerHTML = i;
    a.appendChild(e);

    var div = document.createElement("div");
    div.className = "axisValue";
    div.setAttribute("id", "axisValue" + i);
    if (i >= 2) {div.setAttribute("style", "display: none;")}
    a.appendChild(div);
  }
  d.appendChild(a);

  var atanDiv = document.createElement("div");
  atanDiv.className = "atanValue";
  atanDiv.setAttribute("id", "atanValue" + gamepad.index);
  d.appendChild(atanDiv);

  document.getElementById("start").style.display = "none";
  document.body.appendChild(d);
  rAF(updateStatus);
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  var d = document.getElementById("controller" + gamepad.index);
  document.body.removeChild(d);
  delete controllers[gamepad.index];
}

function updateStatus() {
  scangamepads();
  for (j in controllers) {
    var controller = controllers[j];
    var d = document.getElementById("controller" + j);
    var buttons = d.getElementsByClassName("button");
    for (var i = 0; i < controller.buttons.length; i++) {
      var b = buttons[i];
      var val = controller.buttons[i];
      var pressed = val == 1.0;
      var touched = false;
      if (typeof(val) == "object") {
        pressed = val.pressed;
        if ('touched' in val) {
          touched = val.touched;
        }
        val = val.value;
      }
      var pct = Math.round(val * 100) + "%";
      b.style.backgroundSize = pct + " " + pct;
      b.className = "button";
      if (pressed) {
        b.className += " pressed";
      }
      if (touched) {
        b.className += " touched";
      }
    }

    var axes = d.getElementsByClassName("axis");
    for (var i = 0; i < controller.axes.length; i++) {
      var a = axes[i];
      a.innerHTML = i + ": " + controller.axes[i].toFixed(4);
      a.setAttribute("value", controller.axes[i]);

      var axisValueDiv = document.getElementById("axisValue" + i);
      axisValueDiv.innerHTML = "Axis" + i + ": " + controller.axes[i].toFixed(4);
    }

    var atanDiv = document.getElementById("atanValue" + j);
    try {
      if (controller.axes[1] === 0) {
        if (controller.axes[0] === 0) {
          throw "0.0000";
        } else if (controller.axes[0] > 0) {
          throw "90.0000";
        } else if (controller.axes[0] < 0) {
          throw "-90.0000";
        }
      } else {
        var atanValue = Math.atan2(controller.axes[0], controller.axes[1]) * (180 / Math.PI);
        atanDiv.innerHTML = "Ang: " + atanValue.toFixed(4);
      }
    } catch (error) {
      atanDiv.innerHTML = "Ang: " + error;
    }
  }
  rAF(updateStatus);
}

function scangamepads() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (var i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && (gamepads[i].index in controllers)) {
      controllers[gamepads[i].index] = gamepads[i];
    }
  }
}

if (haveEvents) {
  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);
} else if (haveWebkitEvents) {
  window.addEventListener("webkitgamepadconnected", connecthandler);
  window.addEventListener("webkitgamepaddisconnected", disconnecthandler);
} else {
  setInterval(scangamepads, 500);
}
