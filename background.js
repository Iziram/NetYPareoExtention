browser.browserAction.onClicked.addListener(()=>{
  browser.tabs.executeScript({
    file: "script.js"
  });
})
