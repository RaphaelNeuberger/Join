// scripts/register.js (updated)
// zentralisierte, obere Formular-Meldungen für alle Validierungs- und Backend-Fehler
function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => notif.remove(), 3200);
}

function clearFormMessage(formId) {
  const el = document.getElementById(formId === "login" ? "login-message" : "signup-message");
  if (el) {
    el.textContent = "";
    el.classList.remove("error", "success");
    el.style.display = "none";
  }
  // remove input error highlights
  document.querySelectorAll(`#${formId === "login" ? "form-login" : "form-signup"} .input-group input`).forEach(i=>{
    i.classList.remove("input-error");
  });
}

function showFormMessage(formId, message, type = "error", inputEl = null) {
  const el = document.getElementById(formId === "login" ? "login-message" : "signup-message");
  if (!el) {
    showNotification(message, type === "error" ? "error" : "success");
    return;
  }
  el.textContent = message;
  el.classList.remove("error", "success");
  el.classList.add(type === "error" ? "error" : "success");
  el.style.display = "block";
  if (inputEl) {
    inputEl.classList.add("input-error");
    inputEl.focus();
  }
}

/* Generic form validation helper: checks built-in validity and shows first invalid message at top */
function validateFormAndShow(formEl, formKey) {
  if (!formEl.checkValidity()) {
    const firstInvalid = formEl.querySelector(":invalid");
    if (firstInvalid) {
      let message = "";
      if (firstInvalid.type === "email") {
        if (!firstInvalid.value) message = "Bitte geben Sie Ihre E-Mail Adresse ein.";
        else message = "Bitte geben Sie eine gültige E-Mail Adresse ein.";
      } else if (firstInvalid.type === "checkbox") {
        message = "Bitte akzeptieren Sie die Datenschutzerklärung.";
      } else if (firstInvalid.type === "password") {
        message = "Bitte füllen Sie dieses Passwortfeld aus.";
      } else {
        message = "Bitte füllen Sie dieses Feld aus.";
      }
      showFormMessage(formKey, message, "error", firstInvalid);
      return false;
    }
  }
  // extra custom checks (e.g. passwords match)
  if (formKey === "signup") {
    const pw = document.getElementById("signup-password").value.trim();
    const cpw = document.getElementById("confirm-password").value.trim();
    if (pw !== cpw) {
      showFormMessage(formKey, "Passwörter stimmen nicht überein.", "error", document.getElementById("confirm-password"));
      return false;
    }
    if (pw.length < 6) {
      showFormMessage(formKey, "Passwort zu schwach (mind. 6 Zeichen).", "error", document.getElementById("signup-password"));
      return false;
    }
  }
  return true;
}

/* ---------- Firebase / Auth functions ---------- */
let recaptchaVerifier;
function initRecaptcha() {
  if (!recaptchaVerifier && typeof RecaptchaVerifier !== "undefined") {
    recaptchaVerifier = new RecaptchaVerifier(
      firebaseAuth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {},
        "expired-callback": () => {
          showNotification("reCAPTCHA expired – please reload.", "error");
        },
      }
    );
  }
}

async function addUser() {
  clearFormMessage("signup");
  const form = document.getElementById("form-signup");
  if (!validateFormAndShow(form, "signup")) return;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const pw = document.getElementById("signup-password").value.trim();

  try {
    const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, pw);
    await updateProfile(user, { displayName: name });
    await set(ref(firebaseDb, "users/" + user.uid), {
      name,
      email,
      createdAt: new Date().toISOString(),
    });
    showNotification("Erfolgreich registriert!", "success");

    setTimeout(() => (window.location.href = "index.html?msg=Successfully registered"), 1200);
  } catch (e) {
    let m = "Registrierungsfehler: " + (e.message || "Unbekannter Fehler");
    if (e.code === "auth/email-already-in-use") m = "Diese E-Mail ist bereits registriert!";
    else if (e.code === "auth/weak-password") m = "Passwort zu schwach (mind. 6 Zeichen).";
    else if (e.code === "auth/invalid-email") m = "Ungültige E-Mail Adresse.";
    else if (e.code === "auth/network-request-failed") m = "Netzwerkfehler – überprüfe Verbindung.";

    showNotification(m, "error");
  }
}


async function login() {
  clearFormMessage("login");
  const form = document.getElementById("form-login");
  if (!validateFormAndShow(form, "login")) return;

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    showNotification("Erfolgreich eingeloggt!", "success");

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ uid: user.uid, email: user.email, name: user.displayName })
    );

    setTimeout(() => (window.location.href = "summary.html"), 900);
  } catch (e) {
    let msg = "Falsche E-Mail oder Passwort.";
    if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password") msg = "Ungültige Zugangsdaten.";
    else if (e.code === "auth/invalid-email") msg = "Ungültige E-Mail Adresse.";

    // ⬇️ wieder über Notification
    showNotification(msg, "error");

    console.error("Login Error:", e);
  }
}


