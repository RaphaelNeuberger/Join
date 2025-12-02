// scripts/contacts.js
// Lädt Kontakte aus Firebase Realtime Database und rendert sie in .contact-list
(function () {
  let currentContact = null; // Speichert den aktuell ausgewählten Kontakt

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
      console.error("Fehler beim Überprüfen der E-Mail:", error);
      return false;
    }
  }

  // Mache checkEmailExists global verfügbar
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
    currentContact = contact; // Speichere den aktuellen Kontakt
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
      if (phoneLabel) phoneLabel.textContent = contact.phone || "";

      if (lastSelectedItem) lastSelectedItem.classList.remove("active-contact");
      if (itemEl) itemEl.classList.add("active-contact");
      lastSelectedItem = itemEl;
    } catch (e) {
      console.warn("selectContact error", e);
    }
  }

  // Mache currentContact global verfügbar
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

// Dialog functions
function openAddContactDialog() {
  const dialog = document.getElementById("addContactDialog");
  if (dialog) {
    dialog.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeAddContactDialog() {
  const dialog = document.getElementById("addContactDialog");
  if (dialog) {
    dialog.classList.remove("active");
    document.body.style.overflow = "";
    // Form zurücksetzen
    const form = document.getElementById("addContactForm");
    if (form) form.reset();
  }
}

// Form submit handler
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("addContactForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("newContactName").value.trim();
      const email = document.getElementById("newContactEmail").value.trim();
      const phone = document.getElementById("newContactPhone").value.trim();

      if (!name || !email || !phone) {
        alert("Please fill in all fields!");
        return;
      }

      // Prüfe E-Mail-Format (muss @ und Domain enthalten)
      const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address (e.g. name@domain.com)");
        return;
      }

      // Prüfe Telefonnummer-Format (mindestens 6 Ziffern)
      const phoneDigits = phone.replace(/[^0-9]/g, "");
      if (phoneDigits.length < 6) {
        alert("Please enter a valid phone number with at least 6 digits");
        return;
      }

      // Prüfe, ob E-Mail bereits existiert
      const emailExists = await window.checkEmailExists(email);
      if (emailExists) {
        alert("Contact already established with this email address");
        return;
      }

      try {
        // Neuen Kontakt zu Firebase hinzufügen
        const newContactRef = await window.push(
          window.ref(window.firebaseDb, "contacts"),
          {
            name,
            email,
            phone,
          }
        );

        // Dialog schließen
        closeAddContactDialog();

        // Zeige Erfolgsmeldung zuerst
        showSuccessMessage("Contact successfully created");

        // Warte 2 Sekunden, dann wähle den neuen Kontakt aus (nach der Meldung)
        setTimeout(() => {
          selectNewlyAddedContact(newContactRef.key, name, email, phone);
        }, 2000);

        console.log("Kontakt erfolgreich hinzugefügt!");
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Kontakts:", error);
        alert("Error adding contact. Please try again.");
      }
    });
  }

  // Edit Contact Form Handler
  const editForm = document.getElementById("editContactForm");
  if (editForm) {
    editForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const contact = window.getCurrentContact();
      if (!contact || !contact.id) {
        alert("No contact selected!");
        return;
      }

      const name = document.getElementById("editContactName").value.trim();
      const email = document.getElementById("editContactEmail").value.trim();
      const phone = document.getElementById("editContactPhone").value.trim();

      if (!name || !email || !phone) {
        alert("Please fill in all fields!");
        return;
      }

      // Prüfe Telefonnummer-Format (mindestens 6 Ziffern)
      const phoneDigits = phone.replace(/[^0-9]/g, "");
      if (phoneDigits.length < 6) {
        alert("Please enter a valid phone number with at least 6 digits");
        return;
      }

      try {
        // Warte bis Firebase bereit ist
        if (!window.set || !window.ref || !window.firebaseDb) {
          alert("Firebase is not ready yet. Please try again.");
          return;
        }

        // Kontakt in Firebase aktualisieren
        const contactRef = window.ref(
          window.firebaseDb,
          `contacts/${contact.id}`
        );

        await window.set(contactRef, {
          name: name,
          email: email,
          phone: phone,
        });

        console.log("Kontakt erfolgreich aktualisiert!");

        // Dialog schließen
        closeEditContactDialog();
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Kontakts:", error);
        console.error("Error details:", error.code, error.message);
        alert("Error updating contact: " + (error.message || "Unknown error"));
      }
    });
  }
});

// Edit Contact Dialog Functions
function openEditContactDialog() {
  const contact = window.getCurrentContact();
  if (!contact) {
    alert("Please select a contact first!");
    return;
  }

  const dialog = document.getElementById("editContactDialog");
  if (!dialog) return;

  // Formularfelder mit aktuellen Daten füllen
  document.getElementById("editContactName").value = contact.name || "";
  document.getElementById("editContactEmail").value = contact.email || "";
  document.getElementById("editContactPhone").value = contact.phone || "";

  // Avatar-Initialen setzen
  const avatar = document.getElementById("editContactAvatar");
  if (avatar) {
    const initials = (contact.name || "")
      .split(" ")
      .map((s) => s.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    avatar.textContent = initials;
  }

  dialog.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeEditContactDialog() {
  const dialog = document.getElementById("editContactDialog");
  if (dialog) {
    dialog.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function deleteContactFromDialog() {
  deleteCurrentContact();
  closeEditContactDialog();
}

async function deleteCurrentContact() {
  const contact = window.getCurrentContact();
  if (!contact || !contact.id) {
    alert("No contact selected!");
    return;
  }

  if (!confirm(`Do you really want to delete ${contact.name}?`)) {
    return;
  }

  try {
    // Warte bis Firebase bereit ist
    if (!window.remove || !window.ref || !window.firebaseDb) {
      alert("Firebase is not ready yet. Please try again.");
      return;
    }

    const contactRef = window.ref(window.firebaseDb, `contacts/${contact.id}`);
    await window.remove(contactRef);
    console.log("Kontakt erfolgreich gelöscht!");
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
    console.error("Error details:", error.code, error.message);
    alert("Error deleting contact: " + (error.message || "Unknown error"));
  }
}

// Hilfsfunktionen für neuen Kontakt
function selectNewlyAddedContact(id, name, email, phone) {
  const contact = { id, name, email, phone };

  // Suche das entsprechende contact-item Element
  const contactItems = document.querySelectorAll(".contact-item");
  let targetItem = null;

  contactItems.forEach((item) => {
    const nameEl = item.querySelector(".user-name");
    if (nameEl && nameEl.textContent === name) {
      targetItem = item;
    }
  });

  if (targetItem) {
    // Simuliere einen Klick auf das Element
    targetItem.click();
  }
}

function showSuccessMessage(message) {
  // Finde den info-contact-area Container
  const infoArea = document.querySelector(".info-contact-area");
  if (!infoArea) return;

  // Speichere den aktuellen Inhalt
  const originalContent = infoArea.innerHTML;

  // Ersetze den Inhalt mit der Erfolgsmeldung
  infoArea.innerHTML = `
    <div class="success-message-wrapper">
      <div class="contact-success-message">
        ${message}
      </div>
    </div>
  `;

  // Nach 2 Sekunden: Stelle den ursprünglichen Inhalt wieder her
  setTimeout(() => {
    infoArea.innerHTML = originalContent;
  }, 2000);
}
