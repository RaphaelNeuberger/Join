let users = JSON.parse(localStorage.getItem("users")) || [
  { email: "junus@test.de", password: "tes123" }
];

function addUser() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if (!name || !email || !password || !confirmPassword) {
    showNotification("Bitte fülle alle Felder aus.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("⚠️ Passwörter stimmen nicht überein!", "error");
    return;
  }

  const userExists = users.some(u => u.email === email);
  if (userExists) {
    showNotification("Diese E-Mail ist bereits registriert!", "error");
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  // 🎉 Schönes Erfolgs-Popup
  showNotification("✅ Du hast dich erfolgreich registriert!", "success");

  // Nach 2 Sekunden weiterleiten
  setTimeout(() => {
    window.location.href = "index.html?msg=Erfolgreich registriert";
  }, 2000);
}

// 🔔 Notification-Funktion
function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);

  // Automatisch entfernen nach 3.2s (wie die Animation)
  setTimeout(() => notif.remove(), 3200);
}

function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // 1️⃣ Eingaben prüfen
  if (!email || !password) {
    showNotification("Bitte fülle alle Felder aus.", "error");
    return;
  }

  // 2️⃣ Nutzer suchen
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    showNotification("✅ Erfolgreich eingeloggt!", "success");
    // optional: Nutzername speichern
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    // 3️⃣ Weiterleitung nach kurzer Pause
    setTimeout(() => {
      window.location.href = "board.html"; // Zielseite anpassen
    }, 1500);
  } else {
    showNotification("❌ Falsche E-Mail oder Passwort.", "error");
  }
}

function guestLogin() {
  const guestUser = { 
    name: "Guest", 
    email: "guest@joinapp.local", 
    isGuest: true 
  };

  localStorage.setItem("loggedInUser", JSON.stringify(guestUser));
  showNotification("👋 Eingeloggt als Gast", "success");

  // nach kurzer Pause weiterleiten
  setTimeout(() => {
    window.location.href = "board.html";
  }, 1500);
}
