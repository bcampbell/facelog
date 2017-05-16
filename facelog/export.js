// cheesy method to save a file:
// build up the data and encode it in a data: url.
// Then create a <a> element which has that url as it's href,
// and programmatically click it. ugh.
function saveCSV() {
    chrome.storage.local.get(null, function(items) {
        rows = [];
        headings="id,seen,posted,desc,txt,link_url,link_title,link_desc,like,love,haha,wow,sad,angry,page";
        rows.push(headings);
        for (key in items) {
            var post = items[key];
            var link = post.link;
            if (link===null) { link = {url:"", title:"", desc:""}; }
            var reacts = post.reacts;
            var row=[
                post.id,
                post.seen,
                post.posted,
                post.desc,
                post.txt,
                link.url,
                link.title,
                link.desc,
                reacts.like,
                reacts.love,
                reacts.haha,
                reacts.wow,
                reacts.sad,
                reacts.angry,
                post.page
            ];
            row = row.map(function(fld) {
                return escapeCSV(fld.toString());
            });
            rows.push( row.join(",") );
        }

        var file = new Blob([rows.join("\n")],{type: "text/csv"} );

        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(file);
        a.download = 'facelog.csv';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        delete a;
        // TODO: show message confirming export was performed
    });
}

function escapeCSV(fld) {
    console.log(fld);
    var cooked = fld.replace(/"/g, '""');
    if (cooked.search(/[",\n]/g) >= 0) {
        return '"' + cooked + '"';
    } else {
        return cooked;
    }
}


saveCSV();

