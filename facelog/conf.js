(function() {
var form1 = document.getElementById("form1");
var form2 = document.getElementById("form2");



function regUser(details) {
    var req = new XMLHttpRequest();
    req.open('POST', 'http://localhost:8080/register', true);
    req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    req.addEventListener("load", function(ev) {
        console.log("sent: ", ev);
    });
    req.addEventListener("error", function(ev) {
        console.log("poop: ", ev);
    });
    console.log("sending registration details",details);
    req.send( JSON.stringify(details) );
}



form1.addEventListener("submit", function(ev) {
    ev.preventDefault();
    var user = {
        "ipsosmori": form1.ipsosmori.value
    };
    chrome.runtime.getBackgroundPage( function(bg) {
        var onErr = function(errmsg) {
            console.log("ERROR: " + errmsg);
            // TODO: show on form
        };
        var onSuccess = function() {
            console.log("success");
            // TODO: close tab here!
        };

        bg.registerUser(user, onSuccess, onErr );
    });
}, false);

form2.addEventListener("submit", function(ev) {
    ev.preventDefault();

    var user = {
        "country": form2.country.value,
        "postcode": form2.postcode.value,
        "age": form2.age.value,
        "gender": form2.gender.value,
    };

    chrome.runtime.getBackgroundPage( function(bg) {
        var onErr = function(errmsg) {
            console.log("ERROR: " + errmsg);
            // TODO: show on form
        };
        var onSuccess = function() {
            console.log("success");
            // TODO: close tab here!
        };
        bg.registerUser(user, onSuccess, onErr );
    });
}, false);

})();
