var input = document.getElementById("input");

var enter = document.getElementById("enter");
enter.addEventListener("click", check);

function check() {
    if (input.value == "P@nkukas123") {
        window.location.href = "http://127.0.0.1:5501/Pankuka/index.html"
    } else {
        alert("Nepareiza atslēga!");
  }
}


