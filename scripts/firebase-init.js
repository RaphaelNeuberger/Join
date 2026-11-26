/**
 * @fileoverview Firebase initialization module
 * @module firebase-init
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  get,
  child,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

/** @type {Object} */
const app = initializeApp(window.firebaseConfig);

/** @type {Object} */
const auth = getAuth(app);

/** @type {Object} */
const db = getDatabase(app);

window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.dbRef = ref;
window.ref = ref;
window.set = set;
window.push = push;
window.onValue = onValue;
window.get = get;
window.child = child;
window.update = update;
window.remove = remove;

/**
 * Returns the ID token of the signed-in user for authenticated REST calls.
 * Waits until Firebase has restored the persisted session.
 * @async
 * @returns {Promise<string|null>} The ID token or null if nobody is signed in
 */
window.getAuthToken = async function getAuthToken() {
  await auth.authStateReady();
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
};
