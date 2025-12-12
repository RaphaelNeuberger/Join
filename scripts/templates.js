/**
 * @fileoverview HTML template includes and header/sidebar functionality
 * @module templates
 */

/**
 * Includes sidebar HTML from external file
 */
function includeSidebarHTML() {
  let includeElements = document.querySelectorAll("[sidebar-html]");
  includeElements.forEach((el) => {
    let file = el.getAttribute("sidebar-html");
    fetch(file)
      .then((resp) => resp.text())
      .then((html) => handleSidebarLoaded(el, html));
  });
}

/**
 * Handles sidebar HTML after loading
 * @param {HTMLElement} el - The placeholder element
 * @param {string} html - The loaded HTML content
 */
function handleSidebarLoaded(el, html) {
  el.innerHTML = html;
  updateSidebarForLoginState();
  if (typeof highlightActiveSidebarLink === "function") highlightActiveSidebarLink();
}

/**
 * Includes header HTML from external file
 */
function includeHeaderHTML() {
  const placeholder = document.querySelector("[header-html]");
  if (!placeholder) return;

  const src = placeholder.getAttribute("header-html");

  fetch(src)
    .then((r) => r.text())
    .then((html) => {
      placeholder.outerHTML = html;

      initHeaderUserMenu();
    })
    .catch(() => {});
}

/**
 * Sets up the header user menu click handlers
 */
function setupHeaderMenu() {
  const btn = document.getElementById("headerUserBtn");
  const menu = document.getElementById("userMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(menu, btn, !menu.classList.contains("open")); });
  document.addEventListener("click", (e) => handleOutsideClick(e, menu, btn));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(menu, btn, false); });
}

/**
 * Handles clicks outside the menu to close it
 * @param {Event} e - The click event
 * @param {HTMLElement} menu - The menu element
 * @param {HTMLElement} btn - The menu button element
 */
function handleOutsideClick(e, menu, btn) {
  if (menu.classList.contains("open") && !menu.contains(e.target) && e.target !== btn) toggleMenu(menu, btn, false);
}

/**
 * Toggles the menu open/close state
 * @param {HTMLElement} menu - The menu element
 * @param {HTMLElement} btn - The menu button element
 * @param {boolean} open - Whether to open the menu
 */
function toggleMenu(menu, btn, open) {
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", open ? "false" : "true");
  btn.setAttribute("aria-expanded", open ? "true" : "false");
}

/**
 * Highlights the active sidebar navigation link
 */
function highlightActiveSidebarLink() {
  const current = window.location.pathname.split("/").pop();
  const items = document.querySelectorAll(".nav-item");

  items.forEach((item) => {
    const link = item.getAttribute("href");
    if (link === current) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * Updates sidebar visibility based on login state
 */
function updateSidebarForLoginState() {
  const navAuth = document.querySelector(".nav-auth");
  const navGuest = document.querySelector(".nav-guest");
  if (!navAuth || !navGuest) return;
  const loggedIn = !!localStorage.getItem("loggedInUser");
  navAuth.style.display = loggedIn ? "flex" : "none";
  navGuest.style.display = loggedIn ? "none" : "flex";
}

/**
 * Signs out from Firebase authentication
 */
function signOutFirebase() {
  if (window.firebaseAuth && window.firebaseAuth.signOut) {
    firebaseAuth.signOut().catch((err) => {
      console.error("Firebase Logout Error:", err);
    });
  }
}

/**
 * Logs out the user and redirects to index
 */
function logout() {
  localStorage.removeItem("loggedInUser");
  signOutFirebase();
  window.location.href = "index.html";
}

/**
 * Initializes the header user menu
 */
function initHeaderUserMenu() {
  const btn = document.getElementById("headerUserBtn");
  const menu = document.getElementById("userMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", (event) => { event.stopPropagation(); toggleUserMenu(menu, btn); });
  document.addEventListener("click", (event) => { if (!menu.contains(event.target) && !btn.contains(event.target)) closeUserMenu(menu, btn); });
}

/**
 * Toggles the user menu open/close state
 * @param {HTMLElement} menu - The menu element
 * @param {HTMLElement} btn - The menu button element
 */
function toggleUserMenu(menu, btn) {
  const isOpen = menu.classList.toggle("open");
  menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

/**
 * Closes the user menu
 * @param {HTMLElement} menu - The menu element
 * @param {HTMLElement} btn - The menu button element
 */
function closeUserMenu(menu, btn) {
  if (!menu.classList.contains("open")) return;
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  btn.setAttribute("aria-expanded", "false");
}
