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

function doreg(form, data) {
    chrome.runtime.getBackgroundPage( function(bg) {
        var onErr = function(errmsg) {
            var stat =  form.querySelector(".status");
            stat.classList.add("alert");
            stat.classList.add("alert-danger");
            stat.innerHTML = errmsg;
        };
        var onSuccess = function() {
            console.log("success");
            // TODO: close tab here!
        };

    console.log("bing1", data);
        bg.registerUser(data, onSuccess, onErr );
    });
}

form1.addEventListener("submit", function(ev) {
    ev.preventDefault();
    var data = {
        "ge2017": form1.ge2017.value
    };
    doreg(form1,data);
}, false);

form2.addEventListener("submit", function(ev) {
    ev.preventDefault();

    var data = {
        "postcode": form2.postcode.value,
        "age": form2.age.value,
        "gender": form2.gender.value,
    };

    doreg(form2,data);
}, false);

})();

