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
  const n = (v) => document.getElementById(v).value.trim(),
    name = n("name"),
    email = n("email"),
    pw = n("signup-password"),
    cpw = n("confirm-password");
  if (!name || !email || !pw || !cpw)
    return showNotification("Please fill out all fields.", "error");
  if (pw !== cpw)
    return showNotification("Passwords do not match!", "error");
  try {
    const { user } = await createUserWithEmailAndPassword(
      firebaseAuth,
      email,
      pw
    );
    await updateProfile(user, { displayName: name });
    await set(ref(firebaseDb, "users/" + user.uid), {
      name,
      email,
      createdAt: new Date().toISOString(),
    });
    showNotification("You have successfully registered!", "success");
    setTimeout(
      () => (window.location.href = "index.html?msg=Successfully registered"),
      2000
    );
  } catch (e) {
    let m = "Registration error: " + e.message;
    if (e.code === "auth/email-already-in-use")
      m = "This email is already registered!";
    else if (e.code === "auth/weak-password")
      m = "Password too weak (min. 6 characters).";
    else if (e.code === "auth/invalid-email") m = "Invalid email address.";
    else if (e.code === "auth/network-request-failed")
      m = "Network error – check internet or firewall.";
    else if (e.code === "auth/invalid-api-key")
      m = "Invalid API key – check config.";
    showNotification(m, "error");
  }
}

async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();
  if (!email || !password)
    return showNotification("Please fill out all fields.", "error");
  try {
    const { user } = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    showNotification("Successfully logged in!", "success");
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
      })
    );
    setTimeout(() => (window.location.href = "summary.html"), 1500);
  } catch (e) {
    let msg = "Incorrect email or password.";
    if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password")
      msg = "Incorrect credentials.";
    else if (e.code === "auth/invalid-email") msg = "Invalid email.";
    showNotification(msg, "error");
    console.error("Login Error:", e);
  }
}

async function guestLogin() {
  try {
    const { user } = await signInAnonymously(firebaseAuth);
    // In the database, guest can still be named "Guest" — but for UI we save no name.
    await set(ref(firebaseDb, "users/" + user.uid), {
      name: "Guest",
      email: "guest@joinapp.local",
      isGuest: true,
      createdAt: new Date().toISOString(),
    });
    showNotification("👋 Logged in as guest", "success");

    // Wichtig: lokal speichern wir name als leerer String => Summary zeigt nur "Good morning," ohne Namen
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        uid: user.uid,
        name: "",
        email: "guest@joinapp.local",
        isGuest: true,
      })
    );

    setTimeout(() => (window.location.href = "summary.html"), 1500);
  } catch (e) {
    showNotification("Guest login error.", "error");
    console.error("Guest Login Error:", e);
  }
}

async function phoneSignup() {
  initRecaptcha();
  const phone = document.getElementById("phone").value.trim();
  if (!phone)
    return showNotification(
      "Please enter phone number (e.g. +49123456789).",
      "error"
    );
  try {
    const confirmationResult = await signInWithPhoneNumber(
      firebaseAuth,
      phone,
      recaptchaVerifier
    );
    window.confirmationResult = confirmationResult;
    showNotification("SMS with code sent! Enter the code.", "success");
  } catch (error) {
    console.error("Phone Signup Error:", error);
    showNotification("Error sending code.", "error");
    if (recaptchaVerifier && recaptchaVerifier.render)
      recaptchaVerifier.render().then((id) => grecaptcha.reset(id));
  }
}

async function confirmPhoneCode() {
  const code = document.getElementById("phone-code").value.trim();
  const name = document.getElementById("name").value.trim();
  if (!code) return showNotification("Please enter code.", "error");
  try {
    const { user } = await window.confirmationResult.confirm(code);
    await updateProfile(user, { displayName: name });
    await set(ref(firebaseDb, "users/" + user.uid), {
      name: name || "Phone User",
      phone: user.phoneNumber,
      createdAt: new Date().toISOString(),
    });
    showNotification(
      "Successfully registered/logged in with phone!",
      "success"
    );
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({
        uid: user.uid,
        phone: user.phoneNumber,
        name: user.displayName,
      })
    );
    setTimeout(() => (window.location.href = "board.html"), 1500);
  } catch (e) {
    showNotification("Incorrect code or error.", "error");
    console.error("Phone Confirm Error:", e);
  }
}
