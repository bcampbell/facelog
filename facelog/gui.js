var postList = document.getElementById("post-list");
var clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", function() {
    chrome.storage.local.clear();
} , false);

var uploadButton = document.getElementById("upload-button");
uploadButton.addEventListener("click", function() {
   // dumpToServer();
}, false);



function present(post) {
   var tmpl = '<td>{{posted}}</td><td>{{desc}}</td><td class="w">{{txt}}</td><td><a href="{{link_url}}">{{link_url}}</a></td><td class="w">{{link_title}}</td><td class="w">{{link_desc}}</td><td>{{like}}</td><td>{{love}}</td><td>{{haha}}</td><td>{{wow}}</td><td>{{sad}}</td><td>{{angry}}</td>\n';

    var reacts = post.reacts;
    var link = (post.link!==null) ? post.link : {url:"",title:"",desc:""};
    var params = {
        id: post.id,
        posted: new Date(post.posted*1000).toISOString(),
        desc: post.desc,
        txt: post.txt,
        link_url: link.url,
        link_title: link.title,
        link_desc: link.desc,
        like: reacts.like,
        love: reacts.love,
        haha: reacts.haha,
        wow: reacts.wow,
        sad: reacts.sad,
        angry: reacts.angry
    };

    return Mustache.to_html(tmpl,params);
}



function updatePost(id,post) {
    var old = document.getElementById("post-"+id);
    if( post === undefined ) {
        if (old !== null) {
            postList.removeChild(old);
        }
        return;
    }

    var tr = document.createElement( 'tr' );
    tr.innerHTML = present(post);
    tr.id = "post-"+post.id;
    if(old !== null ) {
        postList.replaceChild(tr,old);
    } else {
        postList.appendChild(tr);
    } 

}


// show bytes used etc
function updateInfo() {
    chrome.storage.local.getBytesInUse(null, function(bytesInUse) {
        var infDiv = document.getElementById("info");

        var quota = chrome.storage.local.QUOTA_BYTES;
        var tmpl = 'Storing {{bytesInUse}} bytes ({{perc}}% full)';
        var html = Mustache.to_html(tmpl, {
            bytesInUse:bytesInUse,
            quota:quota,
            perc:((bytesInUse*100)/quota).toFixed(1) });
        infDiv.innerHTML = html;
    });
}


// initialise
chrome.storage.local.get(null, function(items) {
    for (var key in items) {
        if (key.indexOf("post-") != 0) {
            continue;
        }
        var post = items[key];
        //console.log( key,post);
        updatePost(post.id, post);
    }
    updateInfo();
});

// monitor ongoing changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        if (key.indexOf("post-") != 0) {
            continue;
        }
        var storageChange = changes[key];
        var post = storageChange.newValue;
        if (!post) {
            // deleting - need to extract id from key (ie strip "post-" prefix)
            var foo = key.replace(/^post-/, '');
            updatePost(foo, post);
        } else {
            updatePost(post.id, post);
        }
    }
    updateInfo();
});

