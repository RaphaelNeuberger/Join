function getCurrentUser() {
  if (typeof window.getCurrentUser === "function") {
    try { return window.getCurrentUser(); } catch (e) {}
  }
  try {
    const raw = localStorage.getItem("loggedInUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function shouldShowName(u) {
  if (!u || typeof u.name === "undefined" || u.name === null) return false;
  const nm = String(u.name).trim();
  return nm && nm.toLowerCase() !== "guest";
}

function updateGreetingElement(nameEl, textEl, user, displayStyle) {
  if (!nameEl || !textEl) return;
  if (shouldShowName(user)) {
    nameEl.textContent = user.name;
    nameEl.style.display = displayStyle;
    textEl.textContent = "Good morning,";
  } else {
    nameEl.style.display = "none";
    textEl.textContent = "Good morning!";
  }
}

function hideSplashScreen(body, splashScreen) {
  body.classList.remove("splash-active");
  if (splashScreen) splashScreen.style.display = "none";
}

function showGreeting() {
  const body = document.body;
  const splashScreen = document.getElementById("greeting-splash");
  body.classList.add("splash-active");
  const user = getCurrentUser();
  updateGreetingElement(document.getElementById("greet-name-splash"), document.querySelector(".greeting-splash .greet-text"), user, "block");
  updateGreetingElement(document.getElementById("greet-name"), document.querySelector(".kpi-right .greet-text"), user, "inline");
  if (window.innerWidth <= 640) setTimeout(() => hideSplashScreen(body, splashScreen), 4500);
  else hideSplashScreen(body, splashScreen);
}
