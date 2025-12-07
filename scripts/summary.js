// summary.js - Greeting handling (replace existing file / function)

function getCurrentUser() {
  // Versuche zuerst zentrale Funktion (falls vorhanden)
  if (typeof window.getCurrentUser === "function") {
    try {
      return window.getCurrentUser();
    } catch (e) {
      /* fallback */
    }
  }

  // Fallback: aus localStorage lesen
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return null;
  }
}

// Function for greeting (Splash + right side)
function showGreeting() {
  const body = document.body;
  const splashScreen = document.getElementById("greeting-splash");
  const greetNameSplash = document.getElementById("greet-name-splash");
  const greetTextSplash = document.querySelector(
    ".greeting-splash .greet-text"
  );

  const greetNameMain = document.getElementById("greet-name");
  const greetTextMain = document.querySelector(".kpi-right .greet-text");

  // Add body class to prevent scrolling (for splash)
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

  // --- Splash greeting ---
  if (greetNameSplash && greetTextSplash) {
    if (shouldShowName(user)) {
      greetNameSplash.textContent = user.name;
      greetNameSplash.style.display = "block";
      greetTextSplash.textContent = "Good morning,";
    } else {
      // No name (guest or not logged in) -> only "Good morning," without name
      greetNameSplash.style.display = "none";
      greetTextSplash.textContent = "Good morning!";
    }
  }

  // --- Main page top right greeting (e.g. desktop display) ---
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

  // Hide splash immediately on desktop, show on mobile
  if (window.innerWidth <= 640) {
    // Mobile: show splash animation
    setTimeout(() => {
      body.classList.remove("splash-active");
      if (splashScreen) {
        splashScreen.style.display = "none";
      }
    }, 4500);
  } else {
    // Desktop: hide splash immediately
    body.classList.remove("splash-active");
    if (splashScreen) {
      splashScreen.style.display = "none";
    }
  }
}
