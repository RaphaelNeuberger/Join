let users = [{ email: "junus@test.de", password: "tes123" }];

function addUser() {
  let email = document.getElementById("email");
  let password = document.getElementById("password");
  users.push({ user: email.value, password: password.value });
  //Weiterleitung zur Login Seite + Nachricht anzeigen 

  window.location.href = 'login.html?msg=Du hast dich erfolgreich registriert';
}

//from onsubmit ="login()"
// form onsubmit="addUser(); return false;" ... inputs

// const urlParams = new URLSearchParams(window.location.search);
// const msg = urlParams.get('msg');

// if (msg) {
//   msgBox.innerHTML = msg;
// } else {
//   display = none
// }

function login() {
  let email = document.getElementById("email");
  let password = document.getElementById("password");
  let user = users.find( (u) => u.email === email.value && u.password === password.value );
  console.log();
  if (user) {
    alert("Erfolgreich eingeloggt"); }
  else {
    alert("Falsche E-Mail oder Passwort");
  }