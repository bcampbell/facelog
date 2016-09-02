var postList = document.getElementById("post-list");
var clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", function() {
    chrome.storage.local.clear();
} , false);



function present(post) {
    var li = document.createElement( 'li' );
    li.classList.add('facelog-item');
    var h5 = document.createElement( 'h5' );
    h5.textContent = post.desc;
    li.appendChild(h5);


    var postDiv = document.createElement('div');
    postDiv.classList.add('facelog-post');

    var posted = new Date(post.posted*1000).toISOString();


    var contentDiv = document.createElement('div');
    contentDiv.classList.add('facelog-content');
    contentDiv.textContent = post.id + " -- " + posted + " -- " + post.txt + " -- " + post.reacts;
    postDiv.appendChild(contentDiv);

    if (post.link!=null) {
        var l = post.link;
        var linksDiv = document.createElement('div');
        linksDiv.classList.add('facelog-links');
        var link = document.createElement('a');
        link.textContent = l.title!="" ? l.title : l.url;
        link.href= l.url;
        linksDiv.appendChild(link);
        postDiv.appendChild(linksDiv);
        if (l.desc!= "" ) {
            var desc = document.createElement('div');
            desc.innerText = l.desc;
            linksDiv.appendChild(desc);
        }
    }

    li.appendChild(postDiv);

    return li;
}



function updatePost(id,post) {
    var old = document.getElementById("post-"+id);

    if( post === undefined ) {
        console.log("byebye ", id);
        if (old !== null) {
            console.log("byebye ", old);
            postList.removeChild(old);
        }
        return;
    }


    var li = present(post);
    li.id = "post-"+post.id;
    if(old !== null ) {
        console.log("replace " +id);
        postList.replaceChild(li,old);
    } else {
        console.log("new " + id);
        postList.appendChild(li);
    } 

}

// initialise
chrome.storage.local.get(null, function(items) {
    for (key in items) {
        var post = items[key];
        updatePost(post.id, post);
    }
});

// monitor ongoing changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        var post = storageChange.newValue;
        updatePost(key, post);
    }
});



