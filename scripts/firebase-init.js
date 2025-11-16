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

const firebaseConfig = {
  apiKey: "AIzaSyBI4JD0XBE-srOGHaLT81iUZ6meuOjgV8M",
  authDomain: "join-60a91.firebaseapp.com",
  databaseURL:
    "https://join-60a91-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-60a91",
  storageBucket: "join-60a91.firebasedestorage.app",
  messagingSenderId: "1027472895369",
  appId: "1:1027472895369:web:254e2439fa85bc74d08558",
  measurementId: "G-K7ZPGG17YR",
};

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

console.info("Firebase initialized (firebase-init.js)");
