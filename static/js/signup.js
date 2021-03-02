function validateSignupForm() {
  let signupForm = document.forms["signupForm"];

  let password = document.getElementById("password");
  let confirmPassword = document.getElementById("confirmPassword");

  if (password.value != confirmPassword.value) {
    alert("Given Passwords Don't Match");
    password.value = "";
    confirmPassword.value = "";
  } else if (password.value.length < 6) {
    alert("Password is too small, it has to be >= 6");
    password.value = "";
    confirmPassword.value = "";
  } else {
    signupForm.submit();
  }
}
