/**
 * @fileoverview Firebase configuration
 * @module config
 */

/** @constant {Object} */
const firebaseConfig = {
  apiKey: "AIzaSyAyj0MZ7iii2O2P51gg3s_1li_da2hIdPQ",
  authDomain: "join-issue-collector-c68f9.firebaseapp.com",
  databaseURL:
    "https://join-issue-collector-c68f9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-issue-collector-c68f9",
  storageBucket: "join-issue-collector-c68f9.firebasestorage.app",
  messagingSenderId: "353878554084",
  appId: "1:353878554084:web:6ec1bce992f43737fac3f1",
};

if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
}
