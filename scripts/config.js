// Firebase configuration
// NOTE: In production, these values should be stored in environment variables
// For this demo project, they are kept here for easier setup
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

// Make available globally for ES6 modules
if (typeof window !== "undefined") {
  window.firebaseConfig = firebaseConfig;
}
