// show the gui page when the icon is pressed
chrome.browserAction.onClicked.addListener( function() {
    var url = chrome.extension.getURL("gui.html");
    chrome.tabs.create({url:url});
});


// has the extension been configured?
if (!localStorage.getItem("conf")) {
    chrome.tabs.create({url: "conf.html"});
}


