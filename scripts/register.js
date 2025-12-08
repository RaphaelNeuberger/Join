
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
        if (!firstInvalid.value) message = "Please enter your email address.";
        else message = "Please enter a valid email address.";
      } else if (firstInvalid.type === "checkbox") {
        message = "Please accept the privacy policy.";
      } else if (firstInvalid.type === "password") {
        message = "Please fill out this password field.";
      } else {
        message = "Please fill out this field.";
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
      showFormMessage(formKey, "Passwords do not match.", "error", document.getElementById("confirm-password"));
      return false;
    }
    if (pw.length < 6) {
      showFormMessage(formKey, "Password too weak (min. 6 characters).", "error", document.getElementById("signup-password"));
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
  // defensive check: addUser only proceeds if valid
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
    showNotification("Successfully registered!", "success");

    setTimeout(() => (window.location.href = "index.html?msg=Successfully registered"), 1200);
  } catch (e) {
    let m = "Registration error: " + (e.message || "Unknown error");
    if (e.code === "auth/email-already-in-use") m = "This email is already registered!";
    else if (e.code === "auth/weak-password") m = "Password too weak (min. 6 characters).";
    else if (e.code === "auth/invalid-email") m = "Invalid email address.";
    else if (e.code === "auth/network-request-failed") m = "Network error – check your connection.";

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
    showNotification("Successfully logged in!", "success");

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ uid: user.uid, email: user.email, name: user.displayName })
    );

    setTimeout(() => (window.location.href = "summary.html"), 900);
  } catch (e) {
    let msg = "Incorrect email or password.";
    if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password") msg = "Invalid credentials.";
    else if (e.code === "auth/invalid-email") msg = "Invalid email address.";

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

    showNotification("Logged in as guest.", "success");

    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ uid: user.uid, name: "", email: "guest@joinapp.local", isGuest: true })
    );

    setTimeout(() => (window.location.href = "summary.html"), 900);
  } catch (e) {
    showNotification("Guest login failed.", "error");
    console.error("Guest Login Error:", e);
  }
}


async function phoneSignup() {
  clearFormMessage("signup");
  initRecaptcha();
  const phoneEl = document.getElementById("phone");
  const phone = phoneEl ? phoneEl.value.trim() : "";
  if (!phone) {
    showFormMessage("signup", "Please enter a phone number.", "error", phoneEl);
    return;
  }
  try {
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    showFormMessage("signup", "SMS with code sent! Please enter the code.", "success");
  } catch (error) {
    console.error("Phone Signup Error:", error);
    showFormMessage("signup", "Error sending verification code.", "error");
    if (recaptchaVerifier && recaptchaVerifier.render) recaptchaVerifier.render().then((id) => grecaptcha.reset(id));
  }
}

async function confirmPhoneCode() {
  clearFormMessage("signup");
  const codeEl = document.getElementById("phone-code");
  const code = codeEl ? codeEl.value.trim() : "";
  if (!code) return showFormMessage("signup", "Please enter the code.", "error", codeEl);
  try {
    const { user } = await window.confirmationResult.confirm(code);
    await updateProfile(user, { displayName: document.getElementById("name").value.trim() || "Phone User" });
    await set(ref(firebaseDb, "users/" + user.uid), {
      name: user.displayName || "Phone User",
      phone: user.phoneNumber,
      createdAt: new Date().toISOString(),
    });
    showFormMessage("signup", "Successfully signed up with phone!", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, phone: user.phoneNumber, name: user.displayName }));
    setTimeout(() => (window.location.href = "board.html"), 900);
  } catch (e) {
    showFormMessage("signup", "Incorrect code or error.", "error");
    console.error("Phone Confirm Error:", e);
  }
}

function attachLiveHandlers() {
  ["form-login", "form-signup"].forEach((fid) => {
    const form = document.getElementById(fid);
    if (!form) return;
    form.addEventListener("input", (e) => {
      const formKey = fid === "form-login" ? "login" : "signup";
      clearFormMessage(formKey);
      if (e.target && e.target.matches("input")) e.target.classList.remove("input-error");

      if (fid === "form-signup") updateSignupButtonState();
    });
    form.addEventListener("invalid", (e) => {
      e.preventDefault();
      const formKey = fid === "form-login" ? "login" : "signup";
      let message = "";
      const input = e.target;
      if (input.type === "email") {
        message = input.value ? "Please enter a valid email address." : "Please enter your email address.";
      } else if (input.type === "checkbox") {
        message = "Please accept the privacy policy.";
      } else {
        message = "Please fill out this field.";
      }
      showFormMessage(formKey, message, "error", input);
    }, true);

    if (fid === "form-signup") updateSignupButtonState();
  });
}

function updateSignupButtonState() {
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const pwEl = document.getElementById("signup-password");
  const cpwEl = document.getElementById("confirm-password");
  const privacyEl = document.getElementById("privacy");
  const btn = document.getElementById("signup-submit-btn");

  const name = nameEl ? nameEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const pw = pwEl ? pwEl.value.trim() : "";
  const cpw = cpwEl ? cpwEl.value.trim() : "";
  const privacy = privacyEl ? privacyEl.checked : false;

  const allValid =
    name.length > 0 &&
    email.length > 0 &&
    pw.length >= 6 &&
    cpw.length >= 6 &&
    pw === cpw &&
    privacy;

  if (btn) {
    if (allValid) btn.classList.remove("inactive");
    else btn.classList.add("inactive");
  }
}

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
      if (validateFormAndShow(signupForm, "signup")) {
        addUser();
      }
    });

    const signupBtn = document.getElementById("signup-submit-btn");
    if (signupBtn) {
      signupBtn.addEventListener("click", (ev) => {
        validateFormAndShow(signupForm, "signup");
      });
    }
  }

  const privacyEl = document.getElementById("privacy");
  if (privacyEl) privacyEl.addEventListener("change", updateSignupButtonState);

  ["name","email","signup-password","confirm-password"].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateSignupButtonState);
  });

  setTimeout(() => attachLiveHandlers(), 500);
});
