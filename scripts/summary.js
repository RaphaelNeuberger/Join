function getCurrentUser() {
  if (typeof window.getCurrentUser === "function") {
    try {
      return window.getCurrentUser();
    } catch (e) {
    }
  }

  try {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return null;
  }
}

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

  const user = getCurrentUser();

  const shouldShowName = (u) => {
    if (!u) return false;
    if (typeof u.name === "undefined" || u.name === null) return false;
    const nm = String(u.name).trim();
    if (!nm) return false;
    if (nm.toLowerCase() === "guest") return false;
    return true;
  };

  if (greetNameSplash && greetTextSplash) {
    if (shouldShowName(user)) {
      greetNameSplash.textContent = user.name;
      greetNameSplash.style.display = "block";
      greetTextSplash.textContent = "Good morning,";
    } else {
      greetNameSplash.style.display = "none";
      greetTextSplash.textContent = "Good morning!";
    }
  }

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

  if (window.innerWidth <= 640) {
    setTimeout(() => {
      body.classList.remove("splash-active");
      if (splashScreen) {
        splashScreen.style.display = "none";
      }
    }, 4500);
  } else {
    body.classList.remove("splash-active");
    if (splashScreen) {
      splashScreen.style.display = "none";
    }
  }
}
