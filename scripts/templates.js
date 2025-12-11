function includeSidebarHTML() {
  let includeElements = document.querySelectorAll("[sidebar-html]");
  includeElements.forEach((el) => {
    let file = el.getAttribute("sidebar-html");
    fetch(file)
      .then((resp) => resp.text())
      .then((html) => {
        el.innerHTML = html;

        updateSidebarForLoginState();

        if (typeof highlightActiveSidebarLink === "function") {
          highlightActiveSidebarLink();
        }
      });
  });
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

  const toggle = (open) => {
    if (open) {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
    } else {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
    }
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggle(!menu.classList.contains("open"));
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    if (!menu.contains(e.target) && e.target !== btn) toggle(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
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

  if (!navAuth || !navGuest) {
    return;
  }

  const loggedInUser = localStorage.getItem("loggedInUser");

  if (loggedInUser) {

    navAuth.style.display = "flex";
    navGuest.style.display = "none";
  } else {

    navAuth.style.display = "none";
    navGuest.style.display = "flex";
  }
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

  if (!btn || !menu) {
    return; 
  }

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menu.classList.toggle("open");
    menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !btn.contains(event.target)) {
      if (menu.classList.contains("open")) {
        menu.classList.remove("open");
        menu.setAttribute("aria-hidden", "true");
        btn.setAttribute("aria-expanded", "false");
      }
    }
  });
}
