console.log("eventPage loaded");

var contextMenuItem = {
  id: "s",
  title: "screenshot",
  contexts: ["all"],
};

chrome.contextMenus.create(contextMenuItem);
console.log("context item created");

chrome.contextMenus.onClicked.addListener(function (clickData) {
  if (clickData.menuItemId == "s") {
    console.log("context item clicked");

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.captureVisibleTab(null, null, function (dataUrl) {
        console.log("Tab screenshot initiated");
        var screenshotUrl = dataUrl;
        console.log("screenshot url - ", screenshotUrl);
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "take_screenshot", data: screenshotUrl },
          function (response) {
            alert("screenshot done!");
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
