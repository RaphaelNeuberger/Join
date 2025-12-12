/**
 * @fileoverview Firebase login module with authentication
 * @module firebase-login
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

/** @type {Object} */
const app = initializeApp(window.firebaseConfig);

/** @type {Object} */
const auth = getAuth(app);

/** @type {Object} */
const db = getDatabase(app);

window.firebaseAuth = auth;
window.firebaseDb = db;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signInAnonymously = signInAnonymously;
window.RecaptchaVerifier = RecaptchaVerifier;
window.signInWithPhoneNumber = signInWithPhoneNumber;
window.updateProfile = updateProfile;
window.ref = ref;
window.set = set;
