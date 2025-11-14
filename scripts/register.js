// 🔔 Notification-Funktion (unverändert)
function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);

  // Automatisch entfernen nach 3.2s
  setTimeout(() => notif.remove(), 3200);
}

// Helfer für reCAPTCHA (für Phone Auth, falls du's brauchst)
let recaptchaVerifier;
function initRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA gelöst – kannst hier fortfahren
      },
      'expired-callback': () => {
        showNotification("reCAPTCHA abgelaufen – bitte neu laden.", "error");
      }
    });
  }
}

async function addUser() {  // Email/Password Signup – Check nur hier beim Submit
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
    return;  // Hier kommt die Meldung nur beim Klick auf "Sign up"
  }

  try {
    console.log("Starte Signup mit Email:", email);  // Debug-Log (kannst löschen)
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;
    console.log("User erstellt:", user.uid);  // Debug-Log

    await updateProfile(user, { displayName: name });
    console.log("Profil updated");  // Debug-Log

    await set(ref(firebaseDb, 'users/' + user.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString()
    });
    console.log("Daten in RTDB gespeichert");  // Debug-Log

    showNotification("✅ Du hast dich erfolgreich registriert!", "success");

    setTimeout(() => {
      window.location.href = "index.html?msg=Erfolgreich registriert";
    }, 2000);
  } catch (error) {
    console.error("Signup Error Details:", error.code, error.message);  // Debug-Log
    let errorMessage = "❌ Fehler bei der Registrierung: " + error.message;
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Diese E-Mail ist bereits registriert!";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Passwort zu schwach (mind. 6 Zeichen).";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Ungültige E-Mail-Adresse.";
    } else if (error.code === "auth/network-request-failed") {
      errorMessage = "Netzwerk-Fehler – check Internet oder Firewall.";
    } else if (error.code === "auth/invalid-api-key") {
      errorMessage = "Falscher API-Key – überprüfe Config.";
    }
    showNotification(errorMessage, "error");
  }
}

async function login() {  // Unverändert
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    showNotification("Bitte fülle alle Felder aus.", "error");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;

    showNotification("✅ Erfolgreich eingeloggt!", "success");

    localStorage.setItem("loggedInUser", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName
    }));

    setTimeout(() => {
      window.location.href = "board.html";
    }, 1500);
  } catch (error) {
    let errorMessage = "❌ Falsche E-Mail oder Passwort.";
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMessage = "Falsche Anmeldedaten.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Ungültige E-Mail.";
    }
    showNotification(errorMessage, "error");
    console.error("Login Error:", error);
  }
}

async function guestLogin() {  // Unverändert
  try {
    const userCredential = await signInAnonymously(firebaseAuth);
    const user = userCredential.user;

    await set(ref(firebaseDb, 'users/' + user.uid), {
      name: "Guest",
      email: "guest@joinapp.local",
      isGuest: true,
      createdAt: new Date().toISOString()
    });

    showNotification("👋 Eingeloggt als Gast", "success");

    localStorage.setItem("loggedInUser", JSON.stringify({
      uid: user.uid,
      name: "Guest",
      email: "guest@joinapp.local",
      isGuest: true
    }));

    setTimeout(() => {
      window.location.href = "board.html";
    }, 1500);
  } catch (error) {
    showNotification("❌ Fehler beim Gast-Login.", "error");
    console.error("Guest Login Error:", error);
  }
}

// Phone-Funktionen (optional, unverändert – falls du's nicht brauchst, lösche sie)
async function phoneSignup() {
  initRecaptcha();
  const phone = document.getElementById("phone").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!phone) {
    showNotification("Bitte Telefonnummer eingeben (z.B. +49123456789).", "error");
    return;
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
    window.confirmationResult = confirmationResult;

    showNotification("SMS mit Code gesendet! Gib den Code ein.", "success");
  } catch (error) {
    showNotification("❌ Fehler beim Senden des Codes.", "error");
    console.error("Phone Signup Error:", error);
    recaptchaVerifier.render().then(widgetId => grecaptcha.reset(widgetId));
  }
}

async function confirmPhoneCode() {
  const code = document.getElementById("phone-code").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!code) {
    showNotification("Bitte Code eingeben.", "error");
    return;
  }

  try {
    const result = await window.confirmationResult.confirm(code);
    const user = result.user;

    await updateProfile(user, { displayName: name });
    await set(ref(firebaseDb, 'users/' + user.uid), {
      name: name || "Phone User",
      phone: user.phoneNumber,
      createdAt: new Date().toISOString()
    });

    showNotification("✅ Erfolgreich mit Phone registriert/eingeloggt!", "success");

    localStorage.setItem("loggedInUser", JSON.stringify({
      uid: user.uid,
      phone: user.phoneNumber,
      name: user.displayName
    }));

    setTimeout(() => {
      window.location.href = "board.html";
    }, 1500);
  } catch (error) {
    showNotification("❌ Falscher Code oder Fehler.", "error");
    console.error("Phone Confirm Error:", error);
  }
}