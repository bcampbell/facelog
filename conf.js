(function() {
var form = document.getElementById("form-register");

form.addEventListener("submit", function(ev) {
    ev.preventDefault();

    var foo = {
        "postcode": form.postcode.value,
        "age": form.age.value,
        "gender": form.gender.value,
    };
    console.log(foo);

}, false);

})();

