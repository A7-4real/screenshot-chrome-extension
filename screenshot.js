console.log("content script loaded");

var screenshotDataURL;
var halfBall = 6;
var drag = {
  elem: null,
  x: 0,
  y: 0,
  state: false,
};
var delta = {
  x: 0,
  y: 0,
};
var newSelection = false;

var left1, left2, top1, top2;

function moveCover(parent) {
  var canvasTop = parent.find(".SSS-screenshot-canvas").offset().top;
  var canvasLeft = parent.find(".SSS-screenshot-canvas").offset().left;
  var canvasWidth = parent.find(".SSS-screenshot-canvas").width();
  var canvasHeight = parent.find(".SSS-screenshot-canvas").height();
  var left = Math.min(left1, left2);
  var top = Math.min(top1, top2);
  var bottom = Math.max(top1, top2);
  var right = Math.max(left1, left2);
  var width = Math.abs(left1 - left2);
  var height = Math.abs(top1 - top2);

  parent.find(".SSS-screenshot-cover").css({
    top: top + halfBall + "px",
    left: left + halfBall + "px",
    width: right - left + "px",
    height: bottom - top + "px",
  });

  var buttonLeft = right + 2 * halfBall;
  var buttonTop = bottom + 2 * halfBall;
  var buttonOpacity = 1;

  if (canvasWidth - right < 80) {
    buttonOpacity = 0.5;
    buttonLeft -= 80;
  }

  if (canvasHeight - bottom < 46) {
    buttonOpacity = 0.5;
    buttonTop -= 40;
  }

  parent.find(".SSS-screenshot-search").css({
    top: buttonTop + "px",
    left: buttonLeft + "px",
    opacity: buttonOpacity === 1 ? 0.7 : 1,
  });

  parent.find(".SSS-screenshot-close").css({
    top: buttonTop + "px",
    left: buttonLeft + 37 + "px",
    opacity: buttonOpacity === 1 ? 0.7 : 1,
  });
}

