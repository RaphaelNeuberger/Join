// Funktion für Begrüßung
function showGreeting() {
  const body = document.body;
  const splashScreen = document.getElementById("greeting-splash");
  const greetNameElement = document.getElementById("greet-name-splash");

  // Body-Klasse hinzufügen um Scrollen zu verhindern
  body.classList.add("splash-active");

  // Optional: Namen dynamisch setzen
  const user = getCurrentUser(); // Deine User-Funktion
  if (user && user.name) {
    greetNameElement.textContent = user.name;
  } else {
    greetNameElement.textContent = "";
    document.querySelector(".greeting-splash .greet-text").textContent =
      "Good morning!";
  }

  // Nach Animation (3s + 1.5s delay = 4.5s) Splash entfernen und Scrollen erlauben
  setTimeout(() => {
    body.classList.remove("splash-active");
    if (splashScreen) {
      splashScreen.style.display = "none";
    }
  }, 4500);
}