async function guestLogin() {
  clearFormMessage("login");

  try {
    const { user } = await signInAnonymously(firebaseAuth);

    await set(ref(firebaseDb, "users/" + user.uid), {
      name: "Guest",
      email: "guest@joinapp.local",
      isGuest: true,
      createdAt: new Date().toISOString(),
    });

    // ⬇️ wieder Notification
    showNotification("Als Gast eingeloggt.", "success");

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ uid: user.uid, name: "", email: "guest@joinapp.local", isGuest: true })
    );

    setTimeout(() => (window.location.href = "summary.html"), 900);
  } catch (e) {
    showNotification("Gast-Login fehlgeschlagen.", "error");
    console.error("Guest Login Error:", e);
  }
}


async function phoneSignup() {
  clearFormMessage("signup");
  initRecaptcha();
  const phoneEl = document.getElementById("phone");
  const phone = phoneEl ? phoneEl.value.trim() : "";
  if (!phone) {
    showFormMessage("signup", "Bitte geben Sie eine Telefonnummer ein.", "error", phoneEl);
    return;
  }
  try {
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    showFormMessage("signup", "SMS mit Code gesendet! Bitte Code eingeben.", "success");
  } catch (error) {
    console.error("Phone Signup Error:", error);
    showFormMessage("signup", "Fehler beim Senden des Codes.", "error");
    if (recaptchaVerifier && recaptchaVerifier.render) recaptchaVerifier.render().then((id) => grecaptcha.reset(id));
  }
}

async function confirmPhoneCode() {
  clearFormMessage("signup");
  const codeEl = document.getElementById("phone-code");
  const code = codeEl ? codeEl.value.trim() : "";
  if (!code) return showFormMessage("signup", "Bitte geben Sie den Code ein.", "error", codeEl);
  try {
    const { user } = await window.confirmationResult.confirm(code);
    await updateProfile(user, { displayName: document.getElementById("name").value.trim() || "Phone User" });
    await set(ref(firebaseDb, "users/" + user.uid), {
      name: user.displayName || "Phone User",
      phone: user.phoneNumber,
      createdAt: new Date().toISOString(),
    });
    showFormMessage("signup", "Erfolgreich per Telefon angemeldet!", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, phone: user.phoneNumber, name: user.displayName }));
    setTimeout(() => (window.location.href = "board.html"), 900);
  } catch (e) {
    showFormMessage("signup", "Falscher Code oder Fehler.", "error");
    console.error("Phone Confirm Error:", e);
  }
}

/* Live input handlers: clear top message when user types and mark inputs */
function attachLiveHandlers() {
  ["form-login", "form-signup"].forEach((fid) => {
    const form = document.getElementById(fid);
    if (!form) return;
    form.addEventListener("input", (e) => {
      const formKey = fid === "form-login" ? "login" : "signup";
      clearFormMessage(formKey);
      if (e.target && e.target.matches("input")) e.target.classList.remove("input-error");
    });
    // Show messages for invalid events (so browser required triggers appear at top)
    form.addEventListener("invalid", (e) => {
      e.preventDefault();
      const formKey = fid === "form-login" ? "login" : "signup";
      let message = "";
      const input = e.target;
      if (input.type === "email") {
        message = input.value ? "Bitte geben Sie eine gültige E-Mail Adresse ein." : "Bitte geben Sie Ihre E-Mail Adresse ein.";
      } else if (input.type === "checkbox") {
        message = "Bitte akzeptieren Sie die Datenschutzerklärung.";
      } else {
        message = "Bitte füllen Sie dieses Feld aus.";
      }
      showFormMessage(formKey, message, "error", input);
    }, true);
  });
}

/* UI toggles (Form switching) */
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "toggle-form") {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("signup-form").classList.remove("hidden");
    clearFormMessage("signup");
  } else if (e.target && e.target.id === "toggle-form-2") {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("signup-form").classList.remove("hidden");
    clearFormMessage("signup");
  } else if (e.target && e.target.id === "back-to-login") {
    document.getElementById("signup-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
    clearFormMessage("login");
  } else if (e.target && e.target.id === "guest-login-btn") {
    guestLogin();
  }
});

/* Form submit wiring */
document.addEventListener("DOMContentLoaded", () => {
  attachLiveHandlers();
  const loginForm = document.getElementById("form-login");
  const signupForm = document.getElementById("form-signup");

  if (loginForm) {
    loginForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      login();
    });
  }
  if (signupForm) {
    signupForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      addUser();
    });
  }

  // safety: if inputs are dynamically created later, reattach
  setTimeout(() => attachLiveHandlers(), 500);
});
