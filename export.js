// cheesy method to save a file:
// build up the data and encode it in a data: url.
// Then create a <a> element which has that url as it's href,
// and programmatically click it. ugh.
function saveCSV() {
    chrome.storage.local.get(null, function(items) {
        rows = [];
        headings="id, posted, desc, txt, link.url, link.title, link.desc, reacts.like, reacts.love, reacts.haha, reacts.wow, reacts.sad, reacts.angry";
        rows.push(headings);
        for (key in items) {
            var post = items[key];
            var link = post.link;
            if (link===null) { link = {}; }
            var reacts = post.reacts;
            if (reacts===null) { reacts = {}; }
            var posted = new Date(post.posted*1000).toISOString();
            var row=[
                post.id,
                posted,
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
                reacts.angry
            ];
            row = row.map(function(fld) {
                return (fld===undefined) ? "" : escapeCSV(fld);
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

    });
}

function escapeCSV(fld) {
    var cooked = fld.replace(/"/g, '""');
    if (cooked.search(/[",\n]/g) >= 0) {
        return '"' + cooked + '"';
    } else {
        return cooked;
    }
}


saveCSV();

