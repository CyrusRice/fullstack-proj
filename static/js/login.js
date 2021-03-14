const userIdEl = document.getElementById("userid");

userIdEl.addEventListener("change", function () {
  sessionStorage.setItem("login-event", userIdEl.value + ":" + Math.random());
});

$(document).ready(function() {
    sessionStorage.clear()
})


