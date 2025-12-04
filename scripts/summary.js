// summary.js - Begrüßungs-Handling (ersetze vorhandene Datei / Funktion)

function getCurrentUser() {
  // Versuche zuerst zentrale Funktion (falls vorhanden)
  if (typeof window.getCurrentUser === "function") {
    try { return window.getCurrentUser(); } catch (e) { /* fallback */ }
  }

  // Fallback: aus localStorage lesen
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.warn("Could not read loggedInUser from localStorage", e);
    return null;
  }
}

// Funktion für Begrüßung (Splash + rechte Seite)
function showGreeting() {
  const body = document.body;
  const splashScreen = document.getElementById("greeting-splash");
  const greetNameSplash = document.getElementById("greet-name-splash");
  const greetTextSplash = document.querySelector(".greeting-splash .greet-text");

  const greetNameMain = document.getElementById("greet-name");
  const greetTextMain = document.querySelector(".kpi-right .greet-text");

  // Body-Klasse hinzufügen um Scrollen zu verhindern (für Splash)
  body.classList.add("splash-active");

  // Namen dynamisch setzen
  const user = getCurrentUser();

  // Hilfsfunktion: entscheidet, ob wir einen Namen anzeigen sollen
  const shouldShowName = (u) => {
    if (!u) return false;
    if (typeof u.name === "undefined" || u.name === null) return false;
    const nm = String(u.name).trim();
    if (!nm) return false;
    if (nm.toLowerCase() === "guest") return false;
    return true;
  };

  // --- Splash-Gruß ---
  if (greetNameSplash && greetTextSplash) {
    if (shouldShowName(user)) {
      greetNameSplash.textContent = user.name;
      greetNameSplash.style.display = "block";
      greetTextSplash.textContent = "Good morning,";
    } else {
      // Kein Name (Gast oder nicht eingeloggt) -> nur "Good morning," ohne Namen
      greetNameSplash.style.display = "none";
      greetTextSplash.textContent = "Good morning!";
    }
  }

  // --- Hauptseite rechts oben Gruß (z.B. Desktop Anzeige) ---
  if (greetTextMain && greetNameMain) {
    if (shouldShowName(user)) {
      greetNameMain.textContent = user.name;
      greetNameMain.style.display = "inline";
      greetTextMain.textContent = "Good morning,";
    } else {
      greetNameMain.style.display = "none";
      greetTextMain.textContent = "Good morning!";
    }
  }

  // Nach Animation (4.5s) Splash entfernen und Scrollen erlauben
  setTimeout(() => {
    body.classList.remove("splash-active");
    if (splashScreen) {
      splashScreen.style.display = "none";
    }
  }, 4500);
}
