var serverURL = "http://localhost:8080";

// show the gui page when the icon is pressed
chrome.browserAction.onClicked.addListener( function() {
    var url = chrome.extension.getURL("gui.html");
    chrome.tabs.create({url:url});
});


// has the extension been configured?
chrome.storage.local.get("conf", function(items) {
    if (typeof items.conf === 'undefined') {
        // nope. Do that now.
        chrome.tabs.create({url: "conf.html"});
    }
});


// TODO: pick some reasonable alarm times (maybe 7min and something random like 17?)
chrome.alarms.create("", {delayInMinutes: 1, periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("BING!",alarm);
    // TODO: check for unsent posts and call dumpToServer() here
});


function registerUser( user, successfn, errfn ) {
    console.log("register", user);
    var req = new XMLHttpRequest();
    req.open('POST', serverURL + '/reg', true);
    req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    req.addEventListener("load", function(ev) {
        console.log(user,successfn, errfn);
        successfn();

        // TODO: parse and store registration ID returned from the server
        // at this point the extension should begin operating


    });
    req.addEventListener("error", function(ev) {
        errfn("network error");
    });
    req.send( JSON.stringify(user) );
}

function dumpToServer() {
    // TODO:
    // mark uploaded posts as sent
    // delete oldest posts when over a certain threshold
    // need to send registration ID so server can file it properly

    console.log("upload...");
    chrome.storage.local.get(null, function(items) {
        var ents = [];
        for (var key in items) {
            if (key.indexOf("post-") != 0) {
                continue;
            }
            var post = items[key];
            ents.push(post);
        }


        var req = new XMLHttpRequest();
        req.open('POST', serverURL + '/up', true);
        req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        req.addEventListener("load", function(ev) {
            console.log("sent: ", ev);
        });
        req.addEventListener("error", function(ev) {
            console.log("poop: ", ev);
        });
        var dat = {"ents": ents};
        console.log("send ",dat);
        req.send( JSON.stringify(dat) );


    });

}


