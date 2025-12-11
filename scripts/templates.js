function includeSidebarHTML() {
  let includeElements = document.querySelectorAll("[sidebar-html]");
  includeElements.forEach((el) => {
    let file = el.getAttribute("sidebar-html");
    fetch(file)
      .then((resp) => resp.text())
      .then((html) => handleSidebarLoaded(el, html));
  });
}

function handleSidebarLoaded(el, html) {
  el.innerHTML = html;
  updateSidebarForLoginState();
  if (typeof highlightActiveSidebarLink === "function") highlightActiveSidebarLink();
}

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

function setupHeaderMenu() {
  const btn = document.getElementById("headerUserBtn");
  const menu = document.getElementById("userMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => { e.stopPropagation(); toggleMenu(menu, btn, !menu.classList.contains("open")); });
  document.addEventListener("click", (e) => handleOutsideClick(e, menu, btn));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(menu, btn, false); });
}

function handleOutsideClick(e, menu, btn) {
  if (menu.classList.contains("open") && !menu.contains(e.target) && e.target !== btn) toggleMenu(menu, btn, false);
}

function toggleMenu(menu, btn, open) {
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", open ? "false" : "true");
  btn.setAttribute("aria-expanded", open ? "true" : "false");
}

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

function updateSidebarForLoginState() {
  const navAuth = document.querySelector(".nav-auth");
  const navGuest = document.querySelector(".nav-guest");
  if (!navAuth || !navGuest) return;
  const loggedIn = !!localStorage.getItem("loggedInUser");
  navAuth.style.display = loggedIn ? "flex" : "none";
  navGuest.style.display = loggedIn ? "none" : "flex";
}

function signOutFirebase() {
  if (window.firebaseAuth && window.firebaseAuth.signOut) {
    firebaseAuth.signOut().catch((err) => {
      console.error("Firebase Logout Error:", err);
    });
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  signOutFirebase();
  window.location.href = "index.html";
}

function initHeaderUserMenu() {
  const btn = document.getElementById("headerUserBtn");
  const menu = document.getElementById("userMenu");
  if (!btn || !menu) return;
  btn.addEventListener("click", (event) => { event.stopPropagation(); toggleUserMenu(menu, btn); });
  document.addEventListener("click", (event) => { if (!menu.contains(event.target) && !btn.contains(event.target)) closeUserMenu(menu, btn); });
}

function toggleUserMenu(menu, btn) {
  const isOpen = menu.classList.toggle("open");
  menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
  btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function closeUserMenu(menu, btn) {
  if (!menu.classList.contains("open")) return;
  menu.classList.remove("open");
  menu.setAttribute("aria-hidden", "true");
  btn.setAttribute("aria-expanded", "false");
}
