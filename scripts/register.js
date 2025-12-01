function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);

  setTimeout(() => notif.remove(), 3200);
}

let recaptchaVerifier;
function initRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
      },
      'expired-callback': () => {
        showNotification("reCAPTCHA abgelaufen – bitte neu laden.", "error");
      }
    });
  }
}

async function addUser() {
  const n = v => document.getElementById(v).value.trim(), name = n("name"), email = n("email"), pw = n("signup-password"), cpw = n("confirm-password");
  if (!name || !email || !pw || !cpw) return showNotification("Bitte fülle alle Felder aus.", "error");
  if (pw !== cpw) return showNotification("⚠️ Passwörter stimmen nicht überein!", "error");
  try {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, pw);
    await updateProfile(user, { displayName: name });
    await set(ref(firebaseDb, 'users/' + user.uid), { name, email, createdAt: new Date().toISOString() });
    showNotification("✅ Du hast dich erfolgreich registriert!", "success");
    setTimeout(() => window.location.href = "index.html?msg=Erfolgreich registriert", 2000);
  } catch (e) {
    let m = "❌ Fehler bei der Registrierung: " + e.message;
    if (e.code === "auth/email-already-in-use") m = "Diese E-Mail ist bereits registriert!";
    else if (e.code === "auth/weak-password") m = "Passwort zu schwach (mind. 6 Zeichen).";
    else if (e.code === "auth/invalid-email") m = "Ungültige E-Mail-Adresse.";
    else if (e.code === "auth/network-request-failed") m = "Netzwerk-Fehler – check Internet oder Firewall.";
    else if (e.code === "auth/invalid-api-key") m = "Falscher API-Key – überprüfe Config.";
    showNotification(m, "error");
  }
}


async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password) return showNotification("Bitte fülle alle Felder aus.", "error");
  try {
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    showNotification("✅ Erfolgreich eingeloggt!", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, email: user.email, name: user.displayName }));
    setTimeout(() => window.location.href = "summary.html", 1500);
  } catch (e) {
    let msg = "❌ Falsche E-Mail oder Passwort.";
    if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password") msg = "Falsche Anmeldedaten.";
    else if (e.code === "auth/invalid-email") msg = "Ungültige E-Mail.";
    showNotification(msg, "error"); console.error("Login Error:", e);
  }
}


async function guestLogin() {
  try {
    const { user } = await signInAnonymously(firebaseAuth);
    await set(ref(firebaseDb, 'users/' + user.uid), { name: "Guest", email: "guest@joinapp.local", isGuest: true, createdAt: new Date().toISOString() });
    showNotification("👋 Eingeloggt als Gast", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, name: "Guest", email: "guest@joinapp.local", isGuest: true }));
    setTimeout(() => window.location.href = "summary.html", 1500);
  } catch (e) {
    showNotification("❌ Fehler beim Gast-Login.", "error");
    console.error("Guest Login Error:", e);
  }
}


async function phoneSignup() {
  initRecaptcha();
  const phone = document.getElementById("phone").value.trim();
  if (!phone) return showNotification("Bitte Telefonnummer eingeben (z.B. +49123456789).", "error");
  try {
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    showNotification("SMS mit Code gesendet! Gib den Code ein.", "success");
  } catch (error) {
    console.error("Phone Signup Error:", error);
    showNotification("❌ Fehler beim Senden des Codes.", "error");
    if (recaptchaVerifier && recaptchaVerifier.render) recaptchaVerifier.render().then(id => grecaptcha.reset(id));
  }
}


async function confirmPhoneCode() {
  const code = document.getElementById("phone-code").value.trim();
  const name = document.getElementById("name").value.trim();
  if (!code) return showNotification("Bitte Code eingeben.", "error");
  try {
    const { user } = await window.confirmationResult.confirm(code);
    await updateProfile(user, { displayName: name });
    await set(ref(firebaseDb, 'users/' + user.uid), { name: name || "Phone User", phone: user.phoneNumber, createdAt: new Date().toISOString() });
    showNotification("✅ Erfolgreich mit Phone registriert/eingeloggt!", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, phone: user.phoneNumber, name: user.displayName }));
    setTimeout(() => window.location.href = "board.html", 1500);
  } catch (e) {
    showNotification("❌ Falscher Code oder Fehler.", "error"); console.error("Phone Confirm Error:", e);
  }
}