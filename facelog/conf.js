(function() {
var form1 = document.getElementById("form1");
var form2 = document.getElementById("form2");



function doreg(form, data) {
    chrome.runtime.getBackgroundPage( function(bg) {
        var onErr = function(errmsg) {
            var stat =  form.querySelector(".status");
            stat.classList.add("alert");
            stat.classList.add("alert-danger");
            stat.innerHTML = errmsg;
        };
        var onSuccess = function() {
            // redirect to thankyou/intro page
            chrome.tabs.getCurrent(function (tab) {
                chrome.tabs.update(tab.id, {url: "thanks.html"});
            });
        };

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

