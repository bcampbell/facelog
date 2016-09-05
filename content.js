
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


// resolve indirect facebook links into real links...
// (or just return the direct url if it looks like one)
function urlFromLink(a) {
    var foo = a.href;
    if( foo.indexOf('/l.php') == -1 ) {
        return foo;
    }

    // it's an indirect tracking link...
    return getParam('u', a.href);
}



// grab link from a post if there is one.
// if it's an external link, try to also grab headline/description
// returns null if no media/link thingy.
function scrapeLink(art) {

    // .mtm seems to be a generic media container - link, photo, video etc...
    var mtm = art.querySelector('.mtm');
    if (mtm==null) {
        return null;    // no media
    }

    var vid = mtm.querySelector('video');
    if (vid) {
        return {
            url: vid.src,
            title: "video",
            desc: ""
        }
    }


    var mbs = mtm.querySelector('.mbs');
    if (mbs) {
        // there should be title/description/photo
        var a = mbs.querySelector('a');
        if (!a) {
            return null;
        }

        return {
            url:    urlFromLink(a),
            title:  a.textContent,
            desc:   a.parentNode.nextSibling.textContent,
        }
    }

    // if we get this far, just take the first link and leave it at that
    var a = mtm.querySelector('a');
    if (a) {
        return {
            url: urlFromLink(a),
            title: "",
            desc: ""
        };
    }

    // nope. nothing.
    return null;
}


// "1.4k Sad" => [1400,"sad"]
// "" => null
function parseReact(s) {
    var pat = /\s*([\d.]+)([kM]?)\s*(.*)\s*/g
    var m = pat.exec(s)
    if (m===null) {
        return null;
    }

    var n = Number(m[1]);
    var unit = m[2];
    if(unit=="k") {
        n = n*1000;
    } else if (unit=="M") {
        n = n*1000000;
    }
    var which = m[3].toLowerCase();

    return [n,which];
}


function scrapeReacts(art) {
    var reacts = {
        'like':0,
        'love':0,
        'haha':0,
        'wow':0,
        'sad':0,
        'angry':0
    }

    var icons = art.querySelectorAll('span[aria-label="See who reacted to this"] a[aria-label]')
    for (var i=0; i<icons.length; ++i) {
        var txt = icons[i].getAttribute("aria-label");  // "1.4k Sad" etc
        var r = parseReact(txt);
        if( r !== null ) {
            reacts[r[1]] = r[0];
        }
    }

    return reacts;
}


// find the unique id for this post/entry/whatever
function scrapeID( art ) {
    var inp = art.querySelector('form.commentable_item input[name="ft_ent_identifier"]');
    if (!inp) {
        return null;
    }
    return inp.value;
}


function scrape(art) {
    var id = scrapeID(art);
    if (id===null) {
        // TODO: could do more here?
        return null;
    }
    var heading = art.querySelector('h5 .fcg');
    var content = art.querySelector('.userContent');
    var timeStamp = art.querySelector('abbr[data-utime]');

    var ut = "0";
    if (timeStamp) {
        ut = timeStamp.getAttribute("data-utime");
    }

    return {
        root: art,
        id: id,
        posted: ut,
        desc: heading ? heading.textContent : "",
        txt: content ? content.textContent : "",
        link: scrapeLink(art),
        reacts: scrapeReacts(art)
    };
}


function isPeopleYouMayKnow(art) {
    // check for:
    // <span class="fwb fcb">People you may know</span>
    var foo = art.querySelectorAll('span.fwb.fcb');
    for (var i=0; i<foo.length; ++i) {
        if( foo[i].textContent == "People you may know" )
            return true;
    }
    return false;
}




function scan(nod) {
    var arts = nod.querySelectorAll('[role="article"]');
    var scraped = [];
    for (var j=0; j<arts.length; ++j) {
        var art = arts[j];
        if (isPeopleYouMayKnow(art)) {
            continue;
        }
        if (art.classList.contains("UFIComment")) {
            // comments have role="article". sigh.
            continue;
        }


        var details = scrape(arts[j]);
        if (details === null) {
            continue;
        }
        scraped.push(details);

//        chrome.runtime.sendMessage(details);

    }

    if (scraped.length > 0) {
        stash(scraped);
    }

}


function stash(arts) {
    var foo = {};
    for( var i=0; i<arts.length; i++) {
        var art = arts[i];
        foo[art.id] = art;
    }
    chrome.storage.local.set(foo, function() {});
}



/*****************/


// set up to scan any new stuff added to the page
// (ie pick up new items as they stream in, probably because
// the user is scrolling down)
var obs = new MutationObserver(function (mutations, observer) {
    for (var i = 0; i < mutations[0].addedNodes.length; i++) {
        var nod = mutations[0].addedNodes[i];
        if (nod.nodeType == 1) {
            scan(nod)
        }
    }
});


// initial scan - find stuff already on page
var contentArea = document.querySelector("#contentArea");
if(contentArea!=null) {
    scan(contentArea);
}



obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });



