// Funktion für Begrüßung
function showGreeting() {
  const body = document.body;
  const splashScreen = document.getElementById("greeting-splash");
  const greetNameElement = document.getElementById("greet-name-splash");
  const greetTextElement = document.querySelector(
    ".greeting-splash .greet-text"
  );

  // Body-Klasse hinzufügen um Scrollen zu verhindern
  body.classList.add("splash-active");

  // Namen dynamisch setzen
  const user = getCurrentUser(); // Deine User-Funktion
  if (user && user.name && user.name.toLowerCase() !== "guest") {
    greetNameElement.textContent = user.name;
    greetNameElement.style.display = "block";
    greetTextElement.textContent = "Good morning,";
  } else {
    // Guest oder kein User
    greetNameElement.style.display = "none";
    greetTextElement.textContent = "Good morning!";
  }

  // Nach Animation (3s + 1.5s delay = 4.5s) Splash entfernen und Scrollen erlauben
  setTimeout(() => {
    body.classList.remove("splash-active");
    if (splashScreen) {
      splashScreen.style.display = "none";
    }
  }, 4500);
}
