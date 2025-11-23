// scripts/contacts.js
// Lädt Kontakte aus Firebase Realtime Database und rendert sie in .contact-list
(function () {
  async function init() {
    if (!window.firebaseDb || !window.ref || !window.get) {
      // firebase-init.js noch nicht geladen -> nochmal in 100ms versuchen
      setTimeout(init, 100);
      return;
    }

    try {
      await seedIfEmpty();
    } catch (e) {
      console.warn("Seed contacts failed:", e);
    }

    const contactsRef = window.ref(window.firebaseDb, "contacts");
    window.onValue(contactsRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      render(list);
    });
  }

  async function seedIfEmpty() {
    try {
      const snap = await window.get(
        window.child(window.ref(window.firebaseDb), "contacts")
      );
      if (!snap || !snap.exists()) {
        const samples = [
          {
            name: "Alexander Beck",
            email: "alexander.beck@example.com",
            phone: "+1 (555) 111-1111",
          },
          {
            name: "Beatrice Johnson",
            email: "beatrice.johnson@example.com",
            phone: "+1 (555) 222-2222",
          },
          {
            name: "Tatjana Wolf",
            email: "tatjana.wolf@example.com",
            phone: "+1 (555) 123-4567",
          },
        ];
        samples.forEach((c) =>
          window.push(window.ref(window.firebaseDb, "contacts"), c)
        );
      }
    } catch (err) {
      console.error("Error checking/seeding contacts:", err);
    }
  }

  let lastSelectedItem = null;

  function selectContact(contact, itemEl) {
    try {
      const logoEl = document.querySelector(".name-logo-large");
      const nameEl = document.querySelector(".name-large");
      const emailLabel = document.querySelector(".contact-information .para-3");
      const phoneLabel = document.querySelector(".contact-information .para-4");

      if (logoEl)
        logoEl.textContent = (contact.name || "")
          .split(" ")
          .map((s) => s.charAt(0))
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
      if (nameEl) nameEl.textContent = contact.name || "";
      if (emailLabel) emailLabel.textContent = contact.email || "";
      if (phoneLabel) phoneLabel.textContent = contact.phone || "";

      if (lastSelectedItem) lastSelectedItem.classList.remove("active-contact");
      if (itemEl) itemEl.classList.add("active-contact");
      lastSelectedItem = itemEl;
    } catch (e) {
      console.warn("selectContact error", e);
    }
  }

  function render(contacts) {
    const container =
      document.getElementById("contact-list") ||
      document.querySelector(".contact-list");
    if (!container) return;
    container.innerHTML = "";

    contacts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    let currentLetter = "";
    contacts.forEach((c, idx) => {
      const name = c.name || "";
      const letter = name.charAt(0).toUpperCase() || "#";
      if (letter !== currentLetter) {
        currentLetter = letter;
        const userList = document.createElement("div");
        userList.className = "user-list";
        userList.innerHTML = `<span>${escapeHtml(letter)}</span><hr />`;
        container.appendChild(userList);
      }

      const last = container.lastElementChild;
      const item = document.createElement("div");
      item.className = "contact-item";
      const initials = name
        .split(" ")
        .map((s) => s.charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

      item.innerHTML = `
        <span class="name-logo">${escapeHtml(initials)}</span>
        <div class="user">
          <span class="user-name">${escapeHtml(name)}</span><br />
          <span class="user-email">${escapeHtml(c.email || "")}</span>
        </div>
      `;
      // Klick-Handler: fülle das Info-Panel
      item.addEventListener("click", () => selectContact(c, item));
      last.appendChild(item);
      // Wenn erster Eintrag, automatisch auswählen
      if (idx === 0) {
        selectContact(c, item);
      }
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
