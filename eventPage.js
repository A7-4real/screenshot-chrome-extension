console.log("eventPage loaded");

// creating screenshot context menu
var contextMenuItem = {
  id: "s",
  title: "SSS-Screenshot",
  contexts: ["all"],
};

chrome.contextMenus.create(contextMenuItem);
console.log("context item created");

// addListener listens when user clicks on context menu and check whether id is
// same as our menuItemId
chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "s") {
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
            console.log("screenshot done!");
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
