(function () {
  let currentContact = null;

  const AVATAR_COLORS = [
    "rgb(110, 82, 255)",
    "rgb(253, 112, 255)",
    "rgb(70, 47, 138)",
    "rgb(255, 188, 43)",
    "rgb(30, 214, 193)",
    "rgb(255, 123, 0)",
  ];

  function getAvatarColor(name = "") {
    if (!AVATAR_COLORS.length) return "#ff7a00";
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }

  async function checkEmailExists(email) {
    try {
      const snap = await window.get(window.child(window.ref(window.firebaseDb), "contacts"));
      if (!snap || !snap.exists()) return false;
      const contacts = snap.val();
      return Object.values(contacts).some((c) => c.email && c.email.toLowerCase() === email.toLowerCase());
    } catch (error) { console.error("Error checking email:", error); return false; }
  }

  window.checkEmailExists = checkEmailExists;

  async function init() {
    if (!window.firebaseDb || !window.ref || !window.get) {
      setTimeout(init, 100);
      return;
    }

    try {
      await seedIfEmpty();
    } catch (e) {
    }

    const contactsRef = window.ref(window.firebaseDb, "contacts");
    window.onValue(contactsRef, (snapshot) => {
      const val = snapshot.val() || {};
      const list = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      render(list);
    });
  }

  const SAMPLE_CONTACTS = [
    { name: "Alexander Beck", email: "alexander.beck@example.com", phone: "+1 (555) 111-1111" },
    { name: "Beatrice Johnson", email: "beatrice.johnson@example.com", phone: "+1 (555) 222-2222" },
    { name: "Tatjana Wolf", email: "tatjana.wolf@example.com", phone: "+1 (555) 123-4567" },
    { name: "David Eisenberg", email: "david.eisenberg@example.com", phone: "+1 (555) 333-3333" },
    { name: "Emma Fischer", email: "emma.fischer@example.com", phone: "+1 (555) 444-4444" },
    { name: "Marcel Bauer", email: "marcel.bauer@example.com", phone: "+1 (555) 555-5555" },
    { name: "Sofia Müller", email: "sofia.mueller@example.com", phone: "+1 (555) 666-6666" },
    { name: "Anton Mayer", email: "anton.mayer@example.com", phone: "+1 (555) 777-7777" },
    { name: "Anja Schulz", email: "anja.schulz@example.com", phone: "+1 (555) 888-8888" },
    { name: "Benedikt Ziegler", email: "benedikt.ziegler@example.com", phone: "+1 (555) 999-9999" },
  ];

  async function seedIfEmpty() {
    try {
      const snap = await window.get(window.child(window.ref(window.firebaseDb), "contacts"));
      if (!snap || !snap.exists()) {
        SAMPLE_CONTACTS.forEach((c) => window.push(window.ref(window.firebaseDb, "contacts"), c));
      }
    } catch (err) { console.error("Error checking/seeding contacts:", err); }
  }

  let lastSelectedItem = null;

  function getInitials(name) {
    return (name || "").split(" ").map((s) => s.charAt(0)).filter(Boolean).slice(0, 2).join("").toUpperCase();
  }

  function updateDesktopContactDetail(contact) {
    const logoEl = document.querySelector(".name-logo-large");
    const nameEl = document.querySelector(".name-large");
    const emailLabel = document.querySelector(".contact-information .para-3");
    const phoneLabel = document.querySelector(".contact-information .para-4");
    if (logoEl) { logoEl.textContent = getInitials(contact.name); logoEl.style.backgroundColor = getAvatarColor(contact.name || ""); }
    if (nameEl) nameEl.textContent = contact.name || "";
    if (emailLabel) { emailLabel.textContent = contact.email || ""; emailLabel.href = `mailto:${contact.email || ""}`; }
    if (phoneLabel) { phoneLabel.textContent = contact.phone || ""; phoneLabel.href = `tel:${(contact.phone || "").replace(/\\s/g, "")}`; }
  }

  function selectContact(contact, itemEl) {
    currentContact = contact;
    if (window.innerWidth <= 1023) { showMobileContactDetail(contact); return; }
    try { updateDesktopContactDetail(contact); } catch (e) {}
    if (lastSelectedItem) lastSelectedItem.classList.remove("active-contact");
    if (itemEl) itemEl.classList.add("active-contact");
    lastSelectedItem = itemEl;
  }

  window.getCurrentContact = function () {
    return currentContact;
  };

  function createLetterSection(letter) {
    const userList = document.createElement("div");
    userList.className = "user-list";
    userList.innerHTML = `<span>${escapeHtml(letter)}</span><hr />`;
    return userList;
  }

  function createContactItem(contact) {
    const item = document.createElement("div");
    item.className = "contact-item";
    const initials = getInitials(contact.name);
    const avatarColor = getAvatarColor(contact.name || "");
    item.innerHTML = `<span class="name-logo" style="background-color: ${avatarColor}">${escapeHtml(initials)}</span><div class="user"><div class="user-name">${escapeHtml(contact.name || "")}</div><div class="user-email">${escapeHtml(contact.email || "")}</div></div>`;
    item.addEventListener("click", () => selectContact(contact, item));
    return item;
  }

  function render(contacts) {
    const container = document.getElementById("contact-list") || document.querySelector(".contact-list");
    if (!container) return;
    container.innerHTML = "";
    contacts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    let currentLetter = "";
    contacts.forEach((c, idx) => {
      const letter = (c.name || "").charAt(0).toUpperCase() || "#";
      if (letter !== currentLetter) { currentLetter = letter; container.appendChild(createLetterSection(letter)); }
      const item = createContactItem(c);
      container.lastElementChild.appendChild(item);
      if (idx === 0) selectContact(c, item);
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

  function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function updateMobileContactElements(contact) {
    const avatar = document.getElementById("mobileContactAvatar");
    const name = document.getElementById("mobileContactName");
    const email = document.getElementById("mobileContactEmail");
    const phone = document.getElementById("mobileContactPhone");
    if (!avatar || !name || !email || !phone) return;
    avatar.textContent = getInitials(contact.name);
    avatar.style.backgroundColor = getAvatarColor(contact.name);
    name.textContent = contact.name || "";
    email.textContent = contact.email || ""; email.href = `mailto:${contact.email || ""}`;
    phone.textContent = contact.phone || "N/A"; phone.href = `tel:${(contact.phone || "").replace(/\s/g, "")}`;
  }

  function showMobileContactDetail(contact) {
    const mobileDetail = document.getElementById("mobileContactDetail");
    if (!mobileDetail || window.innerWidth > 1023) return;
    if (!contact || !contact.name || !contact.email) { console.error("Invalid contact data:", contact); return; }
    updateMobileContactElements(contact);
    mobileDetail.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileContactDetail() {
    const mobileDetail = document.getElementById("mobileContactDetail");
    if (mobileDetail) { mobileDetail.classList.remove("active"); document.body.style.overflow = ""; }
    const menu = document.getElementById("mobileContactMenu");
    if (menu) menu.classList.remove("show");
  }

  function toggleMobileContactMenu() {
    const menu = document.getElementById("mobileContactMenu");
    if (menu) {
      menu.classList.toggle("show");
    }
  }

  function editMobileContact() {
    const menu = document.getElementById("mobileContactMenu");
    if (menu) menu.classList.remove("show");
    closeMobileContactDetail();
    openEditContactDialog();
  }

  function deleteMobileContact() {
    const menu = document.getElementById("mobileContactMenu");
    if (menu) menu.classList.remove("show");
    deleteCurrentContact();
  }

  window.showToast = showToast;
  window.showMobileContactDetail = showMobileContactDetail;
  window.closeMobileContactDetail = closeMobileContactDetail;
  window.toggleMobileContactMenu = toggleMobileContactMenu;
  window.editMobileContact = editMobileContact;
  window.deleteMobileContact = deleteMobileContact;
  window.getAvatarColor = getAvatarColor;
})();
