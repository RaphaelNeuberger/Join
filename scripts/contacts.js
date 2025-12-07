// scripts/contacts.js
// Loads contacts from Firebase Realtime Database and renders them in .contact-list
(function () {
  let currentContact = null; // Stores the currently selected contact

  // Avatar-Farben (gleiche wie in task_tamplates.js)
  const AVATAR_COLORS = [
    "rgb(110, 82, 255)",
    "rgb(253, 112, 255)",
    "rgb(70, 47, 138)",
    "rgb(255, 188, 43)",
    "rgb(30, 214, 193)",
    "rgb(255, 123, 0)",
  ];

  function getAvatarColor(name = "") {
    if (!AVATAR_COLORS.length) {
      return "#ff7a00";
    }

    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const colorIndex = hash % AVATAR_COLORS.length;
    return AVATAR_COLORS[colorIndex];
  }

  async function checkEmailExists(email) {
    try {
      const snap = await window.get(
        window.child(window.ref(window.firebaseDb), "contacts")
      );
      if (!snap || !snap.exists()) {
        return false;
      }

      const contacts = snap.val();
      for (let id in contacts) {
        if (
          contacts[id].email &&
          contacts[id].email.toLowerCase() === email.toLowerCase()
        ) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }

  // Make checkEmailExists globally available
  window.checkEmailExists = checkEmailExists;

  async function init() {
    if (!window.firebaseDb || !window.ref || !window.get) {
      // firebase-init.js noch nicht geladen -> nochmal in 100ms versuchen
      setTimeout(init, 100);
      return;
    }

    try {
      await seedIfEmpty();
    } catch (e) {
      // Seed failed, continue with empty list
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
          {
            name: "David Eisenberg",
            email: "david.eisenberg@example.com",
            phone: "+1 (555) 333-3333",
          },
          {
            name: "Emma Fischer",
            email: "emma.fischer@example.com",
            phone: "+1 (555) 444-4444",
          },
          {
            name: "Marcel Bauer",
            email: "marcel.bauer@example.com",
            phone: "+1 (555) 555-5555",
          },
          {
            name: "Sofia Müller",
            email: "sofia.mueller@example.com",
            phone: "+1 (555) 666-6666",
          },
          {
            name: "Anton Mayer",
            email: "anton.mayer@example.com",
            phone: "+1 (555) 777-7777",
          },
          {
            name: "Anja Schulz",
            email: "anja.schulz@example.com",
            phone: "+1 (555) 888-8888",
          },
          {
            name: "Benedikt Ziegler",
            email: "benedikt.ziegler@example.com",
            phone: "+1 (555) 999-9999",
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
    currentContact = contact; // Speichere den aktuellen Kontakt

    // Check if mobile view
    const isMobile = window.innerWidth <= 1023;

    if (isMobile) {
      // Show mobile contact detail view
      showMobileContactDetail(contact);
      return;
    }

    // Desktop view: update info panel
    try {
      const logoEl = document.querySelector(".name-logo-large");
      const nameEl = document.querySelector(".name-large");
      const emailLabel = document.querySelector(".contact-information .para-3");
      const phoneLabel = document.querySelector(".contact-information .para-4");

      const initials = (contact.name || "")
        .split(" ")
        .map((s) => s.charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

      if (logoEl) {
        logoEl.textContent = initials;
        // Setze die Farbe basierend auf dem Namen
        logoEl.style.backgroundColor = getAvatarColor(contact.name || "");
      }
      if (nameEl) nameEl.textContent = contact.name || "";
      if (emailLabel) emailLabel.textContent = contact.email || "";
      if (phoneLabel) {
        phoneLabel.textContent = contact.phone || "";
        phoneLabel.href = `tel:${(contact.phone || "").replace(/\\s/g, "")}`;
      }

      if (lastSelectedItem) lastSelectedItem.classList.remove("active-contact");
      if (itemEl) itemEl.classList.add("active-contact");
      lastSelectedItem = itemEl;
    } catch (e) {
      // Selection failed, ignore
    }
  }

  // Make currentContact globally available
  window.getCurrentContact = function () {
    return currentContact;
  };

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

      const avatarColor = getAvatarColor(name);

      item.innerHTML = `
        <span class="name-logo" style="background-color: ${avatarColor}">${escapeHtml(
        initials
      )}</span>
        <div class="user">
          <div class="user-name">${escapeHtml(name)}</div>
          <div class="user-email">${escapeHtml(c.email || "")}</div>
        </div>
      `;
      // Click handler: fill the info panel
      item.addEventListener("click", () => selectContact(c, item));
      last.appendChild(item);
      // If first entry, select automatically
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

  // Toast Notification
  function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");

    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    }
  }

  // Mobile Contact Detail View
  function showMobileContactDetail(contact) {
    const mobileDetail = document.getElementById("mobileContactDetail");
    if (!mobileDetail) return;

    const isMobile = window.innerWidth <= 1023;
    if (!isMobile) return;

    // Update mobile view content
    const avatar = document.getElementById("mobileContactAvatar");
    const name = document.getElementById("mobileContactName");
    const email = document.getElementById("mobileContactEmail");
    const phone = document.getElementById("mobileContactPhone");

    if (avatar && name && email && phone) {
      const initials = contact.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

      const avatarColor = getAvatarColor(contact.name);

      avatar.textContent = initials;
      avatar.style.backgroundColor = avatarColor;
      name.textContent = contact.name;
      email.textContent = contact.email;
      email.href = `mailto:${contact.email}`;
      phone.textContent = contact.phone;
      phone.href = `tel:${contact.phone.replace(/\s/g, "")}`;
    }

    mobileDetail.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileContactDetail() {
    const mobileDetail = document.getElementById("mobileContactDetail");
    if (mobileDetail) {
      mobileDetail.classList.remove("active");
      document.body.style.overflow = "";
    }
    // Close menu if open
    const menu = document.getElementById("mobileContactMenu");
    if (menu) {
      menu.classList.remove("show");
    }
  }

  function toggleMobileContactMenu() {
    const menu = document.getElementById("mobileContactMenu");
    if (menu) {
      menu.classList.toggle("show");
    }
  }

  function editMobileContact() {
    // Close menu
    const menu = document.getElementById("mobileContactMenu");
    if (menu) {
      menu.classList.remove("show");
    }
    // Close mobile detail view
    closeMobileContactDetail();
    // Open edit dialog
    openEditContactDialog();
  }

  function deleteMobileContact() {
    // Close menu
    const menu = document.getElementById("mobileContactMenu");
    if (menu) {
      menu.classList.remove("show");
    }
    // Delete contact
    deleteCurrentContact();
  }

  // Make functions globally available
  window.showToast = showToast;
  window.showMobileContactDetail = showMobileContactDetail;
  window.closeMobileContactDetail = closeMobileContactDetail;
  window.toggleMobileContactMenu = toggleMobileContactMenu;
  window.editMobileContact = editMobileContact;
  window.deleteMobileContact = deleteMobileContact;
  window.getAvatarColor = getAvatarColor;
})();

// Dialog functions moved to contacts_dialogs.js
