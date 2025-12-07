// Firebase initialization used by multiple pages (module)
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
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Expose commonly used DB functions on window so non-module scripts can use them
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
