
function createLogList() {
    var div = document.createElement( 'div' );
    var showHide = document.createElement( 'a' );
    showHide.textContent = "Show/Hide";
    showHide.classList.add('facelog-showhide');

    var ul = document.createElement( 'ul' );

    //append all elements
    document.body.appendChild( div );
    div.appendChild( showHide );
    div.appendChild( ul );
//    btnForm.appendChild( btn );
    //set attributes for div
    div.id = 'myDivId';


    showHide.addEventListener("click", function() {
        div.classList.toggle('facelog-is-big');
    }, false);


    /*
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style["z-index"] = '9999';
    div.style.left = "0";
    div.style.width = '30em';   
    div.style.height = '100%';
    div.style.backgroundColor = '#eee';

    ul.style.overflow = "auto";
    ul.style.border = "1px solid black";
    ul.style.height = '100%';
*/
    return ul;
}

var logList = createLogList();

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


function scrapeID( art ) {
    var inp = art.querySelector('form.commentable_item input[name="ft_ent_identifier"]');
    if (!inp) {
        return "???";
    }
    return inp.value;
}


function scrape(art) {
    var heading = art.querySelector('h5 .fcg');
    var content = art.querySelector('.userContent');
    var timeStamp = art.querySelector('abbr[data-utime]');

    var ut = timeStamp.getAttribute("data-utime")

    return {
        root: art,
        id: scrapeID(art),
        posted: ut,
        desc: heading ? heading.textContent : "",
        txt: content ? content.textContent : "",
        link: scrapeLink(art)
    };
}

function present(details) {
    console.log("present: ", details);
    var li = document.createElement( 'li' );
    li.classList.add('facelog-item');
    var h5 = document.createElement( 'h5' );
    h5.textContent = details.desc;
    li.appendChild(h5);


    var detailsDiv = document.createElement('div');
    detailsDiv.classList.add('facelog-details');

    var posted = new Date(details.posted*1000).toISOString();


    var contentDiv = document.createElement('div');
    contentDiv.classList.add('facelog-content');
    contentDiv.textContent = details.id + " -- " + posted + " -- " + details.txt;
    detailsDiv.appendChild(contentDiv);

    if (details.link!=null) {
        var l = details.link;
        var linksDiv = document.createElement('div');
        linksDiv.classList.add('facelog-links');
        var link = document.createElement('a');
        link.textContent = l.title!="" ? l.title : l.url;
        link.href= l.url;
        linksDiv.appendChild(link);
        detailsDiv.appendChild(linksDiv);
        if (l.desc!= "" ) {
            var desc = document.createElement('div');
            desc.innerText = l.desc;
            linksDiv.appendChild(desc);
        }
    }

    li.appendChild(detailsDiv);
    return li;
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
        var infoDiv = present(details);
        logList.appendChild(infoDiv);
    }
}




/*****************/


var obs = new MutationObserver(function (mutations, observer) {
    for (var i = 0; i < mutations[0].addedNodes.length; i++) {
        var nod = mutations[0].addedNodes[i];
        if (nod.nodeType == 1) {
            scan(nod)
        }
    }
});

var contentArea = document.querySelector("#contentArea");
if(contentArea!=null) {
    scan(contentArea);
    console.log("scanned #contentArea")
}else {
    console.log("No #contentArea")
}



obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });



