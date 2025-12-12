/**
 * @fileoverview User registration and authentication functionality
 * @module register
 */

/**
 * Firebase reCAPTCHA verifier instance
 * @type {RecaptchaVerifier|undefined}
 */
let recaptchaVerifier;

/**
 * Displays a notification message to the user
 * @param {string} message - The message to display
 * @param {string} [type='success'] - The notification type ('success' or 'error')
 */
function showNotification(message, type = "success") {
  const container = document.getElementById("notification-container");
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => notif.remove(), 3200);
}

/**
 * Clears form validation messages and error states
 * @param {string} formId - The form identifier ('login' or 'signup')
 */
function clearFormMessage(formId) {
  const el = document.getElementById(formId === "login" ? "login-message" : "signup-message");
  if (el) {
    el.textContent = "";
    el.classList.remove("error", "success");
    el.style.display = "none";
  }
  document.querySelectorAll(`#${formId === "login" ? "form-login" : "form-signup"} .input-group input`).forEach(i=>{
    i.classList.remove("input-error");
  });
}

/**
 * Displays a form validation message
 * @param {string} formId - The form identifier ('login' or 'signup')
 * @param {string} message - The message to display
 * @param {string} [type='error'] - The message type ('error' or 'success')
 * @param {HTMLElement|null} [inputEl=null] - The input element to highlight
 */
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

/**
 * Gets the appropriate validation message for an invalid input
 * @param {HTMLInputElement} input - The invalid input element
 * @returns {string} The validation message
 */
function getInvalidMessage(input) {
  if (input.type === "email") return input.value ? "Please enter a valid email address." : "Please enter your email address.";
  if (input.type === "checkbox") return "Please accept the privacy policy.";
  if (input.type === "password") return "Please fill out this password field.";
  return "Please fill out this field.";
}

/**
 * Validates signup password fields match and meet requirements
 * @param {string} formKey - The form key for error messages
 * @returns {boolean} Whether passwords are valid
 */
function validateSignupPasswords(formKey) {
  const pw = document.getElementById("signup-password").value.trim();
  const cpw = document.getElementById("confirm-password").value.trim();
  if (pw !== cpw) { showFormMessage(formKey, "Passwords do not match.", "error", document.getElementById("confirm-password")); return false; }
  if (pw.length < 6) { showFormMessage(formKey, "Password too weak (min. 6 characters).", "error", document.getElementById("signup-password")); return false; }
  return true;
}

/**
 * Validates a form and shows appropriate error messages
 * @param {HTMLFormElement} formEl - The form element to validate
 * @param {string} formKey - The form key ('login' or 'signup')
 * @returns {boolean} Whether the form is valid
 */
function validateFormAndShow(formEl, formKey) {
  if (!formEl.checkValidity()) {
    const firstInvalid = formEl.querySelector(":invalid");
    if (firstInvalid) { showFormMessage(formKey, getInvalidMessage(firstInvalid), "error", firstInvalid); return false; }
  }
  if (formKey === "signup") return validateSignupPasswords(formKey);
  return true;
}

/**
 * Initializes Firebase reCAPTCHA verifier for phone authentication
 */
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

/**
 * Gets user-friendly error message for registration errors
 * @param {Error} e - The Firebase error
 * @returns {string} The user-friendly error message
 */
function getAddUserErrorMessage(e) {
  if (e.code === "auth/email-already-in-use") return "This email is already registered!";
  if (e.code === "auth/weak-password") return "Password too weak (min. 6 characters).";
  if (e.code === "auth/invalid-email") return "Invalid email address.";
  if (e.code === "auth/network-request-failed") return "Network error – check your connection.";
  return "Registration error: " + (e.message || "Unknown error");
}

/**
 * Registers a new user with email and password
 * @async
 */
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
    await set(ref(firebaseDb, "users/" + user.uid), { name, email, createdAt: new Date().toISOString() });
    showNotification("Successfully registered!", "success");
    setTimeout(() => (window.location.href = "index.html?msg=Successfully registered"), 1200);
  } catch (e) { showNotification(getAddUserErrorMessage(e), "error"); }
}

/**
 * Gets user-friendly error message for login errors
 * @param {Error} e - The Firebase error
 * @returns {string} The user-friendly error message
 */
function getLoginErrorMessage(e) {
  if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password") return "Invalid credentials.";
  if (e.code === "auth/invalid-email") return "Invalid email address.";
  return "Incorrect email or password.";
}

/**
 * Logs in a user with email and password
 * @async
 */
async function login() {
  clearFormMessage("login");
  const form = document.getElementById("form-login");
  if (!validateFormAndShow(form, "login")) return;
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  try {
    const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
    showNotification("Successfully logged in!", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, email: user.email, name: user.displayName }));
    setTimeout(() => (window.location.href = "summary.html"), 900);
  } catch (e) { showNotification(getLoginErrorMessage(e), "error"); console.error("Login Error:", e); }
}

/**
 * Logs in a user as guest using anonymous authentication
 * @async
 */
async function guestLogin() {
  clearFormMessage("login");
  try {
    const { user } = await signInAnonymously(firebaseAuth);
    await set(ref(firebaseDb, "users/" + user.uid), { name: "Guest", email: "guest@joinapp.local", isGuest: true, createdAt: new Date().toISOString() });
    showNotification("Logged in as guest.", "success");
    localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, name: "", email: "guest@joinapp.local", isGuest: true }));
    setTimeout(() => (window.location.href = "summary.html"), 900);
  } catch (e) { showNotification("Guest login failed.", "error"); console.error("Guest Login Error:", e); }
}

/**
 * Initiates phone number signup with SMS verification
 * @async
 */
async function phoneSignup() {
  clearFormMessage("signup");
  initRecaptcha();
  const phoneEl = document.getElementById("phone");
  const phone = phoneEl ? phoneEl.value.trim() : "";
  if (!phone) { showFormMessage("signup", "Please enter a phone number.", "error", phoneEl); return; }
  try {
    window.confirmationResult = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier);
    showFormMessage("signup", "SMS with code sent! Please enter the code.", "success");
  } catch (error) {
    console.error("Phone Signup Error:", error);
    showFormMessage("signup", "Error sending verification code.", "error");
    if (recaptchaVerifier?.render) recaptchaVerifier.render().then((id) => grecaptcha.reset(id));
  }
}

/**
 * Saves phone user data to Firebase after successful verification
 * @async
 * @param {Object} user - The Firebase user object
 */
async function savePhoneUser(user) {
  const displayName = document.getElementById("name").value.trim() || "Phone User";
  await updateProfile(user, { displayName });
  await set(ref(firebaseDb, "users/" + user.uid), { name: user.displayName || "Phone User", phone: user.phoneNumber, createdAt: new Date().toISOString() });
  localStorage.setItem("loggedInUser", JSON.stringify({ uid: user.uid, phone: user.phoneNumber, name: user.displayName }));
}

/**
 * Confirms phone verification code and completes signup
 * @async
 */
async function confirmPhoneCode() {
  clearFormMessage("signup");
  const codeEl = document.getElementById("phone-code");
  const code = codeEl ? codeEl.value.trim() : "";
  if (!code) return showFormMessage("signup", "Please enter the code.", "error", codeEl);
  try {
    const { user } = await window.confirmationResult.confirm(code);
    await savePhoneUser(user);
    showFormMessage("signup", "Successfully signed up with phone!", "success");
    setTimeout(() => (window.location.href = "board.html"), 900);
  } catch (e) { showFormMessage("signup", "Incorrect code or error.", "error"); console.error("Phone Confirm Error:", e); }
}

/**
 * Handles input events on forms to clear validation messages
 * @param {string} fid - The form ID
 * @param {Event} e - The input event
 */
function handleFormInput(fid, e) {
  const formKey = fid === "form-login" ? "login" : "signup";
  clearFormMessage(formKey);
  if (e.target && e.target.matches("input")) e.target.classList.remove("input-error");
  if (fid === "form-signup") updateSignupButtonState();
}

/**
 * Handles invalid events on form inputs
 * @param {string} fid - The form ID
 * @param {Event} e - The invalid event
 */
function handleFormInvalid(fid, e) {
  e.preventDefault();
  const formKey = fid === "form-login" ? "login" : "signup";
  const input = e.target;
  showFormMessage(formKey, getInvalidMessage(input), "error", input);
}

/**
 * Attaches live validation handlers to login and signup forms
 */
function attachLiveHandlers() {
  ["form-login", "form-signup"].forEach((fid) => {
    const form = document.getElementById(fid);
    if (!form) return;
    form.addEventListener("input", (e) => handleFormInput(fid, e));
    form.addEventListener("invalid", (e) => handleFormInvalid(fid, e), true);
    if (fid === "form-signup") updateSignupButtonState();
  });
}

/**
 * Gets all signup form field values
 * @returns {Object} Object containing name, email, pw, cpw, and privacy values
 */
function getSignupFormValues() {
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  return { name: getVal("name"), email: getVal("email"), pw: getVal("signup-password"), cpw: getVal("confirm-password"), privacy: document.getElementById("privacy")?.checked || false };
}

/**
 * Updates the signup button state based on form validity
 */
function updateSignupButtonState() {
  const { name, email, pw, cpw, privacy } = getSignupFormValues();
  const btn = document.getElementById("signup-submit-btn");
  const allValid = name.length > 0 && email.length > 0 && pw.length >= 6 && cpw.length >= 6 && pw === cpw && privacy;
  if (btn) btn.classList.toggle("inactive", !allValid);
}

/**
 * Shows the signup form and hides the login form
 */
function showSignupForm() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("signup-form").classList.remove("hidden");
  clearFormMessage("signup");
}

/**
 * Shows the login form and hides the signup form
 */
function showLoginForm() {
  document.getElementById("signup-form").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
  clearFormMessage("login");
}

document.addEventListener("click", (e) => {
  if (!e.target) return;
  if (e.target.id === "toggle-form" || e.target.id === "toggle-form-2") showSignupForm();
  else if (e.target.id === "back-to-login") showLoginForm();
  else if (e.target.id === "guest-login-btn") guestLogin();
});

/**
 * Sets up the login form submit handler
 */
function setupLoginForm() {
  const loginForm = document.getElementById("form-login");
  if (loginForm) loginForm.addEventListener("submit", (ev) => { ev.preventDefault(); login(); });
}

/**
 * Sets up the signup form submit handler
 */
function setupSignupForm() {
  const signupForm = document.getElementById("form-signup");
  if (!signupForm) return;
  signupForm.addEventListener("submit", (ev) => { ev.preventDefault(); if (validateFormAndShow(signupForm, "signup")) addUser(); });
  const signupBtn = document.getElementById("signup-submit-btn");
  if (signupBtn) signupBtn.addEventListener("click", () => validateFormAndShow(signupForm, "signup"));
}

/**
 * Attaches input listeners to signup form fields for live validation
 */
function attachSignupInputListeners() {
  const privacyEl = document.getElementById("privacy");
  if (privacyEl) privacyEl.addEventListener("change", updateSignupButtonState);
  ["name", "email", "signup-password", "confirm-password"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateSignupButtonState);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachLiveHandlers();
  setupLoginForm();
  setupSignupForm();
  attachSignupInputListeners();
  setTimeout(() => attachLiveHandlers(), 500);
});
