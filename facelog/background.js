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


chrome.alarms.create("", {delayInMinutes: 1, periodInMinutes: 7});
chrome.alarms.onAlarm.addListener(function (alarm) {
    uploadToServer();
});


function registerUser( user, successfn, errfn ) {
    console.log("register", user);
    var req = new XMLHttpRequest();
    req.open('POST', serverURL + '/api/reg', true);
    req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    req.addEventListener("load", function(ev) {
        console.log(user,successfn, errfn);

        // parse the result
        var s = req.status;
        if (s>=200 && s<300 ) {
            // server sends back: {uniq: <uniqueid>, err: <errmsg}
            var result = JSON.parse(req.responseText);
            console.log("result from server: ",result);
            if (result.uniq) {
                var conf = {"uniq": result.uniq, "details":user};
                chrome.storage.local.set({"conf":conf});
                // TODO: should check success...
                successfn();
            } else if (result.err) {
                errfn(result.err);
            } else {
                errfn("unknown error");
            }
        } else if (s>=500 && s<600) {
            errfn("server error");
        } else {
            errfn("unknown error");
        }





    });
    req.addEventListener("error", function(ev) {
        errfn("network error");
    });
    req.send( JSON.stringify(user) );
}

function uploadToServer() {
    // mark uploaded posts as sent
    // delete oldest posts when over a certain threshold
    // need to send registration ID so server can file it properly
    chrome.storage.local.get("conf", function(items) {
        if (typeof items.conf === 'undefined') {
            // not configured yet. bail out
            return;
        }

        var conf = items.conf;
        console.log("upload...");
        chrome.storage.local.get(null, function(items) {
            var ents = [];
            for (var key in items) {
                if (key.indexOf("post-") != 0) {
                    continue;
                }
                var post = items[key];
                // skip any already set
                if (post.sent) {
                    continue;
                }

                ents.push(post);
                // upper bound on posts per upload
                if( ents.length >= 500) {
                    break;
                }
            }
            if (ents.length==0) {
                //console.log("nothing new to upload\n");
                // nothing to upload. A good time to do some housekeeoing...
                tidyStore();
                return;
            }

            var req = new XMLHttpRequest();
            req.open('POST', serverURL + '/api/up', true);
            req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            req.addEventListener("load", function(ev) {
                var s = req.status;
                if (s>=200 && s<300 ) {
                    console.log("upload: successfully uploaded " + ents.length + " posts");
                    // update the 'sent' status on uploaded posts
                    var updated = {};
                    for (var i=0; i<ents.length; ++i) {
                        ents[i].sent = true;
                        updated["post-" + ents[i].id] = ents[i];
                    }
                    chrome.storage.local.set(updated, function() {
                    });
                } else {
                    // http error
                    //console.log("upload: server returned status", req.status);
                }
            });
            req.addEventListener("error", function(ev) {
                //console.log("upload: failed");
            });
            var dat = {"uniq": conf.uniq, "posts": ents};
            console.log("send ",dat);
            req.send( JSON.stringify(dat) );

        });
    });
}


function tidyStore() {
    chrome.storage.local.get(null, function(items) {
            var ents = [];
            // collect all the posts
            for (var key in items) {
                if (key.indexOf("post-") != 0) {
                    continue;
                }
                var post = items[key];
                ents.push(post);
            }

            // sort by seen, most recent first (ie descending)
            ents.sort(function (a, b) {
                  return b.seen.localeCompare(a.seen);
            });

            //
            var cull = ents.slice(3000);
            var remove = [];
            for (var i=0; i<cull.length; ++i) {
                remove.push("post-" + cull[i].id);
            }
            chrome.storage.local.remove(remove);
    });
};


