console.log("eventPage loaded");

// creating screenshot context menu

var contextMenuDII = {
  id: "dii",
  title: "DII",
  contexts: ["all"],
};

var subContextMenuIS = {
  id: "imageSearch",
  parentId: "dii",
  title: "Image Search",
  contexts: ["image"],
};

var subContextMenuSS = {
  id: "screenshotSearch",
  parentId: "dii",
  title: "Screenshot Search",
  contexts: ["all"],
};

chrome.contextMenus.create(contextMenuDII);
console.log("parent context menu DII created");

chrome.contextMenus.create(subContextMenuIS);
console.log("first child context menu Image Search created");

chrome.contextMenus.create(subContextMenuSS);
console.log("second child context menu Screenshot Search created");

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "dii") {
    console.log("context menu DII clicked, its working fine!");
  }
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "imageSearch") {
    console.log("Sub context menu Image Search is Clicked, its working fine!");
    console.log("Image url - ", clickData.srcUrl);
  }
});

// addListener listens when user clicks on context menu and check whether id is
// same as our menuItemId
chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "screenshotSearch") {
    console.log("context item clicked");

    // we to take screenshot of current and active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Capture screenshot of full visible tab
      chrome.tabs.captureVisibleTab(null, null, function (dataUrl) {
        console.log("Tab screenshot initiated");

        // screenshot url
        var screenshotUrl = dataUrl;
        console.log("screenshot url - ", screenshotUrl);

        // send Message to content to content script with screenshotUrl as data
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "take_screenshot", data: screenshotUrl },
          function (response) {
            console.log("screenshot done!", response);
          }
        );
      });
    });
  }
});

chrome.extension.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.name == "screenshot") {
    chrome.tabs.captureVisibleTab(null, null, function (dataUrl) {
      sendResponse({ screenshotUrl: dataUrl });
    });
  }
  return true;
});