// addListener listens for the msg containing action and screenshot url
chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action == "take_screenshot") {
    // console.log("Message recieved from eventpage");
    var screenshotUrl = msg.data;
    // console.log("screenshot url - ", screenshotUrl);
    // // takeScreenshot(screenshotUrl);

    // append style to users page
    $(document.head).append(
      "<style>#SSS-screenshot{margin:0px;border:0px;padding:0px;border-radius:0px}#SSS-screenshot *{transition:none;margin:0px;border:0px;padding:0px;border-radius:0px}</style>"
    );

    var div = $(
      '<div id="SSS-screenshot" style="width:100%;height:100%;z-index:999999999999999999999;position:fixed;left:0px;top:0px;" ></div>'
    );

    // creating image object
    var img = new Image();

    // set image src attribute same as screenshotUrl
    img.src = screenshotUrl;

    var defaultCSS = "margin:0;padding:0;position:absolute;";

    // append div when image loads
    img.onload = function () {
      div.append(
        '<div class="SSS-screenshot-search" style="' +
          defaultCSS +
          'cursor:pointer;box-sizing:content-box;height:29px;width:29px;font-weight:bold;position:absolute;z-index:3;float:right;background-color:rgba(130, 186, 255, 0);"><svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg"> <g> <ellipse ry="87" rx="86" id="svg_1" cy="121.999997" cx="123.000003" stroke-width="25" stroke="#66ff00" fill="#000000" fill-opacity="0"/> <line stroke-linecap="null" stroke-linejoin="null" id="svg_3" y2="267.499998" x2="251.500004" y1="193.5" x1="185.5" stroke-opacity="null" stroke-width="30" stroke="#66ff00" fill="none"/> </g></svg></div>'
      );

      // append canvas to users web page
      div.append(
        "<canvas width=" +
          img.width +
          " height=" +
          img.height +
          ' style="' +
          defaultCSS +
          'height:100%;width:100%;top:0;left:0;position:absolute" class="SSS-screenshot-canvas"></canvas>'
      );

      div.append(
        '<div class="SSS-screenshot-close" style="' +
          defaultCSS +
          'position:absolute;z-index:3;cursor:pointer;user-select: none;width: 29px;height: 29px;font-size: 30px; font-weight: bold; text-align: center;line-height:0px;background: rgba(193, 22, 59, 0);"><svg viewBox="0 0 300 300" width="300" height="300" xmlns="http://www.w3.org/2000/svg"> <g> <line stroke-linecap="null" stroke="#DD0004" stroke-linejoin="null" id="svg_3" y2="250" x2="250" y1="50" x1="50" stroke-opacity="null" stroke-width="30" fill="none"/> <line stroke="#DD0004" transform="rotate(-90 142.00000000000003,148.5) " stroke-linecap="null" stroke-linejoin="null" id="svg_5" y2="250" x2="250" y1="50" x1="50" stroke-opacity="null" stroke-width="30" fill="none"/> </g></svg></div>'
      );

      div.append(
        '<div class="SSS-screenshot-cover" style="' +
          defaultCSS +
          'pointer-events:none;position:absolute;left:0;top:0;background-color:rgba(0,0,0,0.418)"></div>'
      );

      $("body").append(div);

      $("body").append(
        "<style>#SSS-screenshot svg{width: 100%;height: 100%;}@keyframes shiny{0%{background-color:#2c93e3}50%{background-color:black}100%{background-color:#2c93e3}} .SSS-shiny{animation: shiny 3s infinite}</style>"
      );

      $(".SSS-screenshot-close").on("click", function (e) {
        $(div).remove();
        $(document).off("mousemove");
      });

      var canvasWidth = $(div).find(".SSS-screenshot-canvas").width();

      var canvasHeight = $(div).find(".SSS-screenshot-canvas").height();

      $(document).keyup(function (e) {
        if (e.keyCode == 27) {
          $(div).remove();
        }
      });

      top1 = canvasHeight / 3;
      left1 = canvasWidth / 3;
      top2 = (2 * canvasHeight) / 3;
      left2 = (2 * canvasWidth) / 3;

      moveCover(div);

      $(".SSS-screenshot-canvas").on("mousedown", function (e) {
        if (!newSelection) {
          newSelection = true;
          left1 = e.clientX;
          top1 = e.clientY;
          moveCover(div);
        }
      });

      $(".SSS-screenshot-canvas").on("mouseup", function (e) {
        if (newSelection) {
          left2 = e.clientX;
          top2 = e.clientY;
          newSelection = false;
          moveCover(div);
        }
      });

      $(document).mousemove(function (e) {
        if (newSelection) {
          left2 = e.clientX;
          top2 = e.clientY;
          moveCover(div);
        }
      });

      $(".SSS-screenshot-search").on("click", function (e) {
        var left = Math.min(left1, left2) + halfBall;
        var top = Math.min(top1, top2) + halfBall;
        var width = Math.abs(left1 - left2);
        var height = Math.abs(top1 - top2);
        var canvasTop = $(div).find(".SSS-screenshot-canvas").offset().top;
        var canvasLeft = $(div).find(".SSS-screenshot-canvas").offset().left;
        var ratio = img.height / $(div).find(".SSS-screenshot-canvas").height();
        var imgData = $(div)
          .find(".SSS-screenshot-canvas")[0]
          .getContext("2d")
          .getImageData(
            left * ratio,
            top * ratio,
            width * ratio,
            height * ratio
          );
        var canvas1 = document.createElement("canvas");
        canvas1.width = width * ratio;
        canvas1.height = height * ratio;
        var ctx = canvas1.getContext("2d");
        ctx.putImageData(imgData, 0, 0);
        var dataURL = canvas1.toDataURL();
        console.log(dataURL);

        chrome.extension.sendMessage({
          job: "beginImageSearch",
          base64: dataURL,
        });
      });
      setTimeout(loadScreenshot, 300);
    };

    var loadScreenshot = function () {
      var canvas = $(".SSS-screenshot-canvas").last()[0];
      if (!canvas) {
        setTimeout(loadScreenshot, 300);
      } else {
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
      }
    };
  }

  sendResponse(true);
});

// function takeScreenshot(screenshotUrl) {
//   console.log("takeScreeshot function called!");
//   var data = screenshotUrl;
//   var canvas = document.createElement("canvas");
//   var img = new Image();
//   img.onload = function () {
//     canvas.width = $(window).width();
//     canvas.height = $(window).height();
//     canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

//     var $canvas = $(canvas);
//     $canvas.data("scrollLeft", $(document.body).scrollLeft());
//     $canvas.data("scrollTop", $(document.body).scrollTop());

//     // Perform callback after image loads
//     renderPreview($canvas);
//   };
//   img.src = data;
// }

// /* Returns a canvas containing a screenshot of $element */
// function renderPreview($screenshotCanvas) {
//   console.log("renderPreview function called!");
//   var previewCanvas = document.createElement("canvas");
//   previewCanvas.width = $screenshotCanvas.width();
//   previewCanvas.height = $screenshotCanvas.height();

//   // Calculate the correct position of the element on the canvas
//   var prevTop =
//     $(previewCanvas).offset().top - $screenshotCanvas.data("scrollTop");
//   var prevLeft =
//     $(previewCanvas).offset().left - $screenshotCanvas.data("scrollLeft");

//   var ctx = previewCanvas.getContext("2d");
//   ctx.drawImage(
//     $screenshotCanvas[0],
//     prevLeft,
//     prevTop,
//     $(previewCanvas).width(),
//     $(previewCanvas).height(),
//     0,
//     0,
//     $(previewCanvas).width(),
//     $(previewCanvas).height()
//   );

//   return $(previewCanvas).css({ border: "1px solid black" });
// }
