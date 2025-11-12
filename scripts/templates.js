function includeSidebarHTML() {
  const placeholder = document.querySelector("[sidebar-html]");
  if (!placeholder) return;
  const src = placeholder.getAttribute("sidebar-html");
  fetch(src)
    .then((r) => r.text())
    .then((html) => {
      placeholder.outerHTML = html;
      requestAnimationFrame(() => {
        try {
          setupHeaderMenu();
        } catch (e) {}
      });
    })
    .catch(() => {});
}

function includeHeaderHTML() {
  const placeholder = document.querySelector("[header-html]");
  if (!placeholder) return;
  const src = placeholder.getAttribute("header-html");
  fetch(src)
    .then((r) => r.text())
    .then((html) => {
      placeholder.outerHTML = html;
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

  // close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("open")) return;
    if (!menu.contains(e.target) && e.target !== btn) toggle(false);
  });

  // close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
}
