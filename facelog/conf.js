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
    regUser({ "ipsosmori": form1.ipsosmori.value });
}, false);

form2.addEventListener("submit", function(ev) {
    ev.preventDefault();

    regUser({
        "country": form2.country.value,
        "postcode": form2.postcode.value,
        "age": form2.age.value,
        "gender": form2.gender.value,
    });
}, false);

})();

